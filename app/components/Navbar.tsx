'use client';

import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const navLinks = [
  { href: '/customer/view-bookings', label: 'Bookings' },
  { href: '/customer/my-bookings', label: 'History' },
  { href: '/customer/profile', label: 'My Profile' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-20 w-full border-b border-slate-300/60 bg-linear-to-br from-slate-200 via-slate-100 to-slate-200 text-slate-900 transition-colors duration-300 dark:border-slate-700/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold bg-linear-to-r from-lime-500 to-lime-400 bg-clip-text text-transparent transition-opacity duration-300 hover:opacity-80 dark:from-lime-400 dark:to-lime-300"
        >
          EasyPark
        </Link>

        {/* Nav links */}
        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? 'text-lime-700 dark:text-lime-300'
                    : 'text-slate-800 hover:text-lime-700 dark:text-slate-300 dark:hover:text-lime-300'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-lime-500 to-lime-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="rounded-lg border p-2 transition-all hover:scale-105 border-slate-300/60 bg-slate-100/50 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}

