"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Car,
  MapPin,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeSlots: number;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeSlots: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.success && data.data?.user) {
          if (data.data.user.role !== "ADMIN") {
            router.push("/sign-in");
            return;
          }
          setUser(data.data.user);
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

  const menuItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Users, label: "Users" },
    { icon: Car, label: "Bookings" },
    { icon: MapPin, label: "Parking Locations" },
    { icon: DollarSign, label: "Payments" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] text-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f1729] border-r border-white/10 transform transition-transform duration-300 z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-lime-400">EasyPark</h1>
          <p className="text-sm text-white/60 mt-1">Admin Dashboard</p>
        </div>

        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition
                ${item.active 
                  ? "bg-lime-400/10 text-lime-400 border-r-2 border-lime-400" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/5">
            <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center">
              <span className="text-lime-400 font-semibold">
                {user?.fullName?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{user?.fullName || "Admin"}</p>
              <p className="text-xs text-white/60">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold">Welcome back, {user?.fullName || "Admin"}!</h2>
          <p className="text-white/60 mt-2">Here&apos;s what&apos;s happening with your parking system today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Users className="text-blue-400" size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-white/60 text-sm">Total Users</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-lime-500/20">
                <Calendar className="text-lime-400" size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
            <p className="text-white/60 text-sm">Total Bookings</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <DollarSign className="text-yellow-400" size={24} />
              </div>
              <BarChart3 className="text-green-400" size={20} />
            </div>
            <p className="text-2xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</p>
            <p className="text-white/60 text-sm">Total Revenue</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Car className="text-purple-400" size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <p className="text-2xl font-bold">{stats.activeSlots}</p>
            <p className="text-white/60 text-sm">Active Slots</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 transition text-left">
              <Users className="text-lime-400 mb-2" size={24} />
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-white/60">View and manage all users</p>
            </button>
            <button className="p-4 rounded-xl bg-blue-400/10 hover:bg-blue-400/20 transition text-left">
              <MapPin className="text-blue-400 mb-2" size={24} />
              <p className="font-medium">Parking Locations</p>
              <p className="text-sm text-white/60">Manage parking areas</p>
            </button>
            <button className="p-4 rounded-xl bg-purple-400/10 hover:bg-purple-400/20 transition text-left">
              <BarChart3 className="text-purple-400 mb-2" size={24} />
              <p className="font-medium">View Reports</p>
              <p className="text-sm text-white/60">Analytics and insights</p>
            </button>
          </div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
