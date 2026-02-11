import { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accentClass = "text-lime-300",
  subText = "Updated just now",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accentClass?: string;
  subText?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-4 shadow-lg shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <div className="rounded-lg bg-white/5 p-2">
          <Icon className={`h-4 w-4 ${accentClass}`} />
        </div>
      </div>
      <div className="mt-4 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[11px] text-slate-500">{subText}</div>
    </div>
  );
}
