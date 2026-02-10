import { Calendar, Filter, BarChart3, Users, Ticket, Wallet } from "lucide-react";
import StatCard from "./StatCard";

export default function AnalyticsView() {
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
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-300">
              <span>dd/mm/yyyy</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">End Date</label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-300">
              <span>dd/mm/yyyy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Total Bookings" value="0" icon={Ticket} accentClass="text-lime-300" subText="" />
        <StatCard label="Currently Occupied" value="0" icon={Users} accentClass="text-red-400" subText="" />
        <StatCard label="Upcoming Bookings" value="0" icon={Filter} accentClass="text-amber-300" subText="" />
        <StatCard label="Total Revenue" value="$0.00" icon={Wallet} accentClass="text-emerald-300" subText="" />
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Filter className="h-4 w-4 text-lime-300" />
          Filter by Status
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded-lg bg-lime-400 px-3 py-1.5 text-xs font-semibold text-slate-900">
            All
          </button>
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
            Occupied
          </button>
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
            Upcoming
          </button>
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
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
          <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-8 text-center text-sm text-slate-400">
            No bookings found for selected date range
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Filter className="h-4 w-4 text-lime-300" />
            Details
          </div>
          <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-8 text-center text-sm text-slate-400">
            Select a booking to view details
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <h3 className="text-sm font-semibold text-lime-300">Occupancy Chart</h3>
        <div className="mt-6 h-28 rounded-xl border border-white/5 bg-[#0B1220]/80" />
      </div>
    </div>
  );
}
