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

  const timeSlots = [
    '08:00 AM',
    '10:00 AM',
    '12:00 PM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
    '08:00 PM',
  ];
  const durationOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  // Generate all slots in a grid layout - only on client side to avoid hydration mismatch
  const allSlots = useMemo(() => {
    if (!mounted) return [];
    
    const slots: Slot[] = [];
    
    // Use a seeded random function for consistent availability
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    // Normal slots - rows A to J, columns 1-9
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach((row) => {
      for (let col = 1; col <= 9; col++) {
        // Skip some slots to create aisles (like in the image)
        if ((row === 'C' && col === 9) || (row === 'D' && col >= 8) || (row === 'F' && col === 1)) {
          continue;
        }
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

    // EV slots - rows K, L
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

    // Car wash slots - near washing area
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

  useEffect(() => {
    setMounted(true);
  }, []);
  const normalSlots = allSlots.filter((s) => s.type === 'normal');
  const evSlots = allSlots.filter((s) => s.type === 'ev');
  const carWashSlots = allSlots.filter((s) => s.type === 'car-wash');

  // Group normal slots by row
  const slotsByRow: { [key: string]: Slot[] } = {};
  normalSlots.forEach((slot) => {
    if (!slotsByRow[slot.row]) {
      slotsByRow[slot.row] = [];
    }
    slotsByRow[slot.row].push(slot);
  });

  const handleSlotClick = (slotId: string) => {
    const slot = allSlots.find((s) => s.id === slotId);
    if (!slot || !slot.available) return;

    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };
  

  const handleBookNow = () => {
    if (!selectedDate || !selectedLocation || !selectedTime || !selectedDuration || selectedSlots.length === 0) {
      alert('Please select date, location, time, duration and at least one slot');
      return;
    }
    // Store booking data in localStorage
    const bookingData = {
      date: selectedDate,
      location: selectedLocation,
      time: selectedTime,
      duration: Number(selectedDuration), 
      slots: selectedSlots.map((id) => {
        const slot = allSlots.find((s) => s.id === id);
        return {
          id: slot?.id,
          number: slot?.number,
          type: slot?.type,
        };
      }),
      slotType: 'mixed', // Can have multiple types
      bookingId: `BK-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Get existing bookings
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    // Navigate to history page to see the booking
    router.push('/customer/my-bookings');
  };

  const isFormValid = selectedDate && selectedLocation && selectedTime && selectedSlots.length > 0;

  const renderSlot = (slot: Slot) => {
    const isSelected = selectedSlots.includes(slot.id);
    const isAvailable = slot.available;

    return (
      <button
        key={slot.id}
        onClick={() => handleSlotClick(slot.id)}
        disabled={!isAvailable}
        className={`
          w-10 h-10 rounded font-medium text-xs transition-all duration-200
          ${
            !isAvailable
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50 border border-slate-700'
              : isSelected
              ? 'bg-blue-500 text-white shadow-lg scale-110 border-2 border-blue-400'
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
          <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#0A0F1C] rounded-xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-transparent">
          Book Your Parking Slot
        </h1>

 {/* Selection Controls */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

{/* Date */}
<div>
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
    Select Date
  </label>
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    min={new Date().toISOString().split('T')[0]}
    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 
               border border-slate-300 dark:border-slate-600 
               text-slate-900 dark:text-slate-100 
               focus:outline-none focus:ring-2 focus:ring-lime-500 
               transition-colors duration-300"
  />
</div>

{/* Location */}
<div>
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
    Select Location
  </label>
  <select
    value={selectedLocation}
    onChange={(e) => setSelectedLocation(e.target.value)}
    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 
               border border-slate-300 dark:border-slate-600 
               text-slate-900 dark:text-slate-100 
               focus:outline-none focus:ring-2 focus:ring-lime-500 
               transition-colors duration-300"
  >
    <option value="">Choose location...</option>
    {locations.map((location) => (
      <option key={location} value={location}>
        {location}
      </option>
    ))}
  </select>
</div>

{/* Time */}
<div>
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
    Select Time
  </label>
  <select
    value={selectedTime}
    onChange={(e) => setSelectedTime(e.target.value)}
    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 
               border border-slate-300 dark:border-slate-600 
               text-slate-900 dark:text-slate-100 
               focus:outline-none focus:ring-2 focus:ring-lime-500 
               transition-colors duration-300"
  >
    <option value="">Choose time...</option>
    {timeSlots.map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ))}
  </select>
</div>

{/* Duration (Now matching size & style) */}
<div>
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
    Select Duration (Hours)
  </label>
  <select
    value={selectedDuration}
    onChange={(e) => setSelectedDuration(e.target.value)}
    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 
               border border-slate-300 dark:border-slate-600 
               text-slate-900 dark:text-slate-100 
               focus:outline-none focus:ring-2 focus:ring-lime-500 
               transition-colors duration-300"
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



        {/* Main Parking Layout */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-xl p-6 md:p-8 shadow-2xl border border-slate-700">
            {/* Screen Side Indicator */}
            <div className="text-center text-white text-sm mb-6 font-semibold tracking-wider">
              SCREEN SIDE
            </div>

            {/* Car Wash Area */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Washing Area</h3>
                <span className="text-xs text-slate-400">Car Wash Slots</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
                <div className="flex flex-wrap gap-2 justify-center">
                  {carWashSlots.map((slot) => renderSlot(slot))}
                </div>
              </div>
            </div>

            {/* Normal Parking Slots */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Normal Parking Slots</h3>
              <div className="space-y-2">
                {Object.keys(slotsByRow)
                  .sort()
                  .map((row) => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium w-6">{row}</span>
                      <div className="flex gap-2 flex-wrap">
                        {slotsByRow[row]
                          .sort((a, b) => a.col - b.col)
                          .map((slot) => (
                            <div key={slot.id}>{renderSlot(slot)}</div>
                          ))}
                        {/* Add gap for aisle after column 8 in rows C and D */}
                        {(row === 'C' || row === 'D') && (
                          <div className="w-4"></div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* EV Charging Slots */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">EV Charging Area</h3>
                <span className="text-xs text-slate-400">⚡ Charging Point</span>
              </div>
              <div className="space-y-2">
                {['K', 'L'].map((row) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium w-6">{row}</span>
                    <div className="flex gap-2">
                      {evSlots
                        .filter((s) => s.row === row)
                        .sort((a, b) => a.col - b.col)
                        .map((slot) => (
                          <div key={slot.id}>{renderSlot(slot)}</div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-700 border border-slate-600"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-800 opacity-50"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Book Now Button */}
        <div className="flex justify-center">
          <button
            onClick={handleBookNow}
            disabled={!isFormValid}
            className={`
              px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300
              ${
                isFormValid
                  ? 'bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 hover:shadow-xl hover:scale-105'
                  : 'bg-slate-400 text-slate-600 cursor-not-allowed'
              }
            `}
          >
            Book Now →
          </button>
        </div>
      </div>
    </div>
  );
}
