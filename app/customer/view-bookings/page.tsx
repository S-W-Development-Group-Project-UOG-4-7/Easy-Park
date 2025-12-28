'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Slot {
  id: string;
  number: string;
  type: 'ev' | 'car-wash' | 'normal';
  available: boolean;
  row: string;
  col: number;
}

export default function ViewBookingsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const locations = [
    'Maharagama',
    'Nugegoda',
    'Colombo',
    'Negombo',
    'Gampaha',
    'Kalutara',
    'Ratnapura',
    'Kandy',
    'Matale',
    'Anuradhapura',
  ];

  const timeSlots = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];
  const durationOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const allSlots = useMemo(() => {
    if (!mounted) return [];
    const slots: Slot[] = [];

    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Normal slots
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach((row) => {
      for (let col = 1; col <= 9; col++) {
        if ((row === 'C' && col === 9) || (row === 'D' && col >= 8) || (row === 'F' && col === 1)) continue;

        slots.push({
          id: `normal-${row}${col}`,
          number: `${row}${col}`,
          type: 'normal',
          available: seededRandom() > 0.25,
          row,
          col,
        });
      }
    });

    // EV slots
    ['K', 'L'].forEach((row) => {
      for (let col = 1; col <= 6; col++) {
        slots.push({
          id: `ev-${row}${col}`,
          number: `EV${row}${col}`,
          type: 'ev',
          available: seededRandom() > 0.2,
          row,
          col,
        });
      }
    });

    // Car wash slots
    for (let i = 1; i <= 8; i++) {
      slots.push({
        id: `car-wash-${i}`,
        number: `CW${i}`,
        type: 'car-wash',
        available: seededRandom() > 0.3,
        row: 'W',
        col: i,
      });
    }

    return slots;
  }, [mounted]);

  useEffect(() => setMounted(true), []);

  const normalSlots = allSlots.filter((s) => s.type === 'normal');
  const evSlots = allSlots.filter((s) => s.type === 'ev');
  const carWashSlots = allSlots.filter((s) => s.type === 'car-wash');

  const slotsByRow: { [key: string]: Slot[] } = {};
  normalSlots.forEach((slot) => {
    if (!slotsByRow[slot.row]) slotsByRow[slot.row] = [];
    slotsByRow[slot.row].push(slot);
  });

  const canPickSlots =
    Boolean(selectedDate) && Boolean(selectedLocation) && Boolean(selectedTime) && Boolean(selectedDuration);

  const selectedSlotObjects = selectedSlots
    .map((id) => allSlots.find((s) => s.id === id))
    .filter(Boolean) as Slot[];

  const handleSlotClick = (slotId: string) => {
    if (!canPickSlots) return;

    const slot = allSlots.find((s) => s.id === slotId);
    if (!slot || !slot.available) return;

    setSelectedSlots((prev) => (prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]));
  };

  const handleBookNow = () => {
    const missing: string[] = [];
    if (!selectedDate) missing.push('date');
    if (!selectedLocation) missing.push('location');
    if (!selectedTime) missing.push('time');
    if (!selectedDuration) missing.push('duration');
    if (selectedSlots.length === 0) missing.push('at least one slot');

    if (missing.length) {
      alert(`Please select ${missing.join(', ')}.`);
      return;
    }

    const bookingData = {
      date: selectedDate,
      location: selectedLocation,
      time: selectedTime,
      duration: Number(selectedDuration),
      slots: selectedSlots.map((id) => {
        const slot = allSlots.find((s) => s.id === id);
        return { id: slot?.id, number: slot?.number, type: slot?.type };
      }),
      slotType: 'mixed',
      bookingId: `BK-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    router.push('/customer/my-bookings');
  };

  const isFormValid = canPickSlots && selectedSlots.length > 0;

  const renderSlot = (slot: Slot) => {
    const isSelected = selectedSlots.includes(slot.id);
    const disabled = !slot.available || !canPickSlots;

    return (
      <button
        key={slot.id}
        onClick={() => handleSlotClick(slot.id)}
        disabled={disabled}
        title={
          !canPickSlots
            ? 'Select date, location, time and duration first'
            : !slot.available
            ? 'Unavailable'
            : isSelected
            ? 'Selected'
            : 'Available'
        }
        className={`
          h-10 w-10 rounded-md text-[11px] font-semibold transition-all duration-200
          ${
            !canPickSlots
              ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-700'
              : !slot.available
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-60 border border-slate-700'
              : isSelected
              ? 'bg-blue-500 text-white shadow-md scale-105 border border-blue-300'
              : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
          }
        `}
      >
        {slot.number}
      </button>
    );
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-center min-h-[320px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading slots...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-4 sm:p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
        {/* Header + Summary (stack nicely on mobile) */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-transparent">
              Book Parking
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Pick details → choose slots → confirm booking
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/40 px-3 sm:px-4 py-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">Current selection</div>

            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">
              {selectedLocation || '—'} • {selectedDate || '—'} • {selectedTime || '—'} •{' '}
              {selectedDuration ? `${selectedDuration}h` : '—'}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Slots: <span className="font-semibold">{selectedSlots.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
            >
              <option value="">Choose location...</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
            >
              <option value="">Choose time...</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
            >
              <option value="">Choose duration...</option>
              {durationOptions.map((h) => (
                <option key={h} value={h}>
                  {h} hour{h > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Chips */}
        <div className="mb-4 sm:mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected:</span>

            {selectedSlotObjects.length === 0 ? (
              <span className="text-sm text-slate-500 dark:text-slate-400">None</span>
            ) : (
              selectedSlotObjects.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot.id)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition"
                  title="Click to remove"
                >
                  {slot.number} ✕
                </button>
              ))
            )}
          </div>

          {!canPickSlots && (
            <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Fill booking details to enable slot selection.
            </div>
          )}
        </div>

        {/* Parking Map */}
        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800/70 border border-slate-700">
                Entrance
              </span>
              <span className="text-xs text-slate-400">→ Drive lane</span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {/* Mobile: stack areas. Desktop: side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
              {/* LEFT: Normal Parking */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 overflow-x-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Parking Area</h3>
                  <span className="text-xs text-slate-400">Normal slots</span>
                </div>

                {/* ✅ Mobile friendly: allow horizontal scroll instead of squashing buttons */}
                <div className="space-y-2 min-w-[520px]">
                  {Object.keys(slotsByRow)
                    .sort()
                    .map((row) => (
                      <div key={row} className="flex items-start gap-3">
                        <span className="text-xs font-semibold text-slate-300 w-5 pt-2">{row}</span>

                        <div className="grid grid-cols-9 gap-2">
                          {slotsByRow[row]
                            .sort((a, b) => a.col - b.col)
                            .map((slot) => (
                              <div key={slot.id}>{renderSlot(slot)}</div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* RIGHT: Side Area */}
              <div className="space-y-4">
                {/* Car Wash */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Car Wash</h3>
                    <span className="text-xs text-slate-400">CW slots</span>
                  </div>

                  {/* ✅ Mobile: 2 columns, Desktop: 4 columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-items-center">
                    {carWashSlots.map((slot) => renderSlot(slot))}
                  </div>

                  {/* Washing Area + 3 big slots */}
                  <div className="mt-4 rounded-2xl border border-lime-400/20 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-950/60 p-4 sm:p-6">
                    <div className="flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-slate-950/30 px-3 py-1">
                        <span className="text-xs font-semibold tracking-[0.22em] text-slate-400">WASHING AREA</span>
                      </div>
                    </div>

                    {/* ✅ Mobile: stack, Desktop: 3 cols */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="h-16 rounded-xl border border-slate-800 bg-slate-950/35" />
                      <div className="h-16 rounded-xl border border-slate-800 bg-slate-950/25" />
                      <div className="h-16 rounded-xl border border-slate-800 bg-slate-950/35" />
                    </div>
                  </div>
                </div>

                {/* EV Charging */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">EV Charging</h3>
                    <span className="text-xs text-slate-400">⚡ EV slots</span>
                  </div>

                  <div className="space-y-3">
                    {['K', 'L'].map((row) => (
                      <div key={row} className="grid grid-cols-[20px_1fr] items-center gap-3">
                        <span className="text-xs font-semibold text-slate-300">{row}</span>

                        {/* ✅ Mobile: 3 cols, Desktop: 6 cols */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 justify-items-center">
                          {evSlots
                            .filter((s) => s.row === row)
                            .sort((a, b) => a.col - b.col)
                            .map((slot) => renderSlot(slot))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!canPickSlots && (
              <div className="mt-4 text-sm text-amber-500 text-center">
                Select date, location, time and duration to start choosing slots.
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex flex-col items-center gap-2 mt-5">
          <button
            onClick={handleBookNow}
            disabled={!isFormValid}
            className={`
              w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300
              ${
                isFormValid
                  ? 'bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-slate-400 text-slate-600 cursor-not-allowed'
              }
            `}
          >
            {isFormValid ? `Confirm Booking (${selectedSlots.length}) →` : 'Book Now →'}
          </button>

          {isFormValid && (
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Slots: <span className="font-semibold">{selectedSlotObjects.map((s) => s.number).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
