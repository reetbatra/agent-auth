'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const steps = [
  { step: '01', title: 'Human Login', desc: 'Sign in with your account. See your decoded identity token and claims.' },
  { step: '02', title: 'AI Agent Panel', desc: 'Two machine agents with different scopes. Fetch their tokens, try actions, see allow or deny.' },
  { step: '03', title: 'Audit Log', desc: 'Unified timeline of every human login and agent action in real time.' },
];

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
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg space-y-10">

        {/* Hero */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Powered by Auth0
          </span>
          <h1 className="text-5xl font-semibold tracking-tight text-gray-950">
            Agent<span className="text-blue-600">Auth</span>
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-sm mx-auto">
            Humans and AI agents — both authenticated, scoped, and auditable in one place.
          </p>
          <a href="/auth/login">
            <Button size="lg" className="w-full h-11 text-sm font-medium cursor-pointer mt-2">
              Login with Auth0
            </Button>
          </a>
        </div>

        {/* Demo steps */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4 px-5 py-4 bg-white">
              <span className="text-xs font-mono text-gray-300 mt-0.5 shrink-0">{step}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
