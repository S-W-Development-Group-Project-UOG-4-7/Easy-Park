'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Parking Management', href: '/parking', icon: '🚗' },
  { name: 'Reports', href: '/reports', icon: '📈' },
  { name: 'Analytics', href: '/analytics', icon: '📉' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-slate-900 font-semibold lg:hidden shadow-lg shadow-lime-500/50"
        aria-label="Toggle menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-[#E5E7EB] transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 shadow-2xl border-r border-slate-800/50`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo/Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">
              Parking Counter
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-[#94A3B8] hover:text-[#E5E7EB] transition-colors"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) {
                      setIsOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-slate-900 shadow-lg shadow-lime-500/50 font-semibold'
                      : 'text-[#94A3B8] hover:bg-slate-800/50 hover:text-[#E5E7EB]'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-slate-700/50">
            <p className="text-sm text-[#94A3B8] text-center">
              © 2024 Parking Counter
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

