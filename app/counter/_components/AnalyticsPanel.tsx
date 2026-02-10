import { TrendingUp, Clock, Activity, DollarSign, Lightbulb } from "lucide-react";

export default function AnalyticsPanel() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Analytics</h3>
        <span className="text-xs text-lime-400">30%</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-white/5">
        <div className="h-2 w-[30%] rounded-full bg-lime-400" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-3 w-3 text-lime-300" />
            Peak Hour
          </div>
          <div className="mt-1 text-sm font-semibold text-white">9:00 AM</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="h-3 w-3 text-lime-300" />
            Avg Stay
          </div>
          <div className="mt-1 text-sm font-semibold text-white">2h 15m</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="h-3 w-3 text-lime-300" />
            Turnover
          </div>
          <div className="mt-1 text-sm font-semibold text-white">68/day</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="h-3 w-3 text-lime-300" />
            Revenue/hr
          </div>
          <div className="mt-1 text-sm font-semibold text-lime-300">$45</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-[#0B1220]/80 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Lightbulb className="h-3 w-3 text-lime-300" />
          Quick Tips
        </div>
        <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
          <li>Click available slots to book</li>
          <li>Click occupied slots to remove</li>
          <li>Hover for details</li>
        </ul>
      </div>
    </div>
  );
}
