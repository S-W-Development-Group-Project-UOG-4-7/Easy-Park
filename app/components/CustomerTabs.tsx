'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  id: string;
  label: string;
  href: string;
}

const tabs: Tab[] = [
  { id: 'view-bookings', label: 'Bookings', href: '/customer/view-bookings' },
  { id: 'profile', label: 'User Profile', href: '/customer/profile' },
  { id: 'my-bookings', label: 'MY Bookings', href: '/customer/my-bookings' },
];

export default function CustomerTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-gradient-to-br from-slate-200/50 via-slate-100/50 to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-900/50 border-b border-slate-300 dark:border-slate-600/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  px-6 py-4 text-sm font-medium transition-all duration-300 relative
                  ${
                    isActive
                      ? 'text-lime-600 dark:text-lime-400 border-b-2 border-lime-600 dark:border-lime-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 hover:scale-105'
                  }
                `}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-lime-500 to-lime-400"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

