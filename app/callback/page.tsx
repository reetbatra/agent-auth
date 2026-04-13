'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import oktaAuth from '@/lib/oktaClient';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    oktaAuth.handleLoginRedirect().then(() => {
      router.push('/profile');
    }).catch((err) => {
      console.error('Callback error:', err);
      router.push('/');
    });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Completing sign-in…</p>
    </main>
  );
}
