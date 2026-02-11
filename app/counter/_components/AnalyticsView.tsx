"use client";

import { useMemo, useState } from "react";
import { Calendar, Filter, BarChart3, Users, Ticket, Wallet } from "lucide-react";
import StatCard from "./StatCard";
import type { CounterBooking, CounterParkingArea, CounterSlot, CounterStats } from "./types";

type AnalyticsFilter = "all" | "occupied" | "upcoming" | "past";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMoney(amount: number) {
  return `LKR ${amount.toLocaleString()}`;
}

export default function AnalyticsView({
  selectedArea,
  stats,
  bookings,
  slots,
  loading,
}: {
  selectedArea: CounterParkingArea | null;
  stats: CounterStats;
  bookings: CounterBooking[];
  slots: CounterSlot[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<AnalyticsFilter>("all");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return toDateInputValue(date);
  });
  const [endDate, setEndDate] = useState(() => toDateInputValue(new Date()));
  const now = new Date();

  const filteredBookings = useMemo(() => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);
    const now = new Date();
    return bookings.filter((booking) => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) return false;
      if (startTime < start || startTime > end) return false;
      if (filter === "occupied") return booking.status !== "CANCELLED" && startTime <= now && endTime > now;
      if (filter === "upcoming") return booking.status !== "CANCELLED" && startTime > now;
      if (filter === "past") return endTime <= now;
      return true;
    });
  }, [bookings, endDate, filter, startDate]);

  const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const upcomingBookings = filteredBookings.filter(
    (booking) => new Date(booking.startTime).getTime() > now.getTime()
  ).length;

  return (
    <div>
      <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Calendar className="h-4 w-4 text-lime-300" />
          Select Date Range
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="text-xs text-slate-400">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/40"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/40"
            />
          </div>
        </div>
        {selectedArea ? (
          <p className="mt-4 text-xs text-slate-500">
            Area: {selectedArea.name} ({selectedArea.address})
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Total Bookings" value={String(filteredBookings.length)} icon={Ticket} accentClass="text-lime-300" subText="" />
        <StatCard label="Currently Occupied" value={String(stats.occupiedSlots)} icon={Users} accentClass="text-red-400" subText="" />
        <StatCard label="Upcoming Bookings" value={String(upcomingBookings)} icon={Filter} accentClass="text-amber-300" subText="" />
        <StatCard label="Total Revenue" value={formatMoney(totalRevenue)} icon={Wallet} accentClass="text-emerald-300" subText="" />
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Filter className="h-4 w-4 text-lime-300" />
          Filter by Status
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === "all"
                ? "bg-lime-400 text-slate-900"
                : "border border-white/10 bg-white/5 text-slate-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("occupied")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === "occupied"
                ? "bg-lime-400 text-slate-900"
                : "border border-white/10 bg-white/5 text-slate-200"
            }`}
          >
            Occupied
          </button>
          <button
            type="button"
            onClick={() => setFilter("upcoming")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === "upcoming"
                ? "bg-lime-400 text-slate-900"
                : "border border-white/10 bg-white/5 text-slate-200"
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setFilter("past")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === "past"
                ? "bg-lime-400 text-slate-900"
                : "border border-white/10 bg-white/5 text-slate-200"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BarChart3 className="h-4 w-4 text-lime-300" />
            Parking Details
          </div>
          {loading ? (
            <div className="mt-6 flex items-center justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-8 text-center text-sm text-slate-400">
              No bookings found for selected date range
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="px-3 py-2">Booking</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.slice(0, 12).map((booking) => (
                    <tr key={booking.bookingId} className="border-b border-white/5 text-slate-300">
                      <td className="px-3 py-2">{booking.bookingNumber}</td>
                      <td className="px-3 py-2">{booking.customerName}</td>
                      <td className="px-3 py-2">{booking.status}</td>
                      <td className="px-3 py-2 text-lime-300">{formatMoney(booking.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Filter className="h-4 w-4 text-lime-300" />
            Details
          </div>
          <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-4 text-sm text-slate-300">
            <p className="text-xs text-slate-500">Slot Summary</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Total Slots</p>
                <p className="font-semibold text-white">{slots.length}</p>
              </div>
              <div>
                <p className="text-slate-500">Available</p>
                <p className="font-semibold text-lime-300">
                  {slots.filter((slot) => slot.status === "AVAILABLE").length}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Occupied</p>
                <p className="font-semibold text-rose-300">
                  {slots.filter((slot) => slot.status === "OCCUPIED").length}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Maintenance</p>
                <p className="font-semibold text-amber-300">
                  {slots.filter((slot) => slot.status === "MAINTENANCE").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <h3 className="text-sm font-semibold text-lime-300">Occupancy Chart</h3>
        <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-5 text-xs text-slate-300">
          <div className="h-4 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400"
              style={{
                width: `${stats.totalSlots > 0 ? Math.round((stats.occupiedSlots / stats.totalSlots) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="mt-3 text-slate-400">
            Occupancy: {stats.occupiedSlots} / {stats.totalSlots} slots
          </p>
        </div>
      </div>
    </div>
  );
}
