"use client";

import type { CounterParkingArea, CounterViewKey } from "./types";

export default function TopBar({
  activeView,
  parkingAreas,
  selectedAreaId,
  onSelectArea,
  onRefresh,
  refreshing,
  onNewBooking,
}: {
  activeView: CounterViewKey;
  parkingAreas: CounterParkingArea[];
  selectedAreaId: string;
  onSelectArea: (id: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onNewBooking: () => void;
}) {
  const titleMap: Record<CounterViewKey, { title: string; subtitle?: string }> = {
    dashboard: { title: "Parking Dashboard", subtitle: "Live counter operations and slot occupancy" },
    parking: { title: "Parking Management", subtitle: "Slot status and running bookings for selected area" },
    reports: { title: "Reports", subtitle: "Daily, weekly, and monthly booking summaries" },
    analytics: { title: "Parking Analytics", subtitle: "Insights from shared booking and slot data" },
  };

  const entry = titleMap[activeView];

  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">{entry.title}</h1>
        {entry.subtitle ? <p className="text-sm text-slate-400">{entry.subtitle}</p> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="text-xs text-slate-400">
          Parking Area
          <select
            value={selectedAreaId}
            onChange={(event) => onSelectArea(event.target.value)}
            className="mt-2 w-full min-w-[280px] rounded-lg border border-white/10 bg-[#0B1220]/90 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/40"
          >
            {parkingAreas.length === 0 ? (
              <option value="">No parking areas</option>
            ) : (
              parkingAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} - {area.address}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewBooking}
            className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/30"
          >
            + New Booking
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}
