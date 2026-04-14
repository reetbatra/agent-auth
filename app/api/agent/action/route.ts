import { NextRequest, NextResponse } from 'next/server';
import { appendActionLog } from '@/lib/actionLog';
import { parseJwt } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const { token, action, agentName } = await req.json();

  if (!token) {
    return NextResponse.json({ allowed: false, reason: 'No token provided' }, { status: 401 });
  }

  const payload = parseJwt(token);

  if (!payload) {
    return NextResponse.json({ allowed: false, reason: 'Invalid token' }, { status: 401 });
  }

  const scopes: string[] = (payload.scope ?? '').split(' ').filter(Boolean);
  const requiredScope = action === 'write' ? 'data:write' : 'data:read';
  const allowed = scopes.includes(requiredScope);
  const clientId = payload.sub ?? payload.azp ?? 'unknown';

  appendActionLog({
    event: allowed
      ? `${action === 'write' ? 'Write' : 'Read'} resource allowed`
      : `${action === 'write' ? 'Write' : 'Read'} resource denied`,
    actor: agentName ?? clientId,
    actorType: 'agent',
    success: allowed,
    ip: null,
    clientName: agentName ?? clientId,
    code: allowed ? 'action_allowed' : 'action_denied',
  });

  if (!allowed) {
    return NextResponse.json({ allowed: false, reason: `Missing scope: ${requiredScope}`, scopes });
  }

  return NextResponse.json({ allowed: true, reason: `Scope ${requiredScope} granted`, scopes });
}
