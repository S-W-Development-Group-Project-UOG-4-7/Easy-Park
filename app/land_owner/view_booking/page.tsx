"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  CalendarDays,
  PlusSquare,
  LogOut,
  User,
  Menu,
  X,
  Search,
  Calendar,
  Clock,
  Building2,
  Loader2,
} from "lucide-react";
import CustomerDetailsModal from "../../admin/components/CustomerDetailsModal";
import PaymentDetailsModal from "../../admin/components/PaymentDetailsModal";
import type { AdminCustomerProfile, BookingPaymentDetails } from "../../services/api";

interface OwnerProperty {
  id: string;
  name: string;
  address: string;
}

interface OwnerBooking {
  bookingId: string;
  bookingNumber: string;
  propertyId: string;
  propertyName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  vehicleNumber: string;
  slotNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
}

type SortableField =
  | "customerName"
  | "customerEmail"
  | "vehicleNumber"
  | "propertyName"
  | "slotNumber"
  | "bookingDate";

function isUnauthorizedLike(message: string | null, status?: number) {
  if (status === 401 || status === 403) return true;
  if (!message) return false;
  const lowered = message.toLowerCase();
  return (
    lowered.includes("unauthorized") ||
    lowered.includes("access required") ||
    lowered.includes("forbidden")
  );
}

function toVisibleError(message: string | null) {
  if (!message) return null;
  if (isUnauthorizedLike(message)) {
    return null;
  }
  return message;
}

