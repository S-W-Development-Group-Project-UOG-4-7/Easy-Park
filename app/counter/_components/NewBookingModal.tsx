"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { CounterParkingArea } from "./types";

type AvailabilitySlot = {
  id: string;
  number: string;
  type: "NORMAL" | "EV" | "CAR_WASH";
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
};

type TimeOption = {
  time: string;
  label: string;
  isPeak: boolean;
  isEnabled: boolean;
};

type AvailabilitySlotRow = {
  id?: unknown;
  number?: unknown;
  type?: unknown;
  status?: unknown;
};

type TimeOptionRow = {
  time?: unknown;
  label?: unknown;
  isPeak?: unknown;
  isEnabled?: unknown;
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NewBookingModal({
  isOpen,
  onClose,
  parkingAreas,
  defaultPropertyId,
  preselectedSlotIds,
  prefilledStartTime,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  parkingAreas: CounterParkingArea[];
  defaultPropertyId: string;
  preselectedSlotIds: string[];
  prefilledStartTime: string;
  onCreated: () => Promise<void>;
}) {
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [propertyId, setPropertyId] = useState(defaultPropertyId);
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [advanceAmount, setAdvanceAmount] = useState("0");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [note, setNote] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNic, setCustomerNic] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const selectedArea = useMemo(
    () => parkingAreas.find((area) => area.id === propertyId) || null,
    [parkingAreas, propertyId]
  );
  const selectedSlotDetails = useMemo(
    () => availableSlots.filter((slot) => selectedSlots.includes(slot.id)),
    [availableSlots, selectedSlots]
  );
  const durationHours = Math.max(1, Number(duration) || 1);
  const estimatedTotal = useMemo(() => {
    if (!selectedArea) return 0;
    if (durationHours >= 24 && selectedArea.pricePerDay > 0) {
      return selectedArea.pricePerDay * selectedSlots.length;
    }
    return selectedArea.pricePerHour * durationHours * selectedSlots.length;
  }, [durationHours, selectedArea, selectedSlots.length]);

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

  useEffect(() => {
    if (!isOpen) return;
    setPropertyId(defaultPropertyId || parkingAreas[0]?.id || "");
    setDate(today);
    setDuration("1");
    setStartTime(prefilledStartTime || "");
    setSelectedSlots(preselectedSlotIds);
    setError(null);
    setSubmitting(false);
    setAvailabilityLoading(false);
    setPaymentMethod("CASH");
    setAdvanceAmount("0");
    setAutoAdvance(true);
    setNote("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerNic("");
    setCustomerAddress("");
    setVehicleNumber("");
    setVehicleType("");
  }, [defaultPropertyId, isOpen, parkingAreas, prefilledStartTime, preselectedSlotIds, today]);

  useEffect(() => {
    if (!isOpen || !propertyId || !date) {
      setAvailableSlots([]);
      setTimeOptions([]);
      return;
    }

    let cancelled = false;
    async function fetchAvailability() {
      setAvailabilityLoading(true);
      try {
        const query = new URLSearchParams({
          propertyId,
          date,
          duration: duration || "1",
        });
        if (startTime) query.set("startTime", startTime);

        const response = await fetch(`/api/customer/availability?${query.toString()}`, {
          cache: "no-store",
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.success || !payload?.data) {
          throw new Error(payload?.error || payload?.message || "Failed to fetch slot availability");
        }

        const slotsRaw = (Array.isArray(payload.data.slots) ? payload.data.slots : []) as AvailabilitySlotRow[];
        const optionsRaw = (Array.isArray(payload.data.timeOptions) ? payload.data.timeOptions : []) as TimeOptionRow[];
        const normalizedSlots: AvailabilitySlot[] = slotsRaw.map((slot) => ({
          id: String(slot?.id || ""),
          number: String(slot?.number || ""),
          type: String(slot?.type || "NORMAL").toUpperCase() as AvailabilitySlot["type"],
          status: String(slot?.status || "AVAILABLE").toUpperCase() as AvailabilitySlot["status"],
        }));
        const normalizedOptions: TimeOption[] = optionsRaw.map((option) => ({
          time: String(option?.time || ""),
          label: String(option?.label || option?.time || ""),
          isPeak: Boolean(option?.isPeak),
          isEnabled: Boolean(option?.isEnabled),
        }));

        if (!cancelled) {
          setAvailableSlots(normalizedSlots.filter((slot) => slot.status === "AVAILABLE"));
          setTimeOptions(normalizedOptions);
          setSelectedSlots((prev) =>
            prev.filter((slotId) =>
              normalizedSlots.some((slot) => slot.id === slotId && slot.status === "AVAILABLE")
            )
          );
          if (startTime && normalizedOptions.some((option) => option.time === startTime && !option.isEnabled)) {
            setStartTime("");
          }
          if (!startTime) {
            const firstEnabled = normalizedOptions.find((option) => option.isEnabled)?.time || "";
            if (firstEnabled) setStartTime(firstEnabled);
          }
          setError(null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setAvailableSlots([]);
          setTimeOptions([]);
          setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch availability");
        }
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    }
    fetchAvailability();
    return () => {
      cancelled = true;
    };
  }, [date, duration, isOpen, propertyId, startTime]);

  useEffect(() => {
    if (!autoAdvance) return;
    const suggested = selectedSlots.length * 150;
    setAdvanceAmount(String(suggested));
  }, [autoAdvance, selectedSlots.length]);

  if (!isOpen) return null;

  const toggleSlot = (slotId: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotId)) return prev.filter((id) => id !== slotId);
      return [...prev, slotId];
    });
    setAutoAdvance(true);
  };

  const handleSubmit = async () => {
    if (!propertyId) {
      setError("Please select a parking area.");
      return;
    }
    if (!date || !startTime) {
      setError("Please select date and start time.");
      return;
    }
    if (selectedSlots.length === 0) {
      setError("Please select at least one available slot.");
      return;
    }
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!vehicleNumber.trim()) {
      setError("Vehicle number is required.");
      return;
    }

    const parsedAdvance = Number(advanceAmount || 0);
    if (!Number.isFinite(parsedAdvance) || parsedAdvance < 0) {
      setError("Advance amount must be a valid non-negative value.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/counter/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          propertyId,
          date,
          startTime,
          duration: durationHours,
          slotIds: selectedSlots,
          paymentMethod,
          advanceAmount: parsedAdvance,
          note: note.trim() || null,
          customer: {
            fullName: customerName.trim(),
            email: customerEmail.trim() || null,
            phone: customerPhone.trim() || null,
            nic: customerNic.trim() || null,
            address: customerAddress.trim() || null,
            vehicleNumber: vehicleNumber.trim(),
            vehicleType: vehicleType.trim() || null,
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || payload?.message || "Failed to create booking");
      }
      await onCreated();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="mt-2 text-xs text-slate-400">
          Bookings created here are saved in the same database tables used by customer, owner, and admin dashboards.
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-2 max-h-[62vh] overflow-y-auto pr-1">
          <div className="space-y-4">
            <Select
              label="Parking Area *"
              value={propertyId}
              onChange={(value) => setPropertyId(value)}
              options={parkingAreas.map((area) => ({
                value: area.id,
                label: `${area.name} - ${area.address}`,
              }))}
            />
            <Input label="Driver Name *" placeholder="Enter driver name" value={customerName} onChange={setCustomerName} />
            <Input label="Phone Number" placeholder="+94XXXXXXXXX" value={customerPhone} onChange={setCustomerPhone} />
            <Input label="NIC" placeholder="NIC number" value={customerNic} onChange={setCustomerNic} />
            <Input label="Email" placeholder="driver@example.com" value={customerEmail} onChange={setCustomerEmail} />
            <Input label="Address" placeholder="Residential address" value={customerAddress} onChange={setCustomerAddress} />
            <Textarea label="Notes" placeholder="Additional notes or special instructions..." value={note} onChange={setNote} />
          </div>

          <div className="space-y-4">
            <Input label="Vehicle Number *" placeholder="ABC-1234" value={vehicleNumber} onChange={setVehicleNumber} />
            <Select
              label="Vehicle Type"
              value={vehicleType}
              onChange={setVehicleType}
              options={[
                { value: "", label: "Select vehicle type" },
                { value: "Car", label: "Car" },
                { value: "Van", label: "Van" },
                { value: "Bike", label: "Bike" },
                { value: "Truck", label: "Truck" },
              ]}
            />
            <div className="grid grid-cols-2 gap-2">
              <DateInput label="Date *" value={date} onChange={setDate} />
              <TimeInput label="Time *" value={startTime} onChange={setStartTime} />
              <Select
                label="Suggested Time"
                value={startTime}
                onChange={setStartTime}
                options={timeOptions.map((option) => ({
                  value: option.time,
                  label: `${option.label}${option.isPeak ? " (Peak)" : ""}${option.isEnabled ? "" : " (Blocked)"}`,
                  disabled: !option.isEnabled,
                }))}
              />
              <Select
                label="Duration"
                value={duration}
                onChange={setDuration}
                options={[1, 2, 3, 4, 5, 6, 8, 10, 12, 24].map((hours) => ({
                  value: String(hours),
                  label: `${hours}h`,
                }))}
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0B1220]/70 p-3">
              <p className="text-xs text-slate-400">Available Parking Slots *</p>
              {availabilityLoading ? (
                <div className="mt-3 flex items-center justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No available slots for selected time.</p>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const selected = selectedSlots.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => toggleSlot(slot.id)}
                        className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                          selected
                            ? "border-lime-300 bg-lime-400 text-slate-900"
                            : "border-white/10 bg-[#0F172A] text-slate-200 hover:border-lime-400/60"
                        }`}
                      >
                        {slot.number}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-2 text-[11px] text-slate-500">
                Selected time: {startTime || "Not selected"} ({timeOptions.filter((option) => option.isEnabled).length} suggested options)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value as "CASH" | "CARD")}
                options={[
                  { value: "CASH", label: "Cash" },
                  { value: "CARD", label: "Card" },
                ]}
              />
              <Input
                label="Advance Amount"
                placeholder="0"
                value={advanceAmount}
                onChange={(value) => {
                  setAdvanceAmount(value);
                  setAutoAdvance(false);
                }}
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0B1220]/80 p-3 text-xs text-slate-300">
              <p>
                Selected Slots: <span className="text-lime-300">{selectedSlotDetails.map((slot) => slot.number).join(", ") || "None"}</span>
              </p>
              <p className="mt-1">Estimated Total: <span className="text-white">{estimatedTotal.toLocaleString()} LKR</span></p>
            </div>
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
            onClick={handleSubmit}
            disabled={submitting || availabilityLoading}
            className="rounded-lg bg-lime-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/30 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
      />
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
      />
    </label>
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        type="time"
        step={900}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-[#0B1220]/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
      />
    </label>
  );
}
