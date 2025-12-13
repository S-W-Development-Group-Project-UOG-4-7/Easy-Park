'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/customer/view-bookings', label: 'Bookings' },
    { href: '/customer/my-bookings', label: 'History' },
    { href: '/customer/profile', label: 'User Profile' },
   
  ];

  return (
    <nav className="w-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 border-b border-slate-300 dark:border-slate-700/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-lime-500 to-lime-400 dark:from-lime-400 dark:to-lime-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-300">
            EasyPark
          </Link>

          {/* Nav Links - Center */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 text-sm font-medium transition-all duration-300
                    ${
                      isActive
                        ? 'text-lime-600 dark:text-lime-400'
                        : 'text-slate-700 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400'
                    }
                    hover:scale-105
                  `}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-500 to-lime-400"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