export default function ViewBookings() {
  const router = useRouter();

  const [activeItem, setActiveItem] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState<SortableField>("bookingDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerProfile | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<BookingPaymentDetails | null>(null);

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/land_owner" },
    { id: "bookings", label: "View Booking Details", icon: CalendarDays, href: "/land_owner/view_booking" },
    { id: "slots", label: "Add Slots", icon: PlusSquare, href: "/land_owner/add_slots" },
  ];

  const openSignOutModal = () => {
    setSidebarOpen(false);
    setShowSignOutModal(true);
  };

  const closeSignOutModal = () => {
    setShowSignOutModal(false);
  };

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
    } catch (signOutError) {
      console.error("Sign out error:", signOutError);
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

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch("/api/parking-lots", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch properties");
        const payload = await response.json();
        const rows = Array.isArray(payload?.parkingLots) ? payload.parkingLots : [];
        const mapped: OwnerProperty[] = rows.map((row: { id: string; name: string; address: string }) => ({
          id: String(row.id),
          name: String(row.name || ""),
          address: String(row.address || ""),
        }));
        setProperties(mapped);
      } catch (fetchError) {
        console.error("Properties fetch error:", fetchError);
      }
    }
    fetchProperties();
  }, []);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (selectedProperty !== "all") query.set("propertyId", selectedProperty);
        if (selectedDate) query.set("date", selectedDate);
        if (selectedTime) query.set("startTime", selectedTime);
        if (searchTerm.trim()) query.set("search", searchTerm.trim());

        const response = await fetch(`/api/land-owner/bookings?${query.toString()}`, {
          cache: "no-store",
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = typeof payload?.error === "string" ? payload.error : "Failed to fetch bookings";
          if (isUnauthorizedLike(message, response.status)) {
            setBookings([]);
            setError(null);
            return;
          }
          throw new Error(message);
        }
        const rows = Array.isArray(payload?.bookings) ? payload.bookings : [];

        const mapped: OwnerBooking[] = rows.map(
          (row: {
            bookingId: string;
            bookingNumber: string;
            propertyId: string;
            propertyName: string;
            customerId: string;
            customerName: string;
            customerEmail: string;
            vehicleNumber: string;
            slotNumber: string;
            bookingDate: string;
            startTime: string;
            endTime: string;
            totalAmount: number;
          }) => ({
            bookingId: String(row.bookingId),
            bookingNumber: String(row.bookingNumber || ""),
            propertyId: String(row.propertyId || ""),
            propertyName: String(row.propertyName || ""),
            customerId: String(row.customerId || ""),
            customerName: String(row.customerName || "N/A"),
            customerEmail: String(row.customerEmail || "N/A"),
            vehicleNumber: String(row.vehicleNumber || "N/A"),
            slotNumber: String(row.slotNumber || "N/A"),
            bookingDate: String(row.bookingDate),
            startTime: String(row.startTime),
            endTime: String(row.endTime),
            totalAmount: Number(row.totalAmount || 0),
          })
        );
        setBookings(mapped);
      } catch (fetchError) {
        const raw = fetchError instanceof Error ? fetchError.message : "Failed to fetch bookings";
        if (isUnauthorizedLike(raw)) {
          setBookings([]);
          setError(null);
          return;
        }
        console.error("Bookings fetch error:", fetchError);
        setBookings([]);
        setError(toVisibleError(raw));
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [selectedProperty, selectedDate, selectedTime, searchTerm]);

  const sortedBookings = useMemo(() => {
    const rows = [...bookings];
    rows.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [bookings, sortDirection, sortField]);

  const paginatedBookings = useMemo(() => {
    return sortedBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [currentPage, sortedBookings]);

  const totalPages = Math.max(1, Math.ceil(sortedBookings.length / itemsPerPage));

  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  const viewCustomerDetails = async (booking: OwnerBooking) => {
    setShowCustomerModal(true);
    setCustomerLoading(true);
    setCustomerError(null);
    setSelectedCustomer(null);

    try {
      const response = await fetch(`/api/land-owner/customers/${booking.customerId}`, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.data) {
        const message = typeof payload?.error === "string" ? payload.error : "Failed to fetch customer details";
        if (isUnauthorizedLike(message, response.status)) {
          setShowCustomerModal(false);
          return;
        }
        throw new Error(message);
      }

      const data = payload.data;
      const mapped: AdminCustomerProfile = {
        id: String(data.id),
        fullName: data.fullName ?? null,
        email: data.email ?? null,
        nic: data.nic ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        role: data.role ?? null,
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
        vehicle: {
          registrationNumber: data.vehicle?.registrationNumber ?? null,
          type: data.vehicle?.type ?? null,
          model: data.vehicle?.model ?? null,
          color: data.vehicle?.color ?? null,
        },
      };
      setSelectedCustomer(mapped);
    } catch (fetchError) {
      const raw = fetchError instanceof Error ? fetchError.message : "Failed to fetch customer details";
      if (isUnauthorizedLike(raw)) {
        setCustomerError(null);
        setShowCustomerModal(false);
        return;
      }
      console.error("Customer details fetch error:", fetchError);
      setCustomerError(raw);
    } finally {
      setCustomerLoading(false);
    }
  };

  const viewPaymentDetails = async (booking: OwnerBooking) => {
    setShowPaymentModal(true);
    setPaymentLoading(true);
    setPaymentError(null);
    setSelectedPaymentDetails(null);

    try {
      const response = await fetch(`/api/land-owner/bookings/${booking.bookingId}/payment`, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.data) {
        const message = typeof payload?.error === "string" ? payload.error : "Failed to fetch payment details";
        if (isUnauthorizedLike(message, response.status)) {
          setShowPaymentModal(false);
          return;
        }
        throw new Error(message);
      }
      setSelectedPaymentDetails(payload.data as BookingPaymentDetails);
    } catch (fetchError) {
      const raw = fetchError instanceof Error ? fetchError.message : "Failed to fetch payment details";
      if (isUnauthorizedLike(raw)) {
        setPaymentError(null);
        setShowPaymentModal(false);
        return;
      }
      console.error("Payment details fetch error:", fetchError);
      setPaymentError(raw);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`w-64 bg-gradient-to-b from-[#0F172A] to-[#020617] border-r border-white/10 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#E5E7EB]"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#84CC16] to-[#BEF264] flex items-center justify-center">
              <User className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#E5E7EB]">Land Owner</h2>
              <p className="text-sm text-[#94A3B8]">EasyPark</p>
            </div>
          </div>
        </div>

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

        <div className="p-4 border-t border-white/10">
          <button
            onClick={openSignOutModal}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 bg-gradient-to-b from-[#0F172A] to-[#020617] min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 text-[#E5E7EB]"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="mb-6 sm:mb-8 mt-14 lg:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E5E7EB]">View Booking Details</h1>
            <p className="text-[#94A3B8] mt-1 text-sm sm:text-base">Filter and view all customer bookings</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
              <select
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0F172A] py-3 pl-10 pr-4 text-sm text-[#E5E7EB] focus:border-[#84CC16] focus:outline-none"
              >
                <option value="all">All Properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0F172A] py-3 pl-10 pr-4 text-sm text-[#E5E7EB] focus:border-[#84CC16] focus:outline-none"
              />
            </div>

            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0F172A] py-3 pl-10 pr-4 text-sm text-[#E5E7EB] focus:border-[#84CC16] focus:outline-none"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0F172A] py-3 pl-10 pr-4 text-sm text-[#E5E7EB] placeholder:text-[#94A3B8] focus:border-[#84CC16] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/70 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {[
                      { key: "customerName", label: "Customer Name" },
                      { key: "customerEmail", label: "Customer Email" },
                      { key: "vehicleNumber", label: "Reg Number" },
                      { key: "propertyName", label: "Property" },
                      { key: "slotNumber", label: "Parking Slot" },
                      { key: "bookingDate", label: "Date" },
                    ].map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8] cursor-pointer hover:bg-white/5"
                        onClick={() => handleSort(column.key as SortableField)}
                      >
                        <div className="flex items-center gap-2">
                          <span>{column.label}</span>
                          {sortField === column.key ? <span>{sortDirection === "asc" ? "↑" : "↓"}</span> : null}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#94A3B8]">
                        <div className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading bookings...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#94A3B8]">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.bookingId} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-[#E5E7EB]">{booking.customerName}</td>
                        <td className="px-6 py-4 text-sm text-[#E5E7EB]">{booking.customerEmail || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-[#E5E7EB]">{booking.vehicleNumber || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-[#E5E7EB]">{booking.propertyName}</td>
                        <td className="px-6 py-4 text-sm text-[#E5E7EB]">{booking.slotNumber}</td>
                        <td className="px-6 py-4 text-sm text-[#E5E7EB]">
                          {new Date(booking.bookingDate).toISOString().split("T")[0]}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewPaymentDetails(booking)}
                              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-[#E5E7EB] hover:bg-white/10"
                            >
                              View Payment
                            </button>
                            <button
                              onClick={() => viewCustomerDetails(booking)}
                              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-[#E5E7EB] hover:bg-white/10"
                            >
                              View Customer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-[#94A3B8]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, sortedBookings.length)} of {sortedBookings.length} bookings
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[#E5E7EB] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[#E5E7EB] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <CustomerDetailsModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setCustomerLoading(false);
          setCustomerError(null);
          setSelectedCustomer(null);
        }}
        loading={customerLoading}
        error={customerError}
        customer={selectedCustomer}
      />

      <PaymentDetailsModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentLoading(false);
          setPaymentError(null);
          setSelectedPaymentDetails(null);
        }}
        loading={paymentLoading}
        error={paymentError}
        details={selectedPaymentDetails}
      />

      {showSignOutModal &&
        typeof document !== "undefined" &&
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
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-2.5 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex-1 rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/30 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
