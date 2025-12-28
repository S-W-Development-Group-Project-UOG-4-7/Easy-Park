'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: '/customer/view-bookings', label: 'Book Now' },
    { href: '/customer/my-bookings', label: 'Bookings' },
  ];

  // ✅ Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ✅ Prevent background scroll when mobile menu open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const linkClasses =
    'relative px-3 py-2 text-sm font-semibold transition-colors duration-300 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white';

  const activePillClasses =
    'absolute inset-x-2 -bottom-0.5 h-1 rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]';

  const renderLinks = (direction: 'row' | 'col') => (
    <div
      className={
        direction === 'row'
          ? 'hidden items-center gap-2 md:flex'
          : 'flex flex-col gap-2 md:hidden'
      }
    >
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            onClick={() => setOpen(false)}
            className={
              direction === 'col'
                ? `relative w-full rounded-2xl px-4 py-3 text-base font-semibold border border-slate-800/70
                   bg-[#111827]/40 text-slate-100 hover:bg-[#111827]/60 transition`
                : linkClasses
            }
          >
            <span className="relative flex items-center justify-center md:justify-start">
              {link.label}
              {isActive && direction === 'row' && <span className={activePillClasses} />}
              {isActive && direction === 'col' && (
                <span className="ml-auto text-xs font-bold text-lime-300">ACTIVE</span>
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 backdrop-blur-lg">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#84CC16] to-[#BEF264] text-slate-900 shadow-lg shadow-lime-200/40 ring-1 ring-lime-200/60 dark:shadow-lime-900/30">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M5 16h14l-1.5-7H6.5L5 16Z" />
                <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
                <path d="M9 11h6" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                EasyPark
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Smart Parking
              </span>
            </div>

          </div>



          {/* Centered Nav Links */}
          <div className="absolute left-1/2 -translate-x-1/2">
            {renderLinks('row')}
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#111827]/70 text-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
              aria-label="Notifications"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-lime-400"></span>
            </button>

            <div className="h-10 w-10 rounded-full border border-slate-700 bg-slate-800/70 flex items-center justify-center text-slate-400">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-[#111827]/70 text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
              aria-expanded={open}
              aria-label="Toggle navigation"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu Overlay + Panel */}
      {open && (
        <div className="md:hidden">
          {/* backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* dropdown panel */}
          <div className="relative z-40 mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
            <div className="mt-3 rounded-3xl border border-slate-800/70 bg-gradient-to-br from-[#1E293B]/95 to-[#0F172A]/95 p-4 shadow-2xl ring-1 ring-slate-900/60 backdrop-blur-md">
              {renderLinks('col')}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
