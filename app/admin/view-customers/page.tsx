"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Menu, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import ViewCustomersPage from "../pages/ViewCustomersPage";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminViewCustomersRoute() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const data = await response.json();

        if (data.success && data.data) {
          if (data.data.role !== "ADMIN") {
            router.push("/sign-in");
            return;
          }
          setUser(data.data);
        } else {
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const openSignOutModal = () => {
    setMobileMenuOpen(false);
    setShowSignOutModal(true);
  };

  const closeSignOutModal = () => setShowSignOutModal(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setShowSignOutModal(false);

    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  };

  useEffect(() => {
    if (!showSignOutModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSignOutModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#0F172A] dark:to-[#020617] bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB]">
      <div className="hidden lg:block">
        <AdminSidebar adminName={user?.fullName || "Admin"} onLogout={openSignOutModal} />
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 z-50 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          adminName={user?.fullName || "Admin"}
          onLinkClick={() => setMobileMenuOpen(false)}
          onLogout={openSignOutModal}
        />
      </div>

      <div className="lg:ml-64 flex-1 w-full">
        <div className="sticky top-0 z-20 border-b transition-colors duration-300 dark:border-slate-800/60 border-slate-200/60 bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6] backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg border p-2 transition-all hover:scale-105 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 border-slate-200/60 bg-slate-50/50 text-slate-700"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex-1" />
          </div>
        </div>

        <main className="p-4 md:p-6">
          <ViewCustomersPage />
        </main>
      </div>

      {showSignOutModal && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeSignOutModal}
            />
            <div className="relative z-[10000] mx-4 w-full max-w-md rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
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
              <p className="mb-6 text-center text-slate-400">
                Are you sure you want to sign out? You will need to sign in again to access your account.
              </p>

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
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
