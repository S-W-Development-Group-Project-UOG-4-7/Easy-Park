"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  ParkingSquare,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ViewKey = "dashboard" | "parking" | "reports" | "analytics";

const navItems: { key: ViewKey; label: string; icon: LucideIcon }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "parking", label: "Parking Management", icon: ParkingSquare },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({
  activeView,
  onNavigate,
}: {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
}) {
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/5 bg-gradient-to-b from-[#0E1628] via-[#0B1220] to-[#09101B] px-4 py-6 shadow-2xl">
      <div className="px-2">
        <h1 className="text-lg font-semibold tracking-wide text-lime-300">
          Parking Counter
        </h1>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-lime-400/90 text-slate-900 shadow-lg shadow-lime-500/30"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-slate-900" : "text-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto w-full px-2 pb-4">
        <button
          type="button"
          onClick={() => setShowSignOutModal(true)}
          disabled={signingOut}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
        <div className="mt-4 text-xs text-slate-500">© 2024 Parking Counter</div>
      </div>

      {showSignOutModal && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSignOutModal(false)}
            />
            <div className="relative z-[10000] mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
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

              <h3 className="mb-2 text-center text-xl font-bold text-white">Sign Out</h3>
              <p className="mb-6 text-center text-white/60">
                Are you sure you want to sign out? You will need to sign in again to access your account.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (signingOut) return;
                    setSigningOut(true);
                    setShowSignOutModal(false);
                    try {
                      await fetch("/api/auth/sign-out", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                      });
                    } finally {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      sessionStorage.removeItem("token");
                      sessionStorage.removeItem("user");
                      setSigningOut(false);
                      router.replace("/");
                    }
                  }}
                  disabled={signingOut}
                  className="flex-1 rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/30 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
}
