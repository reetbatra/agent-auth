import { NextRequest, NextResponse } from 'next/server';
import { appendActionLog } from '@/lib/actionLog';

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  appendActionLog({
    event: 'User login',
    actor: email ?? name ?? 'Unknown',
    actorType: 'human',
    success: true,
    ip: req.headers.get('x-forwarded-for') ?? null,
    clientName: 'AgentAuth',
    code: 's',
  });
  return NextResponse.json({ ok: true });
}
