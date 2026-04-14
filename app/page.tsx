'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/profile');
  }, [user, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center space-y-8">

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Powered by Auth0
        </span>

        <div className="space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-950">
            Agent<span className="text-blue-600">Auth</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Humans and AI agents — both authenticated through Auth0,
            scoped differently, and fully auditable in one place.
          </p>
        </div>

        <a href="/auth/login">
          <Button size="lg" className="w-full h-11 text-sm font-medium cursor-pointer">
            Login with Auth0
          </Button>
        </a>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { icon: '🔐', label: 'OIDC + PKCE', sub: 'Human login' },
            { icon: '🤖', label: 'M2M Agents', sub: 'AI identity' },
            { icon: '📋', label: 'Audit Log', sub: 'Every event' },
          ].map(({ icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-2"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium text-gray-700">{label}</span>
              <span className="text-[10px] text-gray-400">{sub}</span>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
