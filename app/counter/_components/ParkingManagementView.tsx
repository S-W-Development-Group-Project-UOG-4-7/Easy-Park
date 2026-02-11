import { CheckCircle2, XCircle, DollarSign } from "lucide-react";
import StatCard from "./StatCard";

const activities = [
  { message: "Vehicle #1234 entered", time: "2 min ago" },
  { message: "Vehicle #5678 exited", time: "5 min ago" },
  { message: "Vehicle #9012 entered", time: "8 min ago" },
];

export default function ParkingManagementView() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          label="Available Spots"
          value="45"
          icon={CheckCircle2}
          accentClass="text-lime-300"
          subText="out of 100 total"
        />
        <StatCard
          label="Occupied"
          value="55"
          icon={XCircle}
          accentClass="text-red-400"
          subText="currently in use"
        />
        <StatCard
          label="Revenue Today"
          value="$1,250"
          icon={DollarSign}
          accentClass="text-amber-300"
          subText="from parking fees"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        <div className="mt-4 divide-y divide-white/5">
          {activities.map((activity) => (
            <div
              key={activity.message}
              className="flex items-center justify-between py-3 text-sm text-slate-300"
            >
              <span>{activity.message}</span>
              <span className="text-xs text-lime-300">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
