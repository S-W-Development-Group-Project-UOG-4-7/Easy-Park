'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'amount'>('recent');

  // Load bookings from localStorage on mount
  useEffect(() => {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      const parsed = JSON.parse(storedBookings);
      setBookings(parsed);
    }
  }, []);

  // Filter and search bookings
  useEffect(() => {
    let filtered = bookings;

    // Search by driver name or vehicle number
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.parkingSpot.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter((booking) => !booking.actualExitTime);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter((booking) => booking.actualExitTime);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'oldest') {
      filtered.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === 'amount') {
      filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const getStatusBadge = (booking: BookingData) => {
    if (booking.actualExitTime) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
          Completed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]/30">
        Active
      </span>
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (entryTime: string, exitTime?: string) => {
    const end = exitTime ? new Date(exitTime) : new Date();
    const start = new Date(entryTime);
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    return `${diff}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-[#E5E7EB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">
            Bookings
          </h1>
          <p className="text-[#94A3B8]">View and manage all parking bookings</p>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Driver, vehicle, or spot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-700/50 rounded px-3 py-2 text-[#E5E7EB] placeholder-[#64748B] focus:outline-none focus:border-[#84CC16]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | 'active' | 'completed')
                }
                className="w-full bg-[#0F172A] border border-slate-700/50 rounded px-3 py-2 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'amount')}
                className="w-full bg-[#0F172A] border border-slate-700/50 rounded px-3 py-2 text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Total Bookings
              </label>
              <div className="text-3xl font-bold text-[#84CC16]">{filteredBookings.length}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-lg overflow-hidden">
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-[#0F172A]/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                      Vehicle
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                      Spot
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                      Entry Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="border-b border-slate-700/50 hover:bg-[#0F172A]/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-[#E5E7EB] font-medium">
                        {booking.driverName}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#E5E7EB]">
                        <span className="px-2 py-1 bg-[#1E293B] rounded text-[#84CC16]">
                          {booking.vehicleNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#E5E7EB] font-semibold">
                        {booking.parkingSpot}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94A3B8]">
                        {formatTime(booking.entryTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#E5E7EB] font-semibold">
                        {calculateDuration(
                          booking.entryTime,
                          booking.actualExitTime
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#10B981] font-semibold">
                        ${booking.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(booking)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-[#94A3B8] mb-2">No bookings found</p>
              <p className="text-sm text-[#64748B]">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-[#0F172A] font-semibold rounded-lg hover:shadow-lg hover:shadow-lime-500/50 transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
