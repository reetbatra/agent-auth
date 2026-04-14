import { NextRequest, NextResponse } from 'next/server';

function parseJwt(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { token, action } = await req.json();

  if (!token) {
    return NextResponse.json({ allowed: false, reason: 'No token provided' }, { status: 401 });
  }

  const payload = parseJwt(token);

  if (!payload) {
    return NextResponse.json({ allowed: false, reason: 'Invalid token' }, { status: 401 });
  }

  const scopes: string[] = (payload.scope ?? '').split(' ').filter(Boolean);
  const requiredScope = action === 'write' ? 'data:write' : 'data:read';

  if (!scopes.includes(requiredScope)) {
    return NextResponse.json({
      allowed: false,
      reason: `Missing scope: ${requiredScope}`,
      scopes,
    });
  }

  return NextResponse.json({
    allowed: true,
    reason: `Scope ${requiredScope} granted`,
    scopes,
  });
}
