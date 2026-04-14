import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { agent } = await req.json();

  const clientId =
    agent === 'reader'
      ? process.env.AUTH0_READER_CLIENT_ID
      : process.env.AUTH0_WRITER_CLIENT_ID;

  const clientSecret =
    agent === 'reader'
      ? process.env.AUTH0_READER_CLIENT_SECRET
      : process.env.AUTH0_WRITER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Agent credentials not configured' }, { status: 500 });
  }

  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: process.env.AUTH0_AUDIENCE,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error_description ?? 'Failed to fetch token' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ access_token: data.access_token });
}
