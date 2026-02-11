"use client";

import { Car, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
import SlotGrid from "./SlotGrid";
import AnalyticsPanel from "./AnalyticsPanel";
import type { CounterBooking, CounterParkingArea, CounterSlot, CounterStats } from "./types";

function formatMoney(amount: number) {
  return `LKR ${amount.toLocaleString()}`;
}

export default function DashboardView({
  selectedArea,
  stats,
  slots,
  bookings,
  activeBookings,
  loading,
  onSlotClick,
}: {
  selectedArea: CounterParkingArea | null;
  stats: CounterStats;
  slots: CounterSlot[];
  bookings: CounterBooking[];
  activeBookings: CounterBooking[];
  loading: boolean;
  onSlotClick: (slot: CounterSlot) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Total Spots" value={String(stats.totalSlots)} icon={Car} accentClass="text-slate-200" />
        <StatCard label="Available" value={String(stats.availableSlots)} icon={CheckCircle2} accentClass="text-lime-300" />
        <StatCard label="Occupied" value={String(stats.occupiedSlots)} icon={XCircle} accentClass="text-red-400" />
        <StatCard label="Revenue Today" value={formatMoney(stats.todayRevenue)} icon={DollarSign} accentClass="text-amber-300" />
      </div>

      {selectedArea ? (
        <div className="mt-4 rounded-xl border border-white/5 bg-[#0F172A]/70 px-4 py-3 text-sm text-slate-300">
          Area: <span className="font-semibold text-white">{selectedArea.name}</span> ({selectedArea.address})
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <SlotGrid slots={slots} loading={loading} onSlotClick={onSlotClick} />

        <div className="space-y-5">
          <AnalyticsPanel stats={stats} bookings={bookings} />

          <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Active Bookings</h3>
              <span className="text-xs text-slate-500">{stats.activeBookings} active</span>
            </div>
            {activeBookings.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-8 text-center">
                <div className="h-10 w-10 rounded-xl bg-white/5" />
                <p className="text-sm text-slate-300">No active bookings</p>
                <p className="text-xs text-slate-500">Create a new booking from the top bar.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {activeBookings
                  .slice(0, 6)
                  .map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="rounded-xl border border-white/5 bg-[#0B1220]/80 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{booking.bookingNumber}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            booking.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-300">{booking.customerName}</p>
                      <p className="text-slate-500">
                        {booking.slotNumber} · {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
