"use client";

import { Car, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
import SlotGrid from "./SlotGrid";
import AnalyticsPanel from "./AnalyticsPanel";

export default function DashboardView() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Total Spots" value="106" icon={Car} accentClass="text-slate-200" />
        <StatCard label="Available" value="74" icon={CheckCircle2} accentClass="text-lime-300" />
        <StatCard label="Occupied" value="32" icon={XCircle} accentClass="text-red-400" />
        <StatCard label="Revenue" value="$0" icon={DollarSign} accentClass="text-amber-300" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <SlotGrid />

        <div className="space-y-5">
          <AnalyticsPanel />

          <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Active Bookings</h3>
              <span className="text-xs text-slate-500">0 active</span>
            </div>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-8 text-center">
              <div className="h-10 w-10 rounded-xl bg-white/5" />
              <p className="text-sm text-slate-300">No active bookings</p>
              <p className="text-xs text-slate-500">
                Click on available slots to book
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
