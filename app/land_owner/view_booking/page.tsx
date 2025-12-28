"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Home, 
  CalendarDays, 
  PlusSquare, 
  LogOut, 
  User, 
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Car,
  XCircle
} from "lucide-react";

export default function ViewBookings() {
  const [activeItem, setActiveItem] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/land_owner" },
    { id: "bookings", label: "View Booking Details", icon: CalendarDays, href: "/land_owner/view_booking" },
    { id: "slots", label: "Add Slots", icon: PlusSquare, href: "/land_owner/add_slots" },
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

  const allBookings = [
    { id: "BK-001", userId: "USR-001", vehicle: "ABC-1234", spot: "A-12", date: "2025-12-28", time: "09:30 AM", duration: "2h", amount: "$30", status: "active" },
    { id: "BK-002", userId: "USR-002", vehicle: "XYZ-5678", spot: "B-05", date: "2025-12-28", time: "10:15 AM", duration: "1h 30m", amount: "$22.50", status: "active" },
    { id: "BK-003", userId: "USR-003", vehicle: "DEF-9012", spot: "C-08", date: "2025-12-28", time: "08:00 AM", duration: "4h", amount: "$60", status: "completed" },
    { id: "BK-004", userId: "USR-004", vehicle: "GHI-3456", spot: "A-03", date: "2025-12-28", time: "11:00 AM", duration: "3h", amount: "$45", status: "active" },
    { id: "BK-005", userId: "USR-005", vehicle: "JKL-7890", spot: "B-08", date: "2025-12-28", time: "01:30 PM", duration: "2h", amount: "$30", status: "active" },
    { id: "BK-006", userId: "USR-006", vehicle: "MNO-1234", spot: "C-01", date: "2025-12-27", time: "03:45 PM", duration: "1h 30m", amount: "$22.50", status: "completed" },
    { id: "BK-007", userId: "USR-001", vehicle: "PQR-5678", spot: "A-07", date: "2025-12-27", time: "06:00 PM", duration: "2h", amount: "$30", status: "completed" },
    { id: "BK-008", userId: "USR-002", vehicle: "STU-9012", spot: "B-11", date: "2025-12-27", time: "07:30 PM", duration: "1h", amount: "$15", status: "cancelled" },
    { id: "BK-009", userId: "USR-003", vehicle: "VWX-3456", spot: "C-05", date: "2025-12-26", time: "09:00 AM", duration: "5h", amount: "$75", status: "completed" },
    { id: "BK-010", userId: "USR-004", vehicle: "YZA-7890", spot: "A-10", date: "2025-12-26", time: "02:00 PM", duration: "2h 30m", amount: "$37.50", status: "completed" },
    { id: "BK-011", userId: "USR-005", vehicle: "BCD-1234", spot: "B-03", date: "2025-12-25", time: "10:00 AM", duration: "3h", amount: "$45", status: "completed" },
    { id: "BK-012", userId: "USR-006", vehicle: "EFG-5678", spot: "C-09", date: "2025-12-25", time: "04:00 PM", duration: "2h", amount: "$30", status: "cancelled" },
  ];

  // Filter bookings based on search and status
  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.spot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "completed":
        return "bg-blue-500/20 text-blue-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-[#94A3B8]/20 text-[#94A3B8]";
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0F172A] to-[#020617] border-r border-white/10 flex flex-col fixed h-full">
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

      {/* Main Content Area */}
      <main className="flex-1 ml-64 bg-gradient-to-b from-[#0F172A] to-[#020617] min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#E5E7EB]">Booking Details</h1>
            <p className="text-[#94A3B8] mt-1">View and manage all parking bookings</p>
          </div>

          {/* Filters Section */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search by Booking ID, Vehicle, or Spot..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:border-[#84CC16]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#94A3B8]" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#84CC16]">All Bookings</h2>
              <span className="text-sm text-[#94A3B8]">
                Showing {paginatedBookings.length} of {filteredBookings.length} bookings
              </span>
            </div>

            {paginatedBookings.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[#94A3B8] text-sm border-b border-white/10">
                        <th className="pb-4">Booking ID</th>
                        <th className="pb-4">User ID</th>
                        <th className="pb-4">Vehicle</th>
                        <th className="pb-4">Spot</th>
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Time</th>
                        <th className="pb-4">Duration</th>
                        <th className="pb-4">Amount</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-white/5 text-[#E5E7EB] hover:bg-white/5 transition-colors">
                          <td className="py-4 font-medium">{booking.id}</td>
                          <td className="py-4">
                            <button
                              onClick={() => setSelectedUser(booking.userId)}
                              className="flex items-center gap-1 text-[#84CC16] hover:underline"
                            >
                              <User className="w-3 h-3" />
                              {booking.userId}
                            </button>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-[#94A3B8]" />
                              {booking.vehicle}
                            </div>
                          </td>
                          <td className="py-4">{booking.spot}</td>
                          <td className="py-4">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-[#94A3B8]" />
                              {booking.time}
                            </div>
                          </td>
                          <td className="py-4">{booking.duration}</td>
                          <td className="py-4 text-[#84CC16] font-medium">{booking.amount}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <button className="p-2 rounded-lg hover:bg-[#84CC16]/20 text-[#84CC16] transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <p className="text-sm text-[#94A3B8]">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-white/10 text-[#E5E7EB] hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? "bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A]"
                              : "border border-white/10 text-[#E5E7EB] hover:bg-white/5"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-white/10 text-[#E5E7EB] hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="w-12 h-12 text-[#94A3B8] mb-4" />
                <p className="text-[#E5E7EB] text-lg">No bookings found</p>
                <p className="text-[#94A3B8] text-sm mt-2">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </main>

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
    </div>
  );
}
