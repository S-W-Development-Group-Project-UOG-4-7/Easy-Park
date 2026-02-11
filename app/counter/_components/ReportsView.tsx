import { FileText, Car, DollarSign, Clock, Timer } from "lucide-react";
import StatCard from "./StatCard";

export default function ReportsView() {
  return (
    <div>
      <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Select Report Period:</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-lime-400 px-3 py-1.5 text-xs font-semibold text-slate-900">
                Daily
              </button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                Weekly
              </button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                Monthly
              </button>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30">
            <FileText className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Total Vehicles" value="0" icon={Car} accentClass="text-lime-300" subText="" />
        <StatCard label="Total Revenue" value="$0" icon={DollarSign} accentClass="text-emerald-300" subText="" />
        <StatCard label="Avg Stay Time" value="0h 0m" icon={Clock} accentClass="text-amber-300" subText="" />
        <StatCard label="Peak Hours" value="N/A" icon={Timer} accentClass="text-slate-300" subText="" />
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <h3 className="text-sm font-semibold text-white">Detailed Vehicle Records</h3>
        <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-10 text-center text-sm text-slate-400">
          <p>No vehicles found for this period</p>
          <p className="mt-1 text-xs text-slate-500">
            Vehicles will appear here once they're booked in the parking system
          </p>
        </div>
      </div>
    </div>
  );
}
