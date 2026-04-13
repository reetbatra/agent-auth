'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import oktaAuth from '@/lib/oktaClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserClaims {
  name?: string;
  email?: string;
  sub?: string;
  groups?: string[];
  exp?: number;
  [key: string]: unknown;
}

export default function ProfilePage() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<UserClaims | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const authState = oktaAuth.authStateManager.getAuthState();
      if (!authState?.isAuthenticated) {
        router.push('/');
        return;
      }

      const claims = await oktaAuth.getUser() as UserClaims;
      setIdToken(claims);

      const at = await oktaAuth.tokenManager.get('accessToken') as
        | { accessToken: string; expiresAt: number }
        | undefined;
      if (at) {
        setAccessToken(at.accessToken);
        setExpiry(at.expiresAt);
      }

      setLoading(false);
    };

    oktaAuth.authStateManager.subscribe((authState) => {
      if (!authState.isAuthenticated) router.push('/');
    });
    oktaAuth.start();
    load();
  }, [router]);

  useEffect(() => {
    if (!expiry) return;
    const tick = () => setSecondsLeft(expiry - Math.floor(Date.now() / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  const handleLogout = async () => {
    await oktaAuth.signOut();
  };

  const role = idToken?.groups?.includes('admin') ? 'admin' : 'user';

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-xl mx-auto space-y-5">

        {/* Nav */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Agent<span className="text-blue-600">Auth</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Human Identity — Screen 1 of 3</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="cursor-pointer text-xs">
            Sign out
          </Button>
        </div>

        {/* Identity */}
        <Card className="shadow-none border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-gray-700">
              Identity Claims
              <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {role}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Name" value={idToken?.name ?? '—'} />
            <Row label="Email" value={idToken?.email ?? '—'} />
            <Row label="Subject" value={idToken?.sub ?? '—'} mono />
            <Row label="Groups" value={idToken?.groups?.join(', ') ?? 'none'} />
          </CardContent>
        </Card>

        {/* Access Token */}
        <Card className="shadow-none border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-gray-700">
              Access Token
              {secondsLeft !== null && (
                <span className={`text-xs font-normal tabular-nums ${secondsLeft < 60 ? 'text-red-500' : 'text-gray-400'}`}>
                  {secondsLeft > 0 ? `Expires in ${secondsLeft}s` : 'Expired'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-[11px] leading-relaxed text-gray-600 overflow-auto whitespace-pre-wrap break-all font-mono">
              {accessToken ?? 'No token found'}
            </pre>
          </CardContent>
        </Card>

        {/* Full decoded token */}
        <Card className="shadow-none border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Decoded ID Token</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-[11px] leading-relaxed text-gray-600 overflow-auto whitespace-pre-wrap font-mono">
              {JSON.stringify(idToken, null, 2)}
            </pre>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-6 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`text-gray-800 text-right ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </span>
    </div>
  );
}
