'use client';

import { useState, useEffect } from 'react';

interface BookingData {
  id: string;
  driverName: string;
  vehicleNumber: string;
  parkingSpot: string;
  entryTime: string;
  expectedExitTime: string;
  vehicleType: string;
  amount?: number;
  createdAt: string;
  actualExitTime?: string;
}

interface ParkingStatus {
  slot: string;
  status: 'occupied' | 'booked' | 'available' | 'past';
  details: BookingData | null;
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'booked' | 'past'>('all');

  // Load bookings from localStorage on mount
  useEffect(() => {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      const parsed = JSON.parse(storedBookings);
      setBookings(parsed);
      
      // Set default date range to today
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
    }
  }, []);

  // Filter bookings based on date range and status
  useEffect(() => {
    let filtered = bookings;

    if (startDate && endDate) {
      filtered = filtered.filter(booking => {
        try {
          const entryDate = new Date(booking.entryTime);
          if (isNaN(entryDate.getTime())) {
            return false;
          }
          const bookingDate = entryDate.toISOString().split('T')[0];
          return bookingDate >= startDate && bookingDate <= endDate;
        } catch (e) {
          return false;
        }
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => {
        try {
          const now = new Date();
          const entryTime = new Date(booking.entryTime);
          const exitTime = new Date(booking.expectedExitTime);
          
          if (isNaN(entryTime.getTime()) || isNaN(exitTime.getTime())) {
            return false;
          }

          if (statusFilter === 'occupied') {
            return entryTime <= now && now < exitTime && !booking.actualExitTime;
          } else if (statusFilter === 'booked') {
            return entryTime > now;
          } else if (statusFilter === 'past') {
            return booking.actualExitTime || now >= exitTime;
          }
          return true;
        } catch (e) {
          return false;
        }
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, startDate, endDate, statusFilter]);

  const getBookingStatus = (booking: BookingData) => {
    const now = new Date();
    const entryTime = new Date(booking.entryTime);
    const exitTime = new Date(booking.expectedExitTime);

    if (booking.actualExitTime) {
      return 'past';
    } else if (now < entryTime) {
      return 'booked';
    } else if (now >= entryTime && now < exitTime) {
      return 'occupied';
    } else {
      return 'past';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'booked':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'past':
        return 'bg-slate-500/20 border-slate-500/50 text-slate-300';
      default:
        return 'bg-green-500/20 border-green-500/50 text-green-300';
    }
  };

  const calculateStats = () => {
    const stats = {
      total: filteredBookings.length,
      occupied: 0,
      booked: 0,
      past: 0,
      revenue: 0,
    };

    filteredBookings.forEach(booking => {
      const status = getBookingStatus(booking);
      if (status === 'occupied') stats.occupied++;
      else if (status === 'booked') stats.booked++;
      else if (status === 'past') stats.past++;
      
      stats.revenue += booking.amount || 0;
    });

    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-[#E5E7EB]">Parking Analytics</h1>

      {/* Date Range Selector */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#E5E7EB]">📅 Select Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#94A3B8] text-sm mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
            />
          </div>
          <div>
            <label className="block text-[#94A3B8] text-sm mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
            />
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h3 className="text-[#94A3B8] text-sm mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-red-500/30 shadow-lg">
          <h3 className="text-[#94A3B8] text-sm mb-2">Currently Occupied</h3>
          <p className="text-3xl font-bold text-red-300">{stats.occupied}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30 shadow-lg">
          <h3 className="text-[#94A3B8] text-sm mb-2">Upcoming Bookings</h3>
          <p className="text-3xl font-bold text-yellow-300">{stats.booked}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
          <h3 className="text-[#94A3B8] text-sm mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-300">${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#E5E7EB]">Filter by Status</h2>
        <div className="flex flex-wrap gap-3">
          {['all', 'occupied', 'booked', 'past'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] shadow-lg shadow-lime-500/50'
                  : 'bg-slate-800 text-[#E5E7EB] border border-slate-600 hover:border-[#84CC16]'
              }`}
            >
              {status === 'all' ? '📋 All' : status === 'occupied' ? '🔴 Occupied' : status === 'booked' ? '🟡 Upcoming' : '⚪ Past'}
            </button>
          ))}
        </div>
      </div>

      {/* Parking Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Parking List */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#E5E7EB]">🅿️ Parking Details</h2>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#94A3B8]">No bookings found for selected date range</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredBookings.map((booking) => {
                  const status = getBookingStatus(booking);
                  return (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                        selectedBooking?.id === booking.id
                          ? 'border-[#84CC16] bg-slate-800/50'
                          : `${getStatusColor(status)} cursor-pointer hover:border-[#84CC16]`
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#E5E7EB]">{booking.vehicleNumber}</h3>
                          <p className="text-sm text-[#94A3B8]">{booking.driverName}</p>
                          <p className="text-sm text-[#94A3B8]">Spot: {booking.parkingSpot}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                            {status === 'occupied' ? '🔴 Occupied' : status === 'booked' ? '🟡 Upcoming' : '⚪ Past'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detailed View Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg sticky top-8">
            <h2 className="text-xl font-semibold mb-4 text-[#E5E7EB]">📍 Details</h2>
            {selectedBooking ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[#94A3B8] text-sm">Driver Name</p>
                  <p className="text-[#E5E7EB] font-semibold">{selectedBooking.driverName}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8] text-sm">Vehicle Number</p>
                  <p className="text-[#E5E7EB] font-semibold">{selectedBooking.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8] text-sm">Vehicle Type</p>
                  <p className="text-[#E5E7EB] font-semibold">{selectedBooking.vehicleType}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8] text-sm">Parking Spot</p>
                  <p className="text-[#E5E7EB] font-semibold">{selectedBooking.parkingSpot}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8] text-sm">Status</p>
                  <p className={`font-semibold ${getStatusColor(getBookingStatus(selectedBooking))}`}>
                    {getBookingStatus(selectedBooking) === 'occupied' ? '🔴 Currently Occupied' : getBookingStatus(selectedBooking) === 'booked' ? '🟡 Upcoming' : '⚪ Completed'}
                  </p>
                </div>
                <div>
                  <p className="text-[#94A3B8] text-sm">Entry Time</p>
                  <p className="text-[#E5E7EB] font-semibold">{new Date(selectedBooking.entryTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8] text-sm">Expected Exit Time</p>
                  <p className="text-[#E5E7EB] font-semibold">{new Date(selectedBooking.expectedExitTime).toLocaleString()}</p>
                </div>
                {selectedBooking.actualExitTime && (
                  <div>
                    <p className="text-[#94A3B8] text-sm">Actual Exit Time</p>
                    <p className="text-[#E5E7EB] font-semibold">{new Date(selectedBooking.actualExitTime).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#94A3B8] text-sm">Amount</p>
                  <p className="text-2xl font-bold text-green-300">${selectedBooking.amount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#94A3B8]">Select a booking to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">Occupancy Chart</h2>
        <div className="flex items-end justify-between h-64 gap-2">
          {[65, 72, 68, 85, 78, 82, 75].map((height, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-[#84CC16] to-[#BEF264] rounded-t shadow-lg shadow-lime-500/30"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs text-[#94A3B8] mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
