'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar({ userName }: { userName: string }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const links = [
    { href: '/discover', label: '🔥', title: 'Discover' },
    { href: '/matches', label: '❤️', title: 'Matches' },
    { href: '/profile', label: '🐾', title: 'My Pet' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/discover" className="font-bold text-xl text-pink-500">
          PetsInvasion
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, title }) => (
            <Link
              key={href}
              href={href}
              title={title}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-xl transition
                ${pathname === href ? 'bg-pink-50 scale-110' : 'hover:bg-gray-50'}`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="ml-2 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            {userName.split(' ')[0]}
          </button>
        </div>
      </div>
    </nav>
  );
}
