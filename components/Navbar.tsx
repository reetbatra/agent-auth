'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/profile', label: 'Profile' },
  { href: '/agents', label: 'AI Agents' },
  { href: '/audit', label: 'Audit Log' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/profile" className="text-base font-semibold text-gray-900">
          Agent<span className="text-blue-600">Auth</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                pathname === href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="/auth/logout"
            className="text-xs px-3 py-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-2"
          >
            Sign out
          </a>
        </nav>
      </div>
    </header>
  );
}
