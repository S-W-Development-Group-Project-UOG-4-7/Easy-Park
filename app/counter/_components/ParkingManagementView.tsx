"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
import type { CounterBooking, CounterParkingArea, CounterSlot, CounterStats } from "./types";

function formatMoney(amount: number) {
  return `LKR ${amount.toLocaleString()}`;
}

export default function ParkingManagementView({
  selectedArea,
  stats,
  slots,
  bookings,
  loading,
  onRefresh,
}: {
  selectedArea: CounterParkingArea | null;
  stats: CounterStats;
  slots: CounterSlot[];
  bookings: CounterBooking[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const recent = [...bookings]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 12);

  const updateBooking = async (bookingId: string, payload: { status?: string; collectCashAmount?: number }) => {
    setUpdatingBookingId(bookingId);
    setActionError(null);
    try {
      const response = await fetch(`/api/counter/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.success) {
        throw new Error(body?.error || body?.message || "Failed to update booking");
      }
      onRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update booking");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          label="Available Spots"
          value={String(stats.availableSlots)}
          icon={CheckCircle2}
          accentClass="text-lime-300"
          subText={`out of ${stats.totalSlots} total`}
        />
        <StatCard
          label="Occupied"
          value={String(stats.occupiedSlots)}
          icon={XCircle}
          accentClass="text-red-400"
          subText="currently in use"
        />
        <StatCard
          label="Revenue Today"
          value={formatMoney(stats.todayRevenue)}
          icon={DollarSign}
          accentClass="text-amber-300"
          subText={`${bookings.length} bookings`}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
          >
            Refresh
          </button>
        </div>
        {selectedArea ? (
          <p className="mt-2 text-xs text-slate-500">
            Area: {selectedArea.name} ({selectedArea.address})
          </p>
        ) : null}
        {actionError ? (
          <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {actionError}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-8 text-center text-sm text-slate-400">
            No booking activity available for this area.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-white/5">
            {recent.map((booking) => (
              <div
                key={booking.bookingId}
                className="flex flex-col gap-2 py-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-200">
                    {booking.customerName} · {booking.vehicleNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    Slot {booking.slotNumber} · {booking.bookingNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {booking.status !== "CANCELLED" && booking.balanceDue > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateBooking(booking.bookingId, {
                          collectCashAmount: booking.balanceDue,
                        })
                      }
                      disabled={updatingBookingId === booking.bookingId}
                      className="rounded-md border border-lime-500/40 bg-lime-500/10 px-2 py-1 text-[10px] font-semibold text-lime-200 disabled:opacity-50"
                    >
                      Collect Due
                    </button>
                  ) : null}
                  {booking.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => updateBooking(booking.bookingId, { status: "CANCELLED" })}
                      disabled={updatingBookingId === booking.bookingId}
                      className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      booking.status === "PAID"
                        ? "bg-emerald-500/20 text-emerald-300"
                      : booking.status === "CANCELLED"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {booking.status}
                  </span>
                  <span className="text-xs text-lime-300">
                    {updatingBookingId === booking.bookingId
                      ? "Updating..."
                      : new Date(booking.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 p-4 text-xs text-slate-400">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-slate-500">Normal Slots</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {slots.filter((slot) => slot.type === "NORMAL").length}
              </p>
            </div>
            <div>
              <p className="text-slate-500">EV Slots</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {slots.filter((slot) => slot.type === "EV").length}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Car Wash Slots</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {slots.filter((slot) => slot.type === "CAR_WASH").length}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Maintenance</p>
              <p className="mt-1 text-sm font-semibold text-white">{stats.maintenanceSlots}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
