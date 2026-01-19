"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WasherBooking } from '@/lib/washer-types';
import { washerApi } from '@/app/services/washer-api';
import { X, Phone, Mail, MapPin, Calendar, Clock, Car, AlertCircle } from 'lucide-react';

interface CustomerDetailsModalProps {
  booking: WasherBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && booking) {
      loadCustomerDetails();
    }
  }, [isOpen, booking]);

  const loadCustomerDetails = async () => {
    if (!booking) return;
    try {
      setLoading(true);
      setError(null);
      const details = await washerApi.getCustomerDetails(booking.customerId);
      setCustomerDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 mx-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Customer Details</h2>
          <p className="text-white/60">Booking ID: {booking.id}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white/60">Loading customer details...</div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-3 text-red-300">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Customer Information */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Full Name</div>
                  <div className="text-white font-medium">{booking.customerName}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <Mail size={14} />
                    Email
                  </div>
                  <div className="text-white font-medium">{booking.customerEmail || 'N/A'}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <Phone size={14} />
                    Phone
                  </div>
                  <div className="text-white font-medium">{booking.customerPhone || 'N/A'}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <MapPin size={14} />
                    Location
                  </div>
                  <div className="text-white font-medium">{booking.location}</div>
                </div>
              </div>
            </section>

            {/* Vehicle Information */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Car size={20} />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Vehicle Number</div>
                  <div className="text-white font-mono text-lg font-bold">{booking.vehicleNumber}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Vehicle Type</div>
                  <div className="text-white font-medium">{booking.vehicleType}</div>
                </div>
              </div>
            </section>

            {/* Booking Details */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Booking Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <Calendar size={14} />
                    Date
                  </div>
                  <div className="text-white font-medium">{booking.slotDate}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <Clock size={14} />
                    Time
                  </div>
                  <div className="text-white font-medium">{booking.slotTime}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Service Type</div>
                  <div className="text-white font-medium">{booking.serviceType}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">Duration</div>
                  <div className="text-white font-medium">{booking.duration} minutes</div>
                </div>
              </div>

              {booking.notes && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mt-4">
                  <div className="text-sm text-blue-300 font-medium mb-2">Additional Notes</div>
                  <div className="text-white">{booking.notes}</div>
                </div>
              )}
            </section>

            {/* Status */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500/10 border border-lime-500/30 text-lime-300 font-medium">
                {booking.status}
              </div>
            </section>

            {/* Reschedule Info */}
            {booking.rescheduleRequested && (
              <section className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <h3 className="text-sm font-semibold text-yellow-300 mb-2">Reschedule Requested</h3>
                <p className="text-sm text-yellow-200">{booking.rescheduleReason}</p>
              </section>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/5 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (booking.customerPhone) {
                    window.open(`tel:${booking.customerPhone}`);
                  }
                }}
                disabled={!booking.customerPhone}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Call Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
