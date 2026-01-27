"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import { WasherBooking, BookingStatus, BookingFilters, NotificationAlert, DashboardStats as DashboardStatsType, FullDashboardStats } from "@/lib/washer-types";
import { washerApi } from "@/app/services/washer-api";
import { WasherBookingsTable } from "@/app/components/washer/WasherBookingsTable";
import { CustomerDetailsModal } from "@/app/components/washer/CustomerDetailsModal";
import { FilterAndSearch } from "@/app/components/washer/FilterAndSearch";
import { DashboardStats } from "@/app/components/washer/DashboardStats";
import { NotificationBadge } from "@/app/components/washer/NotificationBadge";

export default function WasherDashboard() {
  const router = useRouter();

  // State Management
  const [bookings, setBookings] = useState<WasherBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<WasherBooking[]>([]);
  const [stats, setStats] = useState<DashboardStatsType>({
    totalBookings: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });
  const [allTimeStats, setAllTimeStats] = useState<{ total: number; pending: number; accepted: number; completed: number; cancelled: number }>({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
  });
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<WasherBooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>({
    searchQuery: "",
    statusFilter: "ALL",
    sortBy: "earliest",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const openSignOutModal = () => setShowSignOutModal(true);
  const closeSignOutModal = () => setShowSignOutModal(false);

  // Load bookings and stats
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];
      
      // Fetch ALL bookings (no date filter) - let frontend filters handle date filtering
      const [bookingsData, statsData] = await Promise.all([
        washerApi.getBookings(), // Remove date filter to get all bookings
        washerApi.getDashboardStats(today),
      ]);

      setBookings(bookingsData || []);
      // Extract the 'today' stats from the response
      setStats(statsData?.today || {
        totalBookings: 0,
        pendingBookings: 0,
        acceptedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
      });
      
      // Set all-time stats from the response
      setAllTimeStats(statsData?.allTime || {
        total: 0,
        pending: 0,
        accepted: 0,
        completed: 0,
        cancelled: 0,
      });

      // Simulate new notifications for demo
      if (bookingsData && bookingsData.length > 0) {
        const newNotifications: NotificationAlert[] = [];
        bookingsData.slice(0, 2).forEach((booking, index) => {
          if (booking.status === "PENDING" && !notifications.some(n => n.bookingId === booking.id)) {
            newNotifications.push({
              id: `notif-${booking.id}`,
              type: index === 0 ? "new_booking" : "upcoming_slot",
              message: `${booking.customerName} - ${booking.vehicleNumber} at ${booking.slotTime}`,
              timestamp: new Date().toISOString(),
              read: false,
              bookingId: booking.id,
            });
          }
        });
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  // Apply filters to bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        booking =>
          booking.customerName.toLowerCase().includes(query) ||
          booking.vehicleNumber.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.statusFilter !== "ALL") {
      filtered = filtered.filter(booking => booking.status === filters.statusFilter);
    }

    // Apply date filter
    if (filters.dateFilter) {
      filtered = filtered.filter(booking => booking.slotDate === filters.dateFilter);
    }

    // Apply time range filter
    if (filters.timeRange) {
      filtered = filtered.filter(booking => {
        // Parse booking time - handle various formats like "10:00", "10:00 AM", "1000"
        let bookingTimeStr = booking.slotTime.replace(/\s/g, "").replace(/AM|PM/gi, "");
        
        // Normalize to HH:MM format
        if (!bookingTimeStr.includes(":")) {
          // Handle format like "1000" -> "10:00"
          bookingTimeStr = bookingTimeStr.padStart(4, "0");
          bookingTimeStr = bookingTimeStr.slice(0, 2) + ":" + bookingTimeStr.slice(2);
        }
        
        // Convert to minutes for comparison
        const parseTimeToMinutes = (time: string): number => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + (minutes || 0);
        };
        
        const bookingMinutes = parseTimeToMinutes(bookingTimeStr);
        const startMinutes = parseTimeToMinutes(filters.timeRange!.start);
        const endMinutes = parseTimeToMinutes(filters.timeRange!.end);
        
        return bookingMinutes >= startMinutes && bookingMinutes <= endMinutes;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "earliest":
          return a.slotTime.localeCompare(b.slotTime);
        case "latest":
          return b.slotTime.localeCompare(a.slotTime);
        case "vehicle_type":
          return a.vehicleType.localeCompare(b.vehicleType);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, filters]);

  // Handle booking status update
  const handleBookingUpdated = useCallback((bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      )
    );

    // Update stats
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setStats(prev => {
        const newStats = { ...prev };
        
        // Decrement old status count
        if (booking.status === "PENDING") newStats.pendingBookings--;
        if (booking.status === "ACCEPTED") newStats.acceptedBookings--;
        if (booking.status === "COMPLETED") newStats.completedBookings--;
        if (booking.status === "CANCELLED") newStats.cancelledBookings--;

        // Increment new status count
        if (newStatus === "PENDING") newStats.pendingBookings++;
        if (newStatus === "ACCEPTED") newStats.acceptedBookings++;
        if (newStatus === "COMPLETED") newStats.completedBookings++;
        if (newStatus === "CANCELLED") newStats.cancelledBookings++;

        return newStats;
      });
    }
  }, [bookings]);

  // Handle notification dismiss
  const handleDismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Handle notification mark as read
  const handleMarkNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setShowSignOutModal(false);

    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    loadDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  useEffect(() => {
    if (!showSignOutModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSignOutModal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#05080f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-6 md:px-10 py-6 border-b border-white/10 bg-[#0b1220]/95 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-lime-400">EasyPark Washer</h1>
        <div className="flex items-center gap-4">
          <NotificationBadge
            notifications={notifications}
            onDismiss={handleDismissNotification}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw
              size={20}
              className={`text-white ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={openSignOutModal}
            disabled={signingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 font-medium text-sm transition hover:bg-red-500/20 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign Out"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Page Title and Description */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h2>
          <p className="text-white/60">
            Manage your car wash bookings and track your daily progress
          </p>
        </div>

        {/* Dashboard Stats */}
        <section className="mb-8">
          <DashboardStats stats={stats} allTimeStats={allTimeStats} isLoading={isLoading} />
        </section>

        {/* Filter and Search Section */}
        <section className="mb-8">
          <FilterAndSearch
            onFilterChange={setFilters}
            isLoading={isLoading}
          />
        </section>

        {/* Bookings Table Section */}
        <section className="mb-8">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white">Your Bookings</h3>
            <p className="text-white/60 text-sm mt-1">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <WasherBookingsTable
            bookings={filteredBookings}
            onBookingUpdated={handleBookingUpdated}
            onViewDetails={(booking) => {
              setSelectedBooking(booking);
              setShowDetailsModal(true);
            }}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        booking={selectedBooking}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
      />

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeSignOutModal}
            />

            {/* Modal */}
            <div className="relative z-10000 mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
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
                  onClick={closeSignOutModal}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
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
    </div>
  );
}
