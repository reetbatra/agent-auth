'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import oktaAuth from '@/lib/oktaClient';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    oktaAuth.authStateManager.subscribe((authState) => {
      if (authState.isAuthenticated) router.push('/profile');
    });
    oktaAuth.start();
  }, [router]);

  const handleLogin = async () => {
    await oktaAuth.signInWithRedirect();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center space-y-8">

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Powered by Okta
        </span>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-950">
            Agent<span className="text-blue-600">Auth</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Humans and AI agents — both authenticated through Okta,
            scoped differently, and fully auditable in one place.
          </p>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleLogin}
          className="w-full h-11 text-sm font-medium cursor-pointer"
        >
          Login with Okta
        </Button>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { icon: '🔐', label: 'OIDC + PKCE' },
            { icon: '🤖', label: 'M2M Agents' },
            { icon: '📋', label: 'Audit Log' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full"
            >
              {icon} {label}
            </span>
          ))}
        </div>

      </div>
    </main>
  );
}
