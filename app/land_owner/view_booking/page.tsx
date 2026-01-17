"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  XCircle,
  Menu,
  X,
  Loader2,
  Calendar
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

export default function ViewBookings() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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

  // Fetch bookings from API
  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const response = await fetch('/api/bookings');
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        // API returns { success: true, data: [...] } format from successResponse
        const bookingsData = data.data || data.bookings || [];
        setBookings(bookingsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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
        // Fallback to booking data if user API fails
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

  // Transform bookings for display
  const allBookings = bookings.map(booking => ({
    id: booking.bookingNumber,
    odId: booking.id,
    odUserId: booking.user.id,
    userId: booking.user.id.slice(0, 8),
    userName: booking.user.name,
    vehicle: booking.vehicleNumber,
    spot: booking.slot.slotNumber,
    date: new Date(booking.startTime).toISOString().split('T')[0],
    time: new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: booking.duration,
    amount: `$${booking.amount.toFixed(2)}`,
    status: booking.status.toLowerCase(),
  }));

  // Clear time filter
  const clearTimeFilter = () => {
    setStartTime("");
    setEndTime("");
  };

  // Filter bookings based on search, status, date and time
  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.spot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    // Date filter
    const matchesDate = !selectedDate || booking.date === selectedDate;
    
    // Time filter
    let matchesTime = true;
    if (startTime || endTime) {
      const bookingTimeStr = new Date(`${booking.date}T${booking.time}`).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const bookingParts = booking.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (bookingParts) {
        let hours = parseInt(bookingParts[1]);
        const minutes = parseInt(bookingParts[2]);
        const period = bookingParts[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const bookingTimeValue = hours * 60 + minutes;
        
        if (startTime && endTime) {
          const [startH, startM] = startTime.split(':').map(Number);
          const [endH, endM] = endTime.split(':').map(Number);
          const startValue = startH * 60 + startM;
          const endValue = endH * 60 + endM;
          matchesTime = bookingTimeValue >= startValue && bookingTimeValue <= endValue;
        } else if (startTime) {
          const [startH, startM] = startTime.split(':').map(Number);
          const startValue = startH * 60 + startM;
          matchesTime = bookingTimeValue >= startValue;
        } else if (endTime) {
          const [endH, endM] = endTime.split(':').map(Number);
          const endValue = endH * 60 + endM;
          matchesTime = bookingTimeValue <= endValue;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesTime;
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
          <div className="mb-6 sm:mb-8 mt-14 lg:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E5E7EB]">Booking Details</h1>
            <p className="text-[#94A3B8] mt-1 text-sm sm:text-base">View and manage all parking bookings</p>
          </div>

          {/* Filters Section */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search by ID, Vehicle, or Spot..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:border-[#84CC16] text-sm sm:text-base"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#94A3B8]" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] cursor-pointer text-sm sm:text-base"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#84CC16]" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] cursor-pointer text-sm sm:text-base [color-scheme:dark]"
                  />
                  {selectedDate && (
                    <button
                      onClick={() => {
                        setSelectedDate("");
                        setCurrentPage(1);
                      }}
                      className="text-[#94A3B8] hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Time Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <Clock className="w-5 h-5 text-[#94A3B8]" />
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="From"
                    className="bg-[#0F172A] border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-[#E5E7EB] text-xs sm:text-sm focus:outline-none focus:border-[#84CC16] cursor-pointer [color-scheme:dark] w-[100px] sm:w-[120px]"
                  />
                  <span className="text-[#94A3B8] text-xs">to</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="To"
                    className="bg-[#0F172A] border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-[#E5E7EB] text-xs sm:text-sm focus:outline-none focus:border-[#84CC16] cursor-pointer [color-scheme:dark] w-[100px] sm:w-[120px]"
                  />
                </div>
                {(startTime || endTime) && (
                  <button
                    onClick={() => {
                      clearTimeFilter();
                      setCurrentPage(1);
                    }}
                    className="text-[#94A3B8] hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[#84CC16]">All Bookings</h2>
              <span className="text-xs sm:text-sm text-[#94A3B8]">
                Showing {paginatedBookings.length} of {filteredBookings.length} bookings
              </span>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-[#84CC16] animate-spin mb-4" />
                <p className="text-[#94A3B8]">Loading bookings...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-[#E5E7EB] text-lg">Error loading bookings</p>
                <p className="text-[#94A3B8] text-sm mt-2">{error}</p>
              </div>
            ) : paginatedBookings.length > 0 ? (
              <>
                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {paginatedBookings.map((booking) => (
                    <div key={booking.id} className="bg-[#0F172A] rounded-xl p-4 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-[#E5E7EB]">{booking.id}</p>
                          <button
                            onClick={() => setSelectedUser(booking.odUserId)}
                            className="flex items-center gap-1 text-[#84CC16] text-sm hover:underline"
                          >
                            <User className="w-3 h-3" />
                            {booking.userName}
                          </button>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-[#94A3B8] text-xs">Vehicle</p>
                          <p className="text-[#E5E7EB] flex items-center gap-1"><Car className="w-3 h-3" />{booking.vehicle}</p>
                        </div>
                        <div>
                          <p className="text-[#94A3B8] text-xs">Spot</p>
                          <p className="text-[#E5E7EB]">{booking.spot}</p>
                        </div>
                        <div>
                          <p className="text-[#94A3B8] text-xs">Date</p>
                          <p className="text-[#E5E7EB]">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[#94A3B8] text-xs">Time</p>
                          <p className="text-[#E5E7EB]">{booking.time}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/10">
                        <p className="text-[#84CC16] font-medium">{booking.amount}</p>
                        <button className="p-2 rounded-lg bg-[#84CC16]/20 text-[#84CC16]">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[#94A3B8] text-sm border-b border-white/10">
                        <th className="pb-4">Booking ID</th>
                        <th className="pb-4">User</th>
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
                              onClick={() => setSelectedUser(booking.odUserId)}
                              className="flex items-center gap-1 text-[#84CC16] hover:underline"
                            >
                              <User className="w-3 h-3" />
                              {booking.userName}
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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
                    <p className="text-xs sm:text-sm text-[#94A3B8]">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-white/10 text-[#E5E7EB] hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-sm transition-colors ${
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
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
                <p className="text-sm text-[#94A3B8]">{selectedUserData.id.slice(0, 8)}...</p>
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
