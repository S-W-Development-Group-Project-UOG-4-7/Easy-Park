"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, CalendarDays, PlusSquare, LogOut, User, Menu, X } from "lucide-react";

export default function OwnerSidebar() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/land_owner" },
    { id: "bookings", label: "View Booking Details", icon: CalendarDays, href: "/land_owner/view_booking" },
    { id: "slots", label: "Add Slots", icon: PlusSquare, href: "/land_owner/add_slots" },
  ];

  // Open sign out confirmation modal
  const openSignOutModal = () => {
    setSidebarOpen(false); // Close sidebar if open
    setShowSignOutModal(true);
  };

  // Close sign out confirmation modal
  const closeSignOutModal = () => {
    setShowSignOutModal(false);
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    if (signingOut) return;
    
    setSigningOut(true);
    setShowSignOutModal(false);

    try {
      // Call the sign-out API to clear server-side session/cookies
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear any client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Redirect to home page using replace to prevent back navigation
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  };

  // Prevent background scroll when sign out modal is open
  useEffect(() => {
    if (!showSignOutModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSignOutModal]);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-[#0F172A] to-[#020617] border-r border-white/10 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#E5E7EB]"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Owner Profile Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#84CC16] to-[#BEF264] flex items-center justify-center">
              <User className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#E5E7EB]">John Doe</h2>
              <p className="text-sm text-[#94A3B8]">Lot Owner</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setActiveItem(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold shadow-lg shadow-lime-500/20"
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E5E7EB]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#0F172A]" : ""}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={openSignOutModal}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-[#94A3B8]">© 2024 EasyPark</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 bg-gradient-to-b from-[#0F172A] to-[#020617] p-4 sm:p-6 lg:p-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 text-[#E5E7EB]"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] mt-14 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E5E7EB] mb-4 text-center">Sidebar Navigation</h1>
          <p className="text-[#94A3B8] text-center mb-8 text-sm sm:text-base">Use the sidebar to navigate between pages</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <Link href="/land_owner" className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 hover:border-[#84CC16]/50 transition-all text-center">
              <Home className="w-6 h-6 sm:w-8 sm:h-8 text-[#84CC16] mx-auto mb-3" />
              <p className="text-[#E5E7EB] font-medium text-sm sm:text-base">Home</p>
            </Link>
            <Link href="/land_owner/view_booking" className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 hover:border-[#84CC16]/50 transition-all text-center">
              <CalendarDays className="w-6 h-6 sm:w-8 sm:h-8 text-[#84CC16] mx-auto mb-3" />
              <p className="text-[#E5E7EB] font-medium text-sm sm:text-base">View Bookings</p>
            </Link>
            <Link href="/land_owner/add_slots" className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 hover:border-[#84CC16]/50 transition-all text-center">
              <PlusSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#84CC16] mx-auto mb-3" />
              <p className="text-[#E5E7EB] font-medium text-sm sm:text-base">Add Slots</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Sign Out Confirmation Modal - Using Portal to render at body level */}
      {showSignOutModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeSignOutModal}
          />
          
          {/* Modal - Centered on screen */}
          <div className="relative z-[10000] mx-4 w-full max-w-md rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
            {/* Warning Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-500/40">
              <svg
                className="h-7 w-7 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-center text-xl font-bold text-white">
              Sign Out
            </h3>

            {/* Message */}
            <p className="mb-6 text-center text-slate-400">
              Are you sure you want to sign out? You will need to sign in again to access your account.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeSignOutModal}
                className="flex-1 rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/30 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
