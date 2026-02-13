'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { TrendingUp, Bell, User, Search } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Deals', icon: TrendingUp },
  { href: '/compare', label: 'Compare', icon: Search },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🪙</span>
            <span className="text-xl font-bold">
              <span className="gold-shimmer">Gold</span>
              <span className="text-zinc-400">Tracker</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-gold-500/20 text-gold-500'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
