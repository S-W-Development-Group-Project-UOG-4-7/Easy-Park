"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Moon, Sun, Menu, X, LogOut } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import AddPropertiesPage from "../../pages/AddPropertiesPage";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminAddPropertiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
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

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#0F172A] dark:to-[#020617] bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar adminName={user?.fullName || "Admin"} onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 z-50 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          adminName={user?.fullName || "Admin"}
          onLinkClick={() => setMobileMenuOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 w-full">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 border-b transition-colors duration-300 dark:border-slate-800/60 border-slate-200/60 bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] from-white to-[#F3F4F6] backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg border p-2 transition-all hover:scale-105 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 border-slate-200/60 bg-slate-50/50 text-slate-700"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="rounded-lg border p-2 transition-all hover:scale-105 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 border-slate-200/60 bg-slate-50/50 text-slate-700"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg border p-2 transition-all hover:scale-105 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-red-400 border-slate-200/60 bg-slate-50/50 text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <AddPropertiesPage />
        </main>
      </div>
    </div>
  );
}
