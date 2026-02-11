'use client';

import { X, Loader2, ReceiptText, CreditCard, CalendarClock, Car } from 'lucide-react';
import type { BookingPaymentDetails } from '../../services/api';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  details: BookingPaymentDetails | null;
}

const formatCurrency = (amount: number, currency: string) => {
  return `${currency} ${amount.toFixed(2)}`;
};

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  loading,
  error,
  details,
}: PaymentDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payment Details</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Booking {details?.bookingId || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close payment details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-14 text-slate-500 dark:text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading payment details...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-500 dark:text-rose-300">
              {error}
            </div>
          ) : !details ? (
            <div className="py-14 text-center text-sm text-slate-500 dark:text-slate-400">
              No payment details available.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/50 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Total Amount</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(details.totalAmount, details.currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/50 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Online Paid</p>
                  <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(details.onlinePaid, details.currency)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/50 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">Balance Due</p>
                  <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(details.balanceDue, details.currency)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <CreditCard className="h-4 w-4" /> Payment
                  </p>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <p>Method: {details.paymentMethod || 'N/A'}</p>
                    <p>Status: {details.paymentStatus}</p>
                    <p>Gateway: {details.paymentGatewayStatus}</p>
                    <p>Transaction: {details.transactionId || 'N/A'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <CalendarClock className="h-4 w-4" /> Booking Time
                  </p>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <p>Date: {new Date(details.bookingDate).toLocaleDateString()}</p>
                    <p>Start: {new Date(details.bookingTime).toLocaleTimeString()}</p>
                    <p>Hours: {details.hoursSelected}</p>
                    <p>Check-in: {details.checkInTime ? new Date(details.checkInTime).toLocaleTimeString() : 'N/A'}</p>
                    <p>Check-out: {details.checkOutTime ? new Date(details.checkOutTime).toLocaleTimeString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Car className="h-4 w-4" /> Booking Type
                </p>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <p>Parking Type: {details.parkingType}</p>
                  <p>Booking Type: {details.bookingType}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <ReceiptText className="h-4 w-4" /> Extras
                </p>
                <pre className="whitespace-pre-wrap break-words text-xs text-slate-600 dark:text-slate-300">
                  {details.extras ? JSON.stringify(details.extras, null, 2) : 'No extras'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
