import { TrendingUp, Clock, Activity, DollarSign, Lightbulb } from "lucide-react";
import type { CounterBooking, CounterStats } from "./types";

function averageStay(bookings: CounterBooking[]) {
  if (bookings.length === 0) return "0h 0m";
  const totalMinutes = bookings.reduce((sum, booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return sum;
    return sum + Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
  }, 0);
  const avgMinutes = Math.round(totalMinutes / bookings.length);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function AnalyticsPanel({
  stats,
  bookings,
}: {
  stats: CounterStats;
  bookings: CounterBooking[];
}) {
  const occupancyRate = stats.totalSlots > 0 ? Math.round((stats.occupiedSlots / stats.totalSlots) * 100) : 0;
  const paidBookings = bookings.filter((booking) => booking.status === "PAID");
  const avgRevenue = paidBookings.length > 0 ? stats.todayRevenue / paidBookings.length : 0;
  const sortedByStart = [...bookings].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const peakHour = sortedByStart[0]?.startTime
    ? new Date(sortedByStart[0].startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "N/A";

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Analytics</h3>
        <span className="text-xs text-lime-400">{occupancyRate}%</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-white/5">
        <div className="h-2 rounded-full bg-lime-400" style={{ width: `${Math.min(100, occupancyRate)}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-3 w-3 text-lime-300" />
            Peak Hour
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{peakHour}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="h-3 w-3 text-lime-300" />
            Avg Stay
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{averageStay(bookings)}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="h-3 w-3 text-lime-300" />
            Turnover
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{bookings.length}/day</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="h-3 w-3 text-lime-300" />
            Revenue/hr
          </div>
          <div className="mt-1 text-sm font-semibold text-lime-300">
            LKR {avgRevenue.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Lightbulb className="h-3 w-3 text-lime-300" />
          Quick Tips
        </div>
        <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
          <li>Use parking-area dropdown to switch live data</li>
          <li>Create bookings to update slot occupancy instantly</li>
          <li>Counter and customer views share the same records</li>
        </ul>
      </div>
    </div>
  );
}
