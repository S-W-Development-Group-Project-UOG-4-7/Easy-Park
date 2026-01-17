'use client';

import { useState, useEffect, useCallback } from 'react';
import BookingForm, { BookingData } from '../components/BookingForm';

interface ParkingSlot {
  id: string;
  row: string;
  col: number;
  type: 'normal' | 'ev' | 'carwash' | 'disabled';
  isOccupied: boolean;
  bookingId?: string;
  vehicleType?: string;
  duration?: number;
  vehicleNumber?: string;
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  // Initialize default parking slots
  const initializeDefaultSlots = useCallback(() => {
    const slots: ParkingSlot[] = [];
    
    // Normal parking slots (Rows A-J, 9 slots each)
    const normalRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    normalRows.forEach(row => {
      for (let col = 1; col <= 9; col++) {
        slots.push({
          id: `${row}${col}`,
          row,
          col,
          type: 'normal',
          isOccupied: Math.random() > 0.7
        });
      }
    });

    // EV Charging slots (Rows K-L, 6 slots each)
    const evRows = ['K', 'L'];
    evRows.forEach(row => {
      for (let col = 1; col <= 6; col++) {
        slots.push({
          id: `${row}${col}`,
          row,
          col,
          type: 'ev',
          isOccupied: Math.random() > 0.8
        });
      }
    });

    // Car Wash slots (4 slots)
    for (let i = 1; i <= 4; i++) {
      slots.push({
        id: `CW${i}`,
        row: 'CW',
        col: i,
        type: 'carwash',
        isOccupied: Math.random() > 0.6
      });
    }

    setParkingSlots(slots);
  }, []);

  // Load bookings and slots from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBookings = localStorage.getItem('parkingBookings');
      const savedSlots = localStorage.getItem('parkingSlots');
      
