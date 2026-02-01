"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Menu, X } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

type UserDetails = {
  id: string;
  fullName: string;
  address: string | null;
  nic: string | null;
  contactNo: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ fullName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resolved = await params;
        if (!active) return;
        setUserId(resolved.id);
        const authRes = await fetch("/api/auth/me", { credentials: "include" });
        const authData = await authRes.json();
        if (!authRes.ok || !authData.success || authData.data?.role !== "ADMIN") {
          router.push("/sign-in");
          return;
        }
        setCurrentUser(authData.data);

        const res = await fetch(`/api/admin/users/${resolved.id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || "Failed to load user");
          return;
        }
        setUser(data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [params, router]);

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
        <AdminSidebar adminName={currentUser?.fullName || "Admin"} onLogout={openSignOutModal} />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div
        className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 z-50 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          adminName={currentUser?.fullName || "Admin"}
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold dark:text-[#E5E7EB] text-[#111827]">User Details</h1>
                <p className="mt-1 text-sm text-slate-500">View account information.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => userId && router.push(`/admin/users/${userId}/edit`)}
                  className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Edit
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-rose-400">{error}</div>}

            {user && (
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg">
                <div className="grid gap-4 md:grid-cols-2">
                  <Detail label="Full Name" value={user.fullName} />
                  <Detail label="Role" value={user.role} />
                  <Detail label="Email" value={user.email} />
                  <Detail label="Mobile" value={user.contactNo || '-'} />
                  <Detail label="NIC" value={user.nic || '-'} />
                  <Detail label="Address" value={user.address || '-'} />
                  <Detail label="Created At" value={new Date(user.createdAt).toLocaleString()} />
                  <Detail label="Updated At" value={new Date(user.updatedAt).toLocaleString()} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showSignOutModal && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSignOutModal} />
            <div className="relative z-[10000] mx-4 w-full max-w-md rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
