import { NextResponse } from 'next/server';
import { getActionLog } from '@/lib/actionLog';

async function getManagementToken(): Promise<string> {
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
  return data.access_token;
}

const EVENT_TYPES: Record<string, { label: string; type: 'human' | 'agent'; success: boolean }> = {
  s: { label: 'User login', type: 'human', success: true },
  slo: { label: 'User logout', type: 'human', success: true },
  f: { label: 'Failed login', type: 'human', success: false },
  flo: { label: 'Failed logout', type: 'human', success: false },
  ss: { label: 'User signup', type: 'human', success: true },
  sapi: { label: 'Token granted', type: 'agent', success: true },
  fapi: { label: 'Token denied', type: 'agent', success: false },
  scoa: { label: 'Auth success', type: 'human', success: true },
  fcoa: { label: 'Auth failed', type: 'human', success: false },
  sce: { label: 'Email changed', type: 'human', success: true },
  scp: { label: 'Password changed', type: 'human', success: true },
  limit_mu: { label: 'Rate limited', type: 'human', success: false },
  limit_wc: { label: 'Rate limited', type: 'human', success: false },
  seccft: { label: 'Agent token issued', type: 'agent', success: true },
  feccft: { label: 'Agent token failed', type: 'agent', success: false },
};

export async function GET() {
  try {
    const mgmtToken = await getManagementToken();

    const res = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/logs?per_page=50&sort=date%3A-1`,
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message ?? 'Failed to fetch logs' }, { status: res.status });
    }

    const logs = await res.json();

    const auth0Events = logs.map((log: Record<string, unknown>) => {
      const code = log.type as string;
      const meta = EVENT_TYPES[code] ?? { label: code, type: 'human', success: true };
      const user = log.user_name ?? log.user_id ?? (log.client_name as string) ?? 'Unknown';
      return {
        id: log.log_id,
        timestamp: log.date,
        event: meta.label,
        code,
        actor: user,
        actorType: meta.type,
        success: meta.success,
        ip: log.ip ?? null,
        clientName: log.client_name ?? null,
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