      if (savedBookings) {
        try {
          setBookings(JSON.parse(savedBookings));
        } catch (e) {
          console.error('Error parsing saved bookings:', e);
        }
      }
      if (savedSlots) {
        try {
          const parsed = JSON.parse(savedSlots);
          if (parsed && parsed.length > 0) {
            setParkingSlots(parsed);
          } else {
            initializeDefaultSlots();
          }
        } catch (e) {
          console.error('Error parsing saved slots:', e);
          initializeDefaultSlots();
        }
      } else {
        initializeDefaultSlots();
      }
    }
  }, [initializeDefaultSlots]);

  // Save bookings and slots to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('parkingBookings', JSON.stringify(bookings));
        localStorage.setItem('parkingSlots', JSON.stringify(parkingSlots));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [bookings, parkingSlots]);

  const handleAddBooking = (booking: BookingData) => {
    const newBookings = [...bookings, booking];
    setBookings(newBookings);
    
    // Mark the slot as occupied
    const updatedSlots = parkingSlots.map(slot => {
      if (slot.id === booking.parkingSpot) {
        return {
          ...slot,
          isOccupied: true,
          bookingId: booking.id,
          vehicleType: booking.vehicleType,
          vehicleNumber: booking.vehicleNumber
        };
      }
      return slot;
    });
    
    setParkingSlots(updatedSlots);
  };

  const handleRemoveBooking = (bookingId: string) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to remove this booking?')) {
      const bookingToRemove = bookings.find(b => b.id === bookingId);
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      setBookings(updatedBookings);
      
      if (bookingToRemove) {
        const updatedSlots = parkingSlots.map(slot => {
          if (slot.id === bookingToRemove.parkingSpot) {
            return {
              ...slot,
              isOccupied: false,
              bookingId: undefined,
              vehicleType: undefined,
              vehicleNumber: undefined
            };
          }
          return slot;
        });
        setParkingSlots(updatedSlots);
      }
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    const slotBooking = bookings.find(b => b.parkingSpot === slotId);
    
    if (slotBooking) {
      handleRemoveBooking(slotBooking.id);
    } else {
      const updatedSlots = parkingSlots.map(slot => {
        if (slot.id === slotId) {
          return {
            ...slot,
            isOccupied: !slot.isOccupied
          };
        }
        return slot;
      });
      setParkingSlots(updatedSlots);
    }
  };

  // Calculate statistics
  const totalSpots = parkingSlots.length;
  const occupiedSpots = parkingSlots.filter(slot => slot.isOccupied).length;
  const availableSpots = totalSpots - occupiedSpots;
  const revenue = bookings.reduce((sum, booking) => sum + (booking.amount || 5), 0);
  const occupancyRate = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

  // Organize slots by row
  const slotsByRow = parkingSlots
    .filter(slot => slot.type === 'normal')
    .reduce((acc, slot) => {
      if (!acc[slot.row]) acc[slot.row] = [];
      acc[slot.row].push(slot);
      return acc;
    }, {} as Record<string, ParkingSlot[]>);

  const evSlots = parkingSlots.filter(slot => slot.type === 'ev');
  const carWashSlots = parkingSlots.filter(slot => slot.type === 'carwash');

  // SIMPLE SLOT DESIGN - matching reference UI
  const renderSlot = (slot: ParkingSlot) => {
    const isAvailable = !slot.isOccupied;
    
    return (
      <div
        key={slot.id}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer text-xs font-medium hover:scale-105 active:scale-95 ${
          isAvailable 
            ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 border border-slate-600' 
            : 'bg-slate-800 text-slate-500 border border-slate-700'
        }`}
        onClick={() => {
          if (isAvailable) {
            setSelectedSlot(slot);
            setIsFormOpen(true);
          } else {
            if (window.confirm(`Remove vehicle from slot ${slot.id}?`)) {
              handleRemoveSlot(slot.id);
            }
          }
        }}
      >
        {slot.id}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Parking Dashboard</h1>
          <p className="text-slate-400">Real-time parking management system</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 text-sm border border-emerald-700/50"
          >
            <span className="text-lg">+</span>
            New Booking
          </button>
          <button
            onClick={initializeDefaultSlots}
            className="px-4 py-2.5 bg-slate-800/50 text-slate-300 rounded-lg font-semibold hover:bg-slate-700/50 transition-all border border-slate-700 text-sm"
          >
            Reset Slots
          </button>
        </div>
      </div>

      {/* Stats Cards with dark theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { title: 'Total Spots', value: totalSpots, icon: '🚗', color: 'text-slate-300', bg: 'from-slate-900/50 to-slate-800/30' },
          { title: 'Available', value: availableSpots, icon: '✅', color: 'text-emerald-300', bg: 'from-slate-900/50 to-slate-800/30' },
          { title: 'Occupied', value: occupiedSpots, icon: '🔴', color: 'text-rose-300', bg: 'from-slate-900/50 to-slate-800/30' },
          { title: 'Revenue', value: `$${revenue}`, icon: '💰', color: 'text-amber-300', bg: 'from-slate-900/50 to-slate-800/30' }
        ].map((stat, idx) => (
          <div 
            key={idx} 
            className={`bg-gradient-to-br ${stat.bg} rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">{stat.title}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-0.5`}>
              {stat.value}
            </div>
            <p className="text-slate-500 text-[10px]">Updated just now</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Parking Map */}
        <div className="lg:col-span-2">
          {/* Parking Map */}
          <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                  Entrance
                </span>
                <span className="text-xs text-slate-400">→ Drive lane</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Total: {totalSpots}</span>
                <span>•</span>
                <span className="text-emerald-400">Available: {availableSpots}</span>
                <span>•</span>
                <span className="text-rose-400">Occupied: {occupiedSpots}</span>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                {/* LEFT: Normal Parking - Simple design */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Parking Area</h3>
                    <span className="text-xs text-slate-400">Normal slots</span>
                  </div>

                  <div className="space-y-2">
                    {Object.keys(slotsByRow).length > 0 ? (
                      Object.keys(slotsByRow)
                        .sort()
                        .map((row) => (
                          <div key={row} className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 w-4">
                              {row}
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                              {slotsByRow[row]
                                .sort((a, b) => a.col - b.col)
                                .map((slot) => renderSlot(slot))}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No parking slots available. Click "Reset Slots" to initialize.
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Side Area - Better spacing */}
                <div className="space-y-6">
                  {/* Car Wash */}
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white">Car Wash</h3>
                      <span className="text-xs text-slate-400">CW slots</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {carWashSlots.length > 0 ? (
                        carWashSlots.map((slot) => renderSlot(slot))
                      ) : (
                        <div className="col-span-4 text-center py-4 text-slate-400 text-xs">
                          No car wash slots
                        </div>
                      )}
                    </div>

                    {/* Washing Area */}
                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                      <div className="text-center mb-3">
                        <span className="text-xs font-semibold tracking-widest text-slate-400">
                          WASHING AREA
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((num) => (
                          <div key={num} className="h-16 rounded-lg border border-slate-600 bg-slate-800 flex items-center justify-center">
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* EV Charging */}
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white">EV Charging</h3>
                      <span className="text-xs text-slate-400">⚡ EV slots</span>
                    </div>

                    <div className="space-y-2">
                      {['K', 'L'].map((row) => {
                        const rowSlots = evSlots
                          .filter((s) => s.row === row)
                          .sort((a, b) => a.col - b.col);
                        
                        return (
                          <div key={row} className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400 w-4">
                              {row}
                            </span>
                            <div className="flex gap-1.5">
                              {rowSlots.length > 0 ? (
                                rowSlots.map((slot) => renderSlot(slot))
                              ) : (
                                <span className="text-slate-500 text-xs">No slots</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Analytics & Bookings */}
        <div className="space-y-6">
          {/* Analytics Card */}
          <div className="bg-gradient-to-br from-slate-900/30 to-slate-950/20 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-5">Analytics</h2>
            
            <div className="space-y-5">
              {/* Occupancy Chart */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-xs">Occupancy Rate</span>
                  <span className="text-emerald-400 font-bold text-sm">{occupancyRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-full transition-all duration-1000"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Peak Hour', value: '9:00 AM', icon: '📈', color: 'text-slate-300', bg: 'from-slate-900/40 to-slate-950/30' },
                  { label: 'Avg Stay', value: '2h 15m', icon: '⏱️', color: 'text-slate-300', bg: 'from-slate-900/40 to-slate-950/30' },
                  { label: 'Turnover', value: '68/day', icon: '🔄', color: 'text-slate-300', bg: 'from-slate-900/40 to-slate-950/30' },
                  { label: 'Revenue/hr', value: '$45', icon: '💰', color: 'text-amber-300', bg: 'from-slate-900/40 to-slate-950/30' }
                ].map((stat, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-gradient-to-br ${stat.bg} rounded p-3 border border-slate-700/30`}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-sm">{stat.icon}</span>
                      <span className="text-slate-400 text-[10px]">{stat.label}</span>
                    </div>
                    <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="pt-4 border-t border-slate-700/30">
                <div className="text-xs text-slate-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400">💡</span>
                    <span className="text-slate-300">Quick Tips</span>
                  </div>
                  <div className="text-[10px] space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div>Click <span className="text-emerald-400 font-semibold">available</span> slots to book</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <div>Click <span className="text-rose-400 font-semibold">occupied</span> slots to remove</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>Hover for details</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-gradient-to-br from-slate-900/30 to-slate-950/20 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Active Bookings</h2>
              <span className="text-slate-400 text-xs bg-slate-800/30 px-2 py-1 rounded">{bookings.length} active</span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r from-slate-900/50 to-slate-950/40 flex items-center justify-center border border-slate-700/50">
                  <span className="text-lg">📋</span>
                </div>
                <p className="text-slate-400 text-sm mb-0.5">No active bookings</p>
                <p className="text-slate-500 text-xs">Click on available slots to book</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {bookings.map((booking) => {
                  const entryDate = new Date(booking.entryTime);
                  const timeAgo = Math.floor((Date.now() - entryDate.getTime()) / 60000);
                  
                  return (
                    <div key={booking.id} className="bg-gradient-to-br from-slate-900/30 to-slate-950/20 rounded p-3 border border-slate-700/30 hover:border-emerald-700/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-800/50 to-slate-900/40 flex items-center justify-center border border-slate-700/50">
                            <span className="text-xs">🚗</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">{booking.driverName}</h4>
                            <p className="text-slate-400 text-xs">{booking.vehicleNumber}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveBooking(booking.id)}
                          className="text-rose-300 hover:text-rose-200 text-xs bg-gradient-to-r from-rose-900/30 to-rose-950/20 hover:from-rose-900/40 hover:to-rose-950/30 px-3 py-1.5 rounded border border-rose-700/30 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-300 font-bold bg-emerald-900/20 px-2 py-1 rounded border border-emerald-700/30">
                            {booking.parkingSpot}
                          </span>
                          <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                            booking.vehicleType === 'SUV' ? 'bg-slate-800/50 text-slate-300 border border-slate-700' : 
                            booking.vehicleType === 'EV' ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-700/30' : 
                            'bg-slate-900/40 text-slate-300 border border-slate-700'
                          }`}>
                            {booking.vehicleType}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          {timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleAddBooking}
        selectedSlot={selectedSlot}
      />
    </div>
  );
}

