"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function NewBookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-[720px] max-w-[92vw] rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold text-lime-300">New Booking</h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Input label="Driver Name *" placeholder="Enter driver name" />
            <Input label="ID Number *" placeholder="Enter ID number" />
            <Input label="Email" placeholder="driver@example.com" />
            <Input label="Entry Time *" placeholder="dd/mm/yyyy —" />
            <Select label="Vehicle Type" options={["Car", "Van", "Bike", "Truck"]} />
            <Textarea label="Notes" placeholder="Additional notes or special instructions..." />
          </div>

          <div className="space-y-4">
            <Input label="Vehicle Number *" placeholder="ABC-1234" />
            <Input label="Phone Number *" placeholder="+1234567890" />
            <Select label="Parking Spot *" options={["A-12", "B-04", "C-08"]} />
            <Input label="Expected Exit Time *" placeholder="dd/mm/yyyy —" />
            <Select label="Payment Method" options={["Cash", "Card", "Online"]} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-lime-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/30 hover:bg-lime-300"
          >
            Create Booking
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        type="text"
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
      />
    </label>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <select className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/50">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <textarea
        placeholder={placeholder}
        rows={3}
        className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
      />
    </label>
  );
}
