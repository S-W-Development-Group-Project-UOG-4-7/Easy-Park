"use client";

import type { CounterSlot } from "./types";

function SlotTile({
  slot,
}: {
  slot: CounterSlot;
}) {
  const isOccupied = slot.status === "OCCUPIED";
  const isMaintenance = slot.status === "MAINTENANCE";
  return (
    <div
      className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-semibold transition ${
        isOccupied
          ? "bg-red-500/20 text-red-200 border-red-500/30"
          : isMaintenance
            ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
            : "bg-[#0F172A] text-lime-200 hover:bg-lime-400/20 border-lime-400/20"
      } border border-white/5`}
      title={`${slot.slotNumber} - ${slot.status}`}
    >
      {isOccupied ? (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-400" />
      ) : null}
      {isMaintenance ? (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
      ) : null}
      {slot.slotNumber}
    </div>
  );
}

export default function SlotGrid({
  slots,
  loading,
  onSlotClick,
}: {
  slots: CounterSlot[];
  loading: boolean;
  onSlotClick?: (slot: CounterSlot) => void;
}) {
  const normalSlots = slots.filter((slot) => slot.type === "NORMAL");
  const evSlots = slots.filter((slot) => slot.type === "EV");
  const carWashSlots = slots.filter((slot) => slot.type === "CAR_WASH");
  const availableCount = slots.filter((slot) => slot.status === "AVAILABLE").length;
  const occupiedCount = slots.filter((slot) => slot.status === "OCCUPIED").length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-200">
            Selected Parking Area
          </span>
          <span>Live slot status</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Total: {slots.length}</span>
          <span className="text-lime-400">Available: {availableCount}</span>
          <span className="text-red-400">Occupied: {occupiedCount}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-white/5 bg-[#0B1220]/80 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Parking Area</span>
            <span>Normal slots</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {normalSlots.length === 0 ? (
              <p className="col-span-8 py-4 text-center text-xs text-slate-500">No normal slots configured</p>
            ) : (
              normalSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSlotClick?.(slot)}
                  className="rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/40"
                >
                  <SlotTile slot={slot} />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#0B1220]/80 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Car Wash</span>
              <span>CW slots</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {carWashSlots.length === 0 ? (
                <p className="col-span-4 py-4 text-center text-xs text-slate-500">No car wash slots</p>
              ) : (
                carWashSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSlotClick?.(slot)}
                    className="rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/40"
                  >
                    <SlotTile slot={slot} />
                  </button>
                ))
              )}
            </div>
            <div className="mt-4 rounded-xl border border-white/5 bg-[#0F172A]/80 px-4 py-6 text-center text-xs font-semibold text-slate-400">
              WASHING AREA
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0B1220]/80 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">EV Charging</span>
              <span>EV slots</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {evSlots.length === 0 ? (
                <p className="col-span-6 py-4 text-center text-xs text-slate-500">No EV slots</p>
              ) : (
                evSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSlotClick?.(slot)}
                    className="rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/40"
                  >
                    <SlotTile slot={slot} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
