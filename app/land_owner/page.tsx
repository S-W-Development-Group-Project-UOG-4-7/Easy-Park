"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, CalendarDays, PlusSquare, LogOut, User, DollarSign, BarChart3, Menu } from "lucide-react";

type BookingStatus = "PENDING" | "PAID" | "CANCELLED";
type TimeFilter = "all" | "morning" | "afternoon" | "evening";

type DashboardBooking = {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  vehicleNumber: string;
  slotNumber: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
};

type OwnerProperty = { id: string; totalSlots: number };
type LandOwnerBookingRow = {
  bookingId?: string;
  bookingNumber?: string;
  customerName?: string;
  vehicleNumber?: string;
  slotNumber?: string;
  startTime?: string;
  endTime?: string;
  totalAmount?: number;
  status?: string;
  bookingStatus?: string;
};
type ParkingLotRow = { id?: string; totalSlots?: number };

const pad2 = (v: number) => String(v).padStart(2, "0");
const toLocalDate = (value: string | Date) => {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const period = (startTime: string): TimeFilter | "night" => {
  const h = new Date(startTime).getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
};

export default function LandOwnerHome() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ownerName, setOwnerName] = useState("Land Owner");
  const [selectedDate, setSelectedDate] = useState(toLocalDate(new Date()));
  const [selectedTime, setSelectedTime] = useState<TimeFilter>("all");
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [bookingsRes, propertiesRes, meRes] = await Promise.all([
          fetch("/api/land-owner/bookings", { cache: "no-store", credentials: "include" }),
          fetch("/api/parking-lots", { cache: "no-store", credentials: "include" }),
          fetch("/api/auth/me", { cache: "no-store", credentials: "include" }),
        ]);

        const bookingsJson = await bookingsRes.json().catch(() => ({}));
        const propertiesJson = await propertiesRes.json().catch(() => ({}));
        const meJson = await meRes.json().catch(() => ({}));
        if (!bookingsRes.ok) throw new Error(bookingsJson?.error || "Failed to fetch bookings");
        if (!propertiesRes.ok) throw new Error(propertiesJson?.error || "Failed to fetch properties");

        const rows: LandOwnerBookingRow[] = Array.isArray(bookingsJson?.bookings) ? bookingsJson.bookings : [];
        setBookings(
          rows.map((row) => ({
            bookingId: String(row.bookingId || ""),
            bookingNumber: String(row.bookingNumber || ""),
            customerName: String(row.customerName || "N/A"),
            vehicleNumber: String(row.vehicleNumber || "N/A"),
            slotNumber: String(row.slotNumber || "N/A"),
            startTime: String(row.startTime),
            endTime: String(row.endTime),
            totalAmount: Number(row.totalAmount || 0),
            status: String(row.status || row.bookingStatus || "PENDING").toUpperCase() as BookingStatus,
          }))
        );

        const lots: ParkingLotRow[] = Array.isArray(propertiesJson?.parkingLots) ? propertiesJson.parkingLots : [];
        setProperties(lots.map((lot) => ({ id: String(lot.id || ""), totalSlots: Number(lot.totalSlots || 0) })));

        if (meJson?.success && meJson?.data) {
          const role = String(meJson.data.role || "").toUpperCase();
          if (role === "ADMIN") {
            setOwnerName("Land Owner");
          } else if (meJson.data.fullName) {
            setOwnerName(String(meJson.data.fullName));
          }
        }
      } catch (e) {
        setBookings([]);
        setProperties([]);
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const bookingsForDate = useMemo(
    () => bookings.filter((b) => toLocalDate(b.startTime) === selectedDate),
    [bookings, selectedDate]
  );
  const visibleBookings = useMemo(
    () => (selectedTime === "all" ? bookingsForDate : bookingsForDate.filter((b) => period(b.startTime) === selectedTime)),
    [bookingsForDate, selectedTime]
  );
  const totalSlots = useMemo(() => properties.reduce((sum, p) => sum + p.totalSlots, 0), [properties]);
  const todayRevenue = useMemo(
    () => bookingsForDate.filter((b) => b.status !== "CANCELLED").reduce((sum, b) => sum + b.totalAmount, 0),
    [bookingsForDate]
  );
  const totalRevenue = useMemo(
    () => bookings.filter((b) => b.status !== "CANCELLED").reduce((sum, b) => sum + b.totalAmount, 0),
    [bookings]
  );
  const active = bookingsForDate.filter((b) => b.status === "PENDING").length;
  const completed = bookingsForDate.filter((b) => b.status === "PAID").length;
  const occupancy = totalSlots > 0 ? Math.round((active / totalSlots) * 100) : 0;

  const openSignOutModal = () => {
    setSidebarOpen(false);
    setShowSignOutModal(true);
  };

  const closeSignOutModal = () => {
    setShowSignOutModal(false);
  };

  const signOut = async () => {
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

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617]">
      <aside
        className={`w-64 bg-gradient-to-b from-[#0F172A] to-[#020617] border-r border-white/10 flex flex-col fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#84CC16] to-[#BEF264]">
              <User className="h-6 w-6 text-[#0F172A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#E5E7EB]">{ownerName}</h2>
              <p className="text-sm text-[#94A3B8]">Lot Owner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/land_owner"
                className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#84CC16] to-[#BEF264] px-4 py-3 font-semibold text-[#0F172A]"
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/land_owner/view_booking"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E5E7EB]"
              >
                <CalendarDays className="h-5 w-5" />
                View Booking Details
              </Link>
            </li>
            <li>
              <Link
                href="/land_owner/add_slots"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E5E7EB]"
              >
                <PlusSquare className="h-5 w-5" />
                Add Slots
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={openSignOutModal}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-5 w-5" />
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:ml-64 lg:p-8">
        <button onClick={() => setSidebarOpen((v) => !v)} className="fixed left-4 top-4 z-30 rounded-xl border border-white/10 bg-[#0F172A] p-2 text-[#E5E7EB] lg:hidden"><Menu className="h-6 w-6" /></button>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 mt-14 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
            <div><h1 className="text-3xl font-bold text-[#E5E7EB]">Welcome Back, {ownerName.split(" ")[0] || "Owner"}!</h1><p className="text-[#94A3B8]">Here&apos;s what&apos;s happening with your parking lot today.</p></div>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-xl border border-white/10 bg-[#0F172A] px-4 py-3 text-[#E5E7EB] [color-scheme:dark]" />
          </div>

          {error && <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5"><div className="mb-2 flex items-center justify-between text-[#94A3B8]"><span>Today&apos;s Bookings</span><CalendarDays className="h-5 w-5 text-blue-400" /></div><p className="text-4xl font-bold text-[#E5E7EB]">{bookingsForDate.length}</p></div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5"><div className="mb-2 flex items-center justify-between text-[#94A3B8]"><span>Revenue</span><DollarSign className="h-5 w-5 text-[#84CC16]" /></div><p className="text-4xl font-bold text-[#E5E7EB]">${todayRevenue.toFixed(2)}</p></div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5"><div className="mb-2 flex items-center justify-between text-[#94A3B8]"><span>Total Bookings</span><BarChart3 className="h-5 w-5 text-purple-400" /></div><p className="text-4xl font-bold text-[#E5E7EB]">{bookings.length}</p></div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#84CC16]">Bookings for {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</h2>
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value as TimeFilter)} className="rounded-lg border border-white/10 bg-[#0F172A] px-3 py-2 text-sm text-[#E5E7EB]">
                  <option value="all">All Day</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option>
                </select>
              </div>
              {loading ? <div className="py-10 text-center text-[#94A3B8]">Loading...</div> : visibleBookings.length === 0 ? <div className="py-10 text-center text-[#94A3B8]">No bookings found</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-left text-[#94A3B8]"><th className="pb-3">Booking</th><th className="pb-3">Customer</th><th className="pb-3">Reg Number</th><th className="pb-3">Slot</th><th className="pb-3">Time</th><th className="pb-3">Status</th></tr></thead>
                    <tbody>{visibleBookings.map((b) => <tr key={b.bookingId} className="border-b border-white/5 text-[#E5E7EB]"><td className="py-3">{b.bookingNumber}</td><td className="py-3">{b.customerName}</td><td className="py-3">{b.vehicleNumber}</td><td className="py-3">{b.slotNumber}</td><td className="py-3">{new Date(b.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td><td className="py-3">{b.status}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
              <Link href="/land_owner/view_booking" className="mt-4 inline-flex text-sm text-[#84CC16] hover:underline">View all bookings →</Link>
            </section>

            <aside className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5">
              <h3 className="mb-4 text-xl font-semibold text-[#84CC16]">Quick Stats</h3>
              <div className="space-y-2 text-sm text-[#94A3B8]"><div className="flex justify-between"><span>Occupancy Rate</span><span className="text-[#E5E7EB]">{occupancy}%</span></div><div className="flex justify-between"><span>Active Bookings</span><span className="text-[#E5E7EB]">{active}</span></div><div className="flex justify-between"><span>Completed</span><span className="text-[#E5E7EB]">{completed}</span></div></div>
              <div className="mt-4 border-t border-white/10 pt-4"><p className="text-sm text-[#94A3B8]">Total Revenue</p><p className="text-3xl font-bold text-[#84CC16]">${totalRevenue.toFixed(2)}</p><p className="text-xs text-[#94A3B8]">from {bookings.length} bookings</p></div>
            </aside>
          </div>
        </div>
      </main>

      {showSignOutModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSignOutModal} />

            <div className="relative z-[10000] mx-4 w-full max-w-md rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl">
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
                  onClick={signOut}
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
