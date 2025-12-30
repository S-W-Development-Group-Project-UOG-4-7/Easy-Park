"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Home, 
  CalendarDays, 
  PlusSquare, 
  LogOut, 
  User, 
  TrendingUp,
  Clock,
  DollarSign,
  Car,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Menu,
  X,
  Loader2
} from "lucide-react";

interface BookingData {
  id: string;
  bookingNumber: string;
  vehicleNumber: string;
  startTime: string;
  duration: string;
  amount: number;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  slot: {
    slotNumber: string;
    parkingLot: {
      name: string;
      address: string;
    };
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalBookings: number;
}

export default function LandOwnerHome() {
  const [activeItem, setActiveItem] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("all");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(null);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/land_owner" },
    { id: "bookings", label: "View Booking Details", icon: CalendarDays, href: "/land_owner/view_booking" },
    { id: "slots", label: "Add Slots", icon: PlusSquare, href: "/land_owner/add_slots" },
  ];

  const timeFilters = [
    { id: "all", label: "All Day" },
    { id: "morning", label: "Morning (6AM - 12PM)" },
    { id: "afternoon", label: "Afternoon (12PM - 5PM)" },
    { id: "evening", label: "Evening (5PM - 10PM)" },
  ];

  // Fetch bookings from API
  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const response = await fetch('/api/bookings');
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  // Fetch user details when selected
  useEffect(() => {
    async function fetchUserDetails() {
      if (!selectedUser) {
        setSelectedUserData(null);
        return;
      }
      try {
        const response = await fetch(`/api/users/${selectedUser}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        setSelectedUserData(data.user);
      } catch (err) {
        console.error('Error fetching user:', err);
        // Fallback to booking data
        const booking = bookings.find(b => b.user.id === selectedUser);
        if (booking) {
          const userBookingsCount = bookings.filter(b => b.user.id === selectedUser).length;
          setSelectedUserData({
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            phone: booking.user.phone,
            totalBookings: userBookingsCount,
          });
        }
      }
    }
    fetchUserDetails();
  }, [selectedUser, bookings]);

  // Helper to get time period
  const getTimePeriod = (dateStr: string) => {
    const hour = new Date(dateStr).getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 22) return "evening";
    return "night";
  };

  // Filter bookings by selected date
  const bookingsForDate = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
    return bookingDate === selectedDate;
  });

  // Filter by time period
  const filteredBookings = selectedTime === "all" 
    ? bookingsForDate 
    : bookingsForDate.filter(booking => getTimePeriod(booking.startTime) === selectedTime);

  // Calculate stats
  const todayRevenue = bookingsForDate.reduce((sum, b) => sum + b.amount, 0);
  const totalBookingsCount = bookings.length;

  const stats = [
    { label: "Today's Bookings", value: bookingsForDate.length.toString(), icon: CalendarDays, color: "text-blue-400" },
    { label: "Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-[#84CC16]" },
    { label: "Total Bookings", value: totalBookingsCount.toString(), icon: BarChart3, color: "text-purple-400" },
  ];

  // Transform bookings for display
  const recentBookings = filteredBookings.map(booking => ({
    id: booking.bookingNumber,
    oderId: booking.user.id,
    userName: booking.user.name,
    vehicle: booking.vehicleNumber,
    spot: booking.slot.slotNumber,
    time: new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: booking.duration,
    status: booking.status,
    period: getTimePeriod(booking.startTime),
  }));

  // Calculate quick stats
  const activeBookings = bookingsForDate.filter(b => b.status === 'active').length;
  const completedBookings = bookingsForDate.filter(b => b.status === 'completed').length;
  const occupancyRate = bookingsForDate.length > 0 ? Math.round((activeBookings / Math.max(bookingsForDate.length, 1)) * 100) : 0;
  const weeklyRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-[#94A3B8]">© 2024 EasyPark</p>
        </div>
      </aside>

      {/* User Details Modal */}
      {selectedUser && selectedUserData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div 
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-[#84CC16]">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-[#94A3B8] hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#84CC16] to-[#BEF264] flex items-center justify-center">
                <User className="w-8 h-8 text-[#0F172A]" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[#E5E7EB]">{selectedUserData.name}</h4>
                <p className="text-sm text-[#94A3B8]">{selectedUserData.id.slice(0, 12)}...</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
                <div className="p-2 bg-white/5 rounded-lg">
                  <svg className="w-5 h-5 text-[#84CC16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Email</p>
                  <p className="text-[#E5E7EB]">{selectedUserData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
                <div className="p-2 bg-white/5 rounded-lg">
                  <svg className="w-5 h-5 text-[#84CC16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Phone</p>
                  <p className="text-[#E5E7EB]">{selectedUserData.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
                <div className="p-2 bg-white/5 rounded-lg">
                  <CalendarDays className="w-5 h-5 text-[#84CC16]" />
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Total Bookings</p>
                  <p className="text-[#E5E7EB]">{selectedUserData.totalBookings} bookings</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold hover:shadow-lg hover:shadow-lime-500/30 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 bg-gradient-to-b from-[#0F172A] to-[#020617] min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 text-[#E5E7EB]"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 mt-14 lg:mt-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#E5E7EB]">Welcome Back, John!</h1>
              <p className="text-[#94A3B8] mt-1 text-sm sm:text-base">Here's what's happening with your parking lot today.</p>
            </div>
            
            {/* Date Picker */}
            <div className="flex items-center gap-3 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-xl px-4 py-3 w-full sm:w-auto">
              <Calendar className="w-5 h-5 text-[#84CC16]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-[#E5E7EB] text-sm focus:outline-none cursor-pointer [color-scheme:dark] flex-1"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4 sm:p-6 hover:border-[#84CC16]/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm text-[#94A3B8]">{stat.label}</span>
                    <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-4xl font-bold text-[#E5E7EB]">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Bookings */}
            <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-semibold text-[#84CC16]">
                  Bookings for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h2>
                
                {/* Time Filter */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#94A3B8]" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="bg-[#0F172A] border border-white/10 rounded-lg px-3 sm:px-4 py-2 text-[#E5E7EB] text-xs sm:text-sm focus:outline-none focus:border-[#84CC16] cursor-pointer flex-1 sm:flex-none"
                  >
                    {timeFilters.map((filter) => (
                      <option key={filter.id} value={filter.id}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-[#84CC16] animate-spin mb-4" />
                  <p className="text-[#94A3B8]">Loading bookings...</p>
                </div>
              ) : recentBookings.length > 0 ? (
                <>
                  {/* Mobile Cards View */}
                  <div className="sm:hidden space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-[#E5E7EB]">{booking.id}</p>
                            <button
                              onClick={() => setSelectedUser(booking.oderId)}
                              className="flex items-center gap-1 text-[#84CC16] text-sm hover:underline"
                            >
                              <User className="w-3 h-3" />
                              {booking.userName}
                            </button>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "active" 
                              ? "bg-green-500/20 text-green-400" 
                              : booking.status === "cancelled"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-[#94A3B8]/20 text-[#94A3B8]"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-[#94A3B8] text-xs">Vehicle</p>
                            <p className="text-[#E5E7EB]">{booking.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-[#94A3B8] text-xs">Spot</p>
                            <p className="text-[#E5E7EB]">{booking.spot}</p>
                          </div>
                          <div>
                            <p className="text-[#94A3B8] text-xs">Time</p>
                            <p className="text-[#E5E7EB]">{booking.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[#94A3B8] text-sm border-b border-white/10">
                          <th className="pb-4">Booking ID</th>
                          <th className="pb-4">User</th>
                          <th className="pb-4">Vehicle</th>
                          <th className="pb-4">Spot</th>
                          <th className="pb-4">Time</th>
                          <th className="pb-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-white/5 text-[#E5E7EB]">
                            <td className="py-4 font-medium">{booking.id}</td>
                            <td className="py-4">
                              <button
                                onClick={() => setSelectedUser(booking.oderId)}
                                className="flex items-center gap-1 text-[#84CC16] hover:underline"
                              >
                                <User className="w-3 h-3" />
                                {booking.userName}
                              </button>
                            </td>
                            <td className="py-4">{booking.vehicle}</td>
                            <td className="py-4">{booking.spot}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-[#94A3B8]" />
                                {booking.time}
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "active" 
                                  ? "bg-green-500/20 text-green-400" 
                                  : booking.status === "cancelled"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-[#94A3B8]/20 text-[#94A3B8]"
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="w-12 h-12 text-[#94A3B8] mb-4" />
                  <p className="text-[#E5E7EB] text-lg">No bookings found</p>
                  <p className="text-[#94A3B8] text-sm mt-2">No bookings recorded for this date</p>
                </div>
              )}

              <Link 
                href="/land_owner/view_booking"
                className="mt-4 text-[#84CC16] text-sm hover:underline flex items-center gap-1"
              >
                View all bookings →
              </Link>
            </div>

            {/* Quick Stats Panel */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#84CC16] mb-4 sm:mb-6">Quick Stats</h2>
              
              <div className="space-y-6">
                {/* Occupancy Rate */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#94A3B8]">Occupancy Rate</span>
                    <span className="text-[#E5E7EB] font-medium">{occupancyRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0F172A]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]" style={{ width: `${occupancyRate}%` }}></div>
                  </div>
                </div>

                {/* Active Bookings */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#94A3B8]">Active Bookings</span>
                    <span className="text-[#E5E7EB] font-medium">{activeBookings}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0F172A]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]" style={{ width: `${bookingsForDate.length > 0 ? (activeBookings / bookingsForDate.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Completed Bookings */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#94A3B8]">Completed</span>
                    <span className="text-[#E5E7EB] font-medium">{completedBookings}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0F172A]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]" style={{ width: `${bookingsForDate.length > 0 ? (completedBookings / bookingsForDate.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* Today's Summary */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-[#84CC16]" />
                    <span className="text-[#E5E7EB] font-medium">Today's Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0F172A] rounded-lg p-3">
                      <p className="text-[#94A3B8] text-xs">Active</p>
                      <p className="text-xl font-bold text-green-400">{activeBookings}</p>
                    </div>
                    <div className="bg-[#0F172A] rounded-lg p-3">
                      <p className="text-[#94A3B8] text-xs">Completed</p>
                      <p className="text-xl font-bold text-[#E5E7EB]">{completedBookings}</p>
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-sm">Total Revenue</span>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      All Time
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#84CC16] mt-2">${weeklyRevenue.toFixed(2)}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">from {totalBookingsCount} bookings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
