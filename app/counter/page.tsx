"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  LogOut,
  Menu,
  X,
  Loader2,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Booking {
  id: string;
  vehicleNumber: string;
  customerName: string;
  slotNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
}

export default function CounterDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Sample booking data
  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      vehicleNumber: "CAB-1234",
      customerName: "John Doe",
      slotNumber: "A-01",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      status: "PENDING",
      amount: 600,
    },
    {
      id: "2",
      vehicleNumber: "CAB-5678",
      customerName: "Jane Smith",
      slotNumber: "B-03",
      startTime: "11:00 AM",
      endTime: "02:00 PM",
      status: "CONFIRMED",
      amount: 900,
    },
    {
      id: "3",
      vehicleNumber: "CAB-9012",
      customerName: "Mike Johnson",
      slotNumber: "A-05",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      status: "COMPLETED",
      amount: 600,
    },
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.success && data.data?.user) {
          if (data.data.user.role !== "COUNTER") {
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && booking.status.toLowerCase() === activeTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  const menuItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Car, label: "Check-In" },
    { icon: CheckCircle, label: "Check-Out" },
    { icon: DollarSign, label: "Payments" },
    { icon: Calendar, label: "Bookings" },
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
          <p className="text-sm text-white/60 mt-1">Counter Dashboard</p>
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
                {user?.fullName?.charAt(0) || "C"}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{user?.fullName || "Counter Staff"}</p>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Counter Dashboard</h2>
          <p className="text-white/60 mt-2">Manage check-ins, check-outs, and payments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-white/60">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Car className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-white/60">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">28</p>
                <p className="text-sm text-white/60">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <DollarSign className="text-lime-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">Rs. 15,600</p>
                <p className="text-sm text-white/60">Today&apos;s Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Search by vehicle number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "confirmed", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg capitalize transition ${
                    activeTab === tab
                      ? "bg-lime-400 text-black font-medium"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Vehicle</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Slot</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Car className="text-lime-400" size={18} />
                        <span className="font-medium">{booking.vehicleNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="text-white/40" size={18} />
                        <span>{booking.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{booking.slotNumber}</td>
                    <td className="px-6 py-4 text-white/70">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-6 py-4 font-medium">Rs. {booking.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "COMPLETED"
                            ? "bg-green-500/20 text-green-400"
                            : booking.status === "CONFIRMED"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {booking.status === "PENDING" && (
                          <button className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <button className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
