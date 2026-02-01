'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen transition-colors duration-300 dark:bg-linear-to-br dark:from-[#0F172A] dark:to-[#020617] bg-linear-to-br from-[#F9FAFB] to-[#E5E7EB]">
      <AdminSidebar adminName="Admin User" />
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 z-50 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AdminSidebar adminName="Admin User" onLinkClick={() => setMobileMenuOpen(false)} />
      </div>
      <div className="lg:ml-64 flex-1 w-full">
        <div className="sticky top-0 z-20 border-b transition-colors duration-300 dark:border-slate-800/60 border-slate-200/60 bg-linear-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6] backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg border p-2 transition-all hover:scale-105 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 border-slate-200/60 bg-slate-50/50 text-slate-700"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex-1" />
            <button
              onClick={toggleTheme}
              className="rounded-lg border p-2 transition-all hover:scale-105 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 border-slate-200/60 bg-slate-50/50 text-slate-700"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
