"use client";

import React, { useState, useCallback } from 'react';
import { WasherBooking, BookingStatus } from '@/lib/washer-types';
import { washerApi } from '@/app/services/washer-api';
import { CheckCircle, Clock, AlertCircle, ChevronDown, Trash2, FileText } from 'lucide-react';

interface WasherBookingsTableProps {
  bookings: WasherBooking[];
  onBookingUpdated: (bookingId: string, newStatus: BookingStatus) => void;
  onViewDetails: (booking: WasherBooking) => void;
  isLoading?: boolean;
}

export const WasherBookingsTable: React.FC<WasherBookingsTableProps> = ({
  bookings,
  onBookingUpdated,
  onViewDetails,
  isLoading = false,
}) => {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleRowExpand = useCallback((bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  }, [expandedBooking]);

  const handleCheckboxChange = useCallback((bookingId: string) => {
    setSelectedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBookings.size === bookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(bookings.map(b => b.id)));
    }
  }, [bookings, selectedBookings.size]);

  const handleAction = async (bookingId: string, action: 'accept' | 'complete' | 'cancel', reason?: string) => {
    try {
      setActionInProgress(bookingId);
      
      let updatedBooking;
      if (action === 'accept') {
        updatedBooking = await washerApi.acceptBooking(bookingId);
      } else if (action === 'complete') {
        updatedBooking = await washerApi.completeBooking(bookingId, reason);
      } else if (action === 'cancel') {
        updatedBooking = await washerApi.cancelBooking(bookingId, reason);
      }

      if (updatedBooking) {
        onBookingUpdated(bookingId, updatedBooking.status as BookingStatus);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBulkAction = async (action: 'accept' | 'confirm') => {
    if (selectedBookings.size === 0) return;
    
    try {
      setActionInProgress('bulk');
      await washerApi.bulkUpdateBookings(Array.from(selectedBookings), action);
      
      // Update all selected bookings locally
      selectedBookings.forEach(bookingId => {
        const newStatus = action === 'accept' ? 'ACCEPTED' : 'COMPLETED';
        onBookingUpdated(bookingId, newStatus as BookingStatus);
      });
      
      setSelectedBookings(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk updating bookings:', error);
      alert('Failed to update bookings. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300', icon: AlertCircle },
      ACCEPTED: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', icon: Clock },
      COMPLETED: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300', icon: CheckCircle },
      CANCELLED: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', icon: Trash2 },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${config.bg} border ${config.border} ${config.text} text-sm font-medium`}>
        <IconComponent size={14} />
        {status}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading bookings...</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText size={48} className="text-white/30 mb-4" />
        <div className="text-white/60 text-lg">No bookings available</div>
        <div className="text-white/40 text-sm">Check back later for new wash requests</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedBookings.size > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="text-white font-medium">
            {selectedBookings.size} booking{selectedBookings.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('accept')}
              disabled={actionInProgress === 'bulk'}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {actionInProgress === 'bulk' ? 'Processing...' : 'Accept All'}
            </button>
            <button
              onClick={() => handleBulkAction('confirm')}
              disabled={actionInProgress === 'bulk'}
              className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {actionInProgress === 'bulk' ? 'Processing...' : 'Complete All'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedBookings.size === bookings.length && bookings.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-white/30 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-white font-semibold">Slot Time</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Customer Name</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Vehicle</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
              <th className="px-6 py-4 text-right text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {bookings.map((booking) => (
              <React.Fragment key={booking.id}>
                <tr className="hover:bg-white/5 transition group">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBookings.has(booking.id)}
                      onChange={() => handleCheckboxChange(booking.id)}
                      className="rounded border-white/30 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-lime-400" />
                      <div>
                        <div>{booking.slotTime}</div>
                        <div className="text-sm text-white/60">{booking.slotDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    <div>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-white/60">{booking.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">
                    <div>
                      <div className="font-medium">{booking.vehicleNumber}</div>
                      <div className="text-sm text-white/60">{booking.vehicleType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleAction(booking.id, 'accept')}
                          disabled={actionInProgress === booking.id}
                          className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                        >
                          {actionInProgress === booking.id ? 'Processing...' : 'Accept'}
                        </button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                        <button
                          onClick={() => handleAction(booking.id, 'complete')}
                          disabled={actionInProgress === booking.id}
                          className="px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                        >
                          {actionInProgress === booking.id ? 'Processing...' : 'Complete'}
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetails(booking)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleRowExpand(booking.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${expandedBooking === booking.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedBooking === booking.id && (
                  <tr className="bg-white/5 border-t-2 border-white/10">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-white font-semibold mb-3">Service Details</h4>
                          <div className="space-y-2 text-sm text-white/70">
                            <p><span className="text-white/50">Service Type:</span> {booking.serviceType}</p>
                            <p><span className="text-white/50">Duration:</span> {booking.duration} minutes</p>
                            <p><span className="text-white/50">Location:</span> {booking.location}</p>
                            {booking.notes && <p><span className="text-white/50">Notes:</span> {booking.notes}</p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-3">Customer Info</h4>
                          <div className="space-y-2 text-sm text-white/70">
                            <p><span className="text-white/50">Name:</span> {booking.customerName}</p>
                            <p><span className="text-white/50">Email:</span> {booking.customerEmail}</p>
                            <p><span className="text-white/50">Phone:</span> {booking.customerPhone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {booking.status === 'PENDING' && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(booking.id, 'cancel', 'Washer cancelled')}
                              disabled={actionInProgress === booking.id}
                              className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                            >
                              {actionInProgress === booking.id ? 'Processing...' : 'Request Reschedule'}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-sm text-white/60">
        Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
