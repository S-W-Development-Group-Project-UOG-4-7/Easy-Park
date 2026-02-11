"use client";

import { useMemo, useState } from "react";
import { FileText, Car, DollarSign, Clock, Timer } from "lucide-react";
import StatCard from "./StatCard";
import type { CounterBooking, CounterParkingArea } from "./types";

type ReportPeriod = "daily" | "weekly" | "monthly";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatMoney(amount: number) {
  return `LKR ${amount.toLocaleString()}`;
}

export default function ReportsView({
  selectedArea,
  bookings,
  loading,
}: {
  selectedArea: CounterParkingArea | null;
  bookings: CounterBooking[];
  loading: boolean;
}) {
  const [period, setPeriod] = useState<ReportPeriod>("daily");

  const filtered = useMemo(() => {
    const now = new Date();
    const start = startOfDay(now);
    if (period === "weekly") start.setDate(start.getDate() - 6);
    if (period === "monthly") start.setDate(start.getDate() - 29);

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime || booking.bookingDate);
      return !Number.isNaN(bookingDate.getTime()) && bookingDate >= start;
    });
  }, [bookings, period]);

  const totalVehicles = filtered.length;
  const totalRevenue = filtered.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const averageHours =
    filtered.length === 0 ? 0 : filtered.reduce((sum, booking) => sum + booking.duration, 0) / filtered.length;
  const hourBuckets = filtered.reduce<Record<string, number>>((acc, booking) => {
    const date = new Date(booking.startTime);
    if (Number.isNaN(date.getTime())) return acc;
    const key = `${String(date.getHours()).padStart(2, "0")}:00`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const peakHour =
    Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const downloadPdf = async () => {
    if (filtered.length === 0) return;
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const generatedAt = new Date();
    const areaName = selectedArea?.name || "All Areas";

    doc.setFontSize(16);
    doc.text("EasyPark Counter Report", 40, 40);
    doc.setFontSize(10);
    doc.text(`Area: ${areaName}`, 40, 60);
    doc.text(`Period: ${period.toUpperCase()}`, 40, 75);
    doc.text(`Generated: ${generatedAt.toLocaleString()}`, 40, 90);
    doc.text(`Total Vehicles: ${totalVehicles}`, 420, 60);
    doc.text(`Total Revenue: ${formatMoney(totalRevenue)}`, 420, 75);
    doc.text(`Avg Stay: ${averageHours.toFixed(1)}h | Peak Hour: ${peakHour}`, 420, 90);

    autoTable(doc, {
      startY: 110,
      head: [[
        "Booking",
        "Customer",
        "Vehicle",
        "Slots",
        "Status",
        "Start",
        "End",
        "Total",
        "Paid",
        "Balance",
        "Pay Status",
      ]],
      body: filtered.map((booking) => [
        booking.bookingNumber,
        booking.customerName,
        booking.vehicleNumber,
        booking.allSlots.map((slot) => slot.number).join(", "),
        booking.status,
        new Date(booking.startTime).toLocaleString(),
        new Date(booking.endTime).toLocaleString(),
        booking.totalAmount.toFixed(2),
        booking.paidAmount.toFixed(2),
        booking.balanceDue.toFixed(2),
        booking.paymentStatus,
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [15, 23, 42],
      },
      margin: { left: 24, right: 24, top: 20, bottom: 24 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber}`,
          doc.internal.pageSize.getWidth() - 60,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });

    const areaPart = areaName.replace(/\s+/g, "_");
    doc.save(`counter_report_${period}_${areaPart}_${generatedAt.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Select Report Period:</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setPeriod("daily")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  period === "daily"
                    ? "bg-lime-400 text-slate-900"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setPeriod("weekly")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  period === "weekly"
                    ? "bg-lime-400 text-slate-900"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setPeriod("monthly")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  period === "monthly"
                    ? "bg-lime-400 text-slate-900"
                    : "border border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                Monthly
              </button>
            </div>
            {selectedArea ? (
              <p className="mt-3 text-xs text-slate-500">
                Area: {selectedArea.name}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="Total Vehicles" value={String(totalVehicles)} icon={Car} accentClass="text-lime-300" subText="" />
        <StatCard label="Total Revenue" value={formatMoney(totalRevenue)} icon={DollarSign} accentClass="text-emerald-300" subText="" />
        <StatCard
          label="Avg Stay Time"
          value={`${averageHours.toFixed(1)}h`}
          icon={Clock}
          accentClass="text-amber-300"
          subText=""
        />
        <StatCard label="Peak Hours" value={peakHour} icon={Timer} accentClass="text-slate-300" subText="" />
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <h3 className="text-sm font-semibold text-white">Detailed Vehicle Records</h3>
        {loading ? (
          <div className="mt-6 flex items-center justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-white/5 bg-[#0B1220]/80 px-4 py-10 text-center text-sm text-slate-400">
            <p>No vehicles found for this period</p>
            <p className="mt-1 text-xs text-slate-500">Bookings will appear here automatically.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="px-3 py-2">Booking</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Vehicle</th>
                  <th className="px-3 py-2">Slot</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((booking) => (
                  <tr key={booking.bookingId} className="border-b border-white/5 text-slate-300">
                    <td className="px-3 py-2">{booking.bookingNumber}</td>
                    <td className="px-3 py-2">{booking.customerName}</td>
                    <td className="px-3 py-2">{booking.vehicleNumber}</td>
                    <td className="px-3 py-2">{booking.slotNumber}</td>
                    <td className="px-3 py-2">
                      {new Date(booking.startTime).toLocaleString([], {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2 text-lime-300">{formatMoney(booking.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
