"use client";

import { useState } from "react";
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
  X
} from "lucide-react";

export default function LandOwnerHome() {
  const [activeItem, setActiveItem] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("all");

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

  // Mock users data
  const usersData: Record<string, { name: string; email: string; phone: string; totalBookings: number }> = {
    "USR-001": { name: "Alice Johnson", email: "alice@email.com", phone: "+94 77 123 4567", totalBookings: 12 },
    "USR-002": { name: "Bob Smith", email: "bob@email.com", phone: "+94 77 234 5678", totalBookings: 8 },
    "USR-003": { name: "Carol White", email: "carol@email.com", phone: "+94 77 345 6789", totalBookings: 15 },
    "USR-004": { name: "David Brown", email: "david@email.com", phone: "+94 77 456 7890", totalBookings: 5 },
    "USR-005": { name: "Eva Green", email: "eva@email.com", phone: "+94 77 567 8901", totalBookings: 20 },
    "USR-006": { name: "Frank Miller", email: "frank@email.com", phone: "+94 77 678 9012", totalBookings: 3 },
  };

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Mock data for different dates
  const bookingsData: Record<string, { bookings: number; revenue: string; recentBookings: typeof recentBookingsDefault }> = {
    "2025-12-28": { bookings: 15, revenue: "$450", recentBookings: [
      { id: "BK-001", oderId: "USR-001", vehicle: "ABC-1234", spot: "A-12", time: "09:30 AM", duration: "2h", status: "active", period: "morning" },
      { id: "BK-002", oderId: "USR-002", vehicle: "XYZ-5678", spot: "B-05", time: "10:15 AM", duration: "1h 30m", status: "active", period: "morning" },
      { id: "BK-003", oderId: "USR-003", vehicle: "DEF-9012", spot: "C-08", time: "08:00 AM", duration: "4h", status: "completed", period: "morning" },
      { id: "BK-004", oderId: "USR-004", vehicle: "GHI-3456", spot: "A-03", time: "11:00 AM", duration: "3h", status: "active", period: "morning" },
      { id: "BK-005", oderId: "USR-005", vehicle: "JKL-7890", spot: "B-08", time: "01:30 PM", duration: "2h", status: "active", period: "afternoon" },
      { id: "BK-006", oderId: "USR-006", vehicle: "MNO-1234", spot: "C-01", time: "03:45 PM", duration: "1h 30m", status: "active", period: "afternoon" },
      { id: "BK-007", oderId: "USR-001", vehicle: "PQR-5678", spot: "A-07", time: "06:00 PM", duration: "2h", status: "active", period: "evening" },
      { id: "BK-008", oderId: "USR-002", vehicle: "STU-9012", spot: "B-11", time: "07:30 PM", duration: "1h", status: "completed", period: "evening" },
    ]},
    "2025-12-27": { bookings: 22, revenue: "$680", recentBookings: [
      { id: "BK-098", oderId: "USR-003", vehicle: "LMN-7890", spot: "A-01", time: "08:00 AM", duration: "3h", status: "completed", period: "morning" },
      { id: "BK-097", oderId: "USR-004", vehicle: "OPQ-1234", spot: "B-12", time: "09:45 AM", duration: "2h", status: "completed", period: "morning" },
      { id: "BK-096", oderId: "USR-005", vehicle: "RST-5678", spot: "C-03", time: "11:30 AM", duration: "1h", status: "completed", period: "morning" },
      { id: "BK-095", oderId: "USR-006", vehicle: "VWX-3456", spot: "A-05", time: "02:00 PM", duration: "2h 30m", status: "completed", period: "afternoon" },
      { id: "BK-094", oderId: "USR-001", vehicle: "YZA-7890", spot: "B-09", time: "04:15 PM", duration: "1h 45m", status: "completed", period: "afternoon" },
      { id: "BK-093", oderId: "USR-002", vehicle: "BCD-1234", spot: "C-06", time: "06:30 PM", duration: "2h", status: "completed", period: "evening" },
    ]},
    "2025-12-26": { bookings: 18, revenue: "$520", recentBookings: [
      { id: "BK-085", oderId: "USR-003", vehicle: "UVW-9012", spot: "A-08", time: "10:00 AM", duration: "2h 30m", status: "completed", period: "morning" },
      { id: "BK-084", oderId: "USR-004", vehicle: "XYZ-3456", spot: "B-02", time: "01:15 PM", duration: "1h 45m", status: "completed", period: "afternoon" },
      { id: "BK-083", oderId: "USR-005", vehicle: "EFG-7890", spot: "C-10", time: "05:30 PM", duration: "2h", status: "completed", period: "evening" },
    ]},
  };

  const recentBookingsDefault = [
    { id: "BK-001", oderId: "USR-001", vehicle: "ABC-1234", spot: "A-12", time: "09:30 AM", duration: "2h", status: "active", period: "morning" },
    { id: "BK-002", oderId: "USR-002", vehicle: "XYZ-5678", spot: "B-05", time: "10:15 AM", duration: "1h 30m", status: "active", period: "morning" },
    { id: "BK-003", oderId: "USR-003", vehicle: "DEF-9012", spot: "C-08", time: "08:00 AM", duration: "4h", status: "completed", period: "morning" },
    { id: "BK-004", oderId: "USR-004", vehicle: "GHI-3456", spot: "A-03", time: "11:00 AM", duration: "3h", status: "active", period: "morning" },
  ];

  const currentData = bookingsData[selectedDate] || { bookings: 0, revenue: "$0", recentBookings: [] };

  // Filter bookings by selected time period
  const filteredBookings = selectedTime === "all" 
    ? currentData.recentBookings 
    : currentData.recentBookings.filter(booking => booking.period === selectedTime);

  const stats = [
    { label: "Today's Bookings", value: currentData.bookings.toString(), icon: CalendarDays, color: "text-blue-400" },
    { label: "Revenue", value: currentData.revenue, icon: DollarSign, color: "text-[#84CC16]" },
    { label: "Total Bookings", value: "1,248", icon: BarChart3, color: "text-purple-400" },
  ];

  const recentBookings = filteredBookings;

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
      {selectedUser && usersData[selectedUser] && (
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
                <h4 className="text-lg font-semibold text-[#E5E7EB]">{usersData[selectedUser].name}</h4>
                <p className="text-sm text-[#94A3B8]">{selectedUser}</p>
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
                  <p className="text-[#E5E7EB]">{usersData[selectedUser].email}</p>
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
                  <p className="text-[#E5E7EB]">{usersData[selectedUser].phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
                <div className="p-2 bg-white/5 rounded-lg">
                  <CalendarDays className="w-5 h-5 text-[#84CC16]" />
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Total Bookings</p>
                  <p className="text-[#E5E7EB]">{usersData[selectedUser].totalBookings} bookings</p>
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
              
              {recentBookings.length > 0 ? (
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
                              {booking.oderId}
                            </button>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "active" 
                              ? "bg-green-500/20 text-green-400" 
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
                          <th className="pb-4">User ID</th>
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
                                {booking.oderId}
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
                    <span className="text-[#E5E7EB] font-medium">15%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0F172A]">
                    <div className="h-full w-[15%] rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]"></div>
                  </div>
                </div>

                {/* Average Stay */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#94A3B8]">Average Stay</span>
                    <span className="text-[#E5E7EB] font-medium">2h 15m</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0F172A]">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]"></div>
                  </div>
                </div>

                {/* Peak Hour */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#94A3B8]">Peak Hour</span>
                    <span className="text-[#E5E7EB] font-medium">9:00 AM</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0F172A]">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-[#84CC16] to-[#BEF264]"></div>
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
                      <p className="text-[#94A3B8] text-xs">Check-ins</p>
                      <p className="text-xl font-bold text-[#E5E7EB]">24</p>
                    </div>
                    <div className="bg-[#0F172A] rounded-lg p-3">
                      <p className="text-[#94A3B8] text-xs">Check-outs</p>
                      <p className="text-xl font-bold text-[#E5E7EB]">18</p>
                    </div>
                  </div>
                </div>

                {/* Revenue Trend */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] text-sm">Weekly Revenue</span>
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +12.5%
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#84CC16] mt-2">$2,850</p>
                  <p className="text-xs text-[#94A3B8] mt-1">vs $2,533 last week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
