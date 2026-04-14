import { NextResponse } from 'next/server';
import { getActionLog } from '@/lib/actionLog';

let cachedMgmtToken: { token: string; expiresAt: number } | null = null;

async function getManagementToken(): Promise<string> {
  if (cachedMgmtToken && Date.now() < cachedMgmtToken.expiresAt) {
    return cachedMgmtToken.token;
  }
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    }),
  });
  const data = await res.json();
  // Cache with a 60s buffer before actual expiry
  cachedMgmtToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

const EVENT_MAP: Record<string, { label: string; type: 'human' | 'agent'; success: boolean }> = {
  // Human login events
  s:         { label: 'User login',           type: 'human', success: true  },
  slo:       { label: 'User logout',          type: 'human', success: true  },
  f:         { label: 'Failed login',         type: 'human', success: false },
  flo:       { label: 'Failed logout',        type: 'human', success: false },
  ss:        { label: 'User signup',          type: 'human', success: true  },
  scoa:      { label: 'Auth success',         type: 'human', success: true  },
  fcoa:      { label: 'Auth failed',          type: 'human', success: false },
  ssa:       { label: 'Silent auth success',  type: 'human', success: true  },
  fsa:       { label: 'Silent auth failed',   type: 'human', success: false },
  // Agent / M2M events
  seccft:    { label: 'Agent token issued',   type: 'agent', success: true  },
  feccft:    { label: 'Agent token failed',   type: 'agent', success: false },
  sapi:      { label: 'API token granted',    type: 'agent', success: true  },
  fapi:      { label: 'API token denied',     type: 'agent', success: false },
};

// Event codes to skip — management API noise from our own log fetches
const SKIP_CODES = new Set(['mgmt_api_read', 'slo']);

export async function GET() {
  try {
    const mgmtToken = await getManagementToken();

    const res = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/logs?per_page=100&sort=date%3A-1`,
      {
        headers: { Authorization: `Bearer ${mgmtToken}` },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message ?? 'Failed to fetch logs' }, { status: res.status });
    }

    const raw = await res.json();

    const auth0Events = raw
      .filter((log: Record<string, unknown>) => {
        const code = log.type as string;
        // Skip management API noise and events from our own mgmt client
        if (SKIP_CODES.has(code)) return false;
        if (log.client_id === process.env.AUTH0_MGMT_CLIENT_ID) return false;
        return true;
      })
      .map((log: Record<string, unknown>) => {
        const code = log.type as string;
        const meta = EVENT_MAP[code] ?? { label: code, type: 'human', success: true };
        const actor =
          (log.user_name as string) ??
          (log.user_id as string) ??
          (log.client_name as string) ??
          'Unknown';
        return {
          id: log.log_id,
          timestamp: log.date,
          event: meta.label,
          code,
          actor,
          actorType: meta.type,
          success: meta.success,
          ip: (log.ip as string) ?? null,
          clientName: (log.client_name as string) ?? null,
          source: 'auth0',
        };
      });

    // Merge with internal action log (scope enforcement events)
    const internalEvents = getActionLog().map((e) => ({ ...e, source: 'internal' }));

    const merged = [...internalEvents, ...auth0Events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(merged);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
