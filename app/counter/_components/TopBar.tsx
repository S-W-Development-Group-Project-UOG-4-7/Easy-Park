"use client";

type ViewKey = "dashboard" | "parking" | "reports" | "analytics";

export default function TopBar({
  activeView,
  onNewBooking,
}: {
  activeView: ViewKey;
  onNewBooking: () => void;
}) {
  if (activeView !== "dashboard") {
    const titleMap: Record<ViewKey, { title: string; subtitle?: string }> = {
      dashboard: { title: "Parking Dashboard", subtitle: "Real-time parking management system" },
      parking: { title: "Parking Management" },
      reports: { title: "Reports", subtitle: "Generate and download parking reports" },
      analytics: { title: "Parking Analytics" },
    };
    const entry = titleMap[activeView];
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">{entry.title}</h1>
        {entry.subtitle ? (
          <p className="text-sm text-slate-400">{entry.subtitle}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">Parking Dashboard</h1>
        <p className="text-sm text-slate-400">
          Real-time parking management system
        </p>
      </div>
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
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200"
        >
          Reset Slots
        </button>
      </div>
    </div>
  );
}
