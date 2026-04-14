'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading profile…</p>
      </main>
    );
  }

  const roles: string[] = (user['agentauth/roles'] as string[]) ?? [];
  const role = roles.includes('admin') ? 'admin' : 'user';

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
          <a href="/api/auth/logout">
            <Button variant="outline" size="sm" className="cursor-pointer text-xs">
              Sign out
            </Button>
          </a>
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
            <Row label="Name" value={user.name ?? '—'} />
            <Row label="Email" value={user.email ?? '—'} />
            <Row label="Subject" value={user.sub ?? '—'} mono />
            <Row label="Email verified" value={user.email_verified ? 'Yes' : 'No'} />
          </CardContent>
        </Card>

        {/* Decoded token */}
        <Card className="shadow-none border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Decoded ID Token</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-[11px] leading-relaxed text-gray-600 overflow-auto whitespace-pre-wrap font-mono">
              {JSON.stringify(user, null, 2)}
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
