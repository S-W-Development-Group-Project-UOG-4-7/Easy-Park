'use client';

import { useEffect, useMemo, useState } from 'react';

interface BookingSlot {
  id: string;
  number: string;
  type: 'ev' | 'car-wash' | 'normal';
}

interface Booking {
  bookingId: string;
  date: string;
  location: string;
  time: string;
  slots: BookingSlot[];
  slotType: 'ev' | 'car-wash' | 'normal' | 'mixed';
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
}

interface PaymentFormProps {
  booking: Booking;
  total: number; // Rs.150
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export default function PaymentForm({ booking, total, onSuccess, onClose }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: '',
    phone: '',
  });

  const [agreed, setAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dateLabel = useMemo(() => {
    try {
      return new Date(booking.date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return booking.date;
    }
  }, [booking.date]);

  const slotsLabel = useMemo(() => booking.slots.map((s) => s.number).join(', '), [booking.slots]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      const spaced = digits.replace(/(.{4})/g, '$1 ').trim();
      setFormData((p) => ({ ...p, cardNumber: spaced }));
      return;
    }

    if (name === 'expiryDate') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      const formatted = digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
      setFormData((p) => ({ ...p, expiryDate: formatted }));
      return;
    }

    if (name === 'cvv') {
      setFormData((p) => ({ ...p, cvv: value.replace(/\D/g, '').slice(0, 3) }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const canPay =
    agreed &&
    !isProcessing &&
    formData.cardNumber.replace(/\s/g, '').length === 16 &&
    formData.expiryDate.length === 5 &&
    formData.cvv.length === 3 &&
    formData.cardName.trim().length >= 2 &&
    formData.email.trim().length >= 5 &&
    formData.phone.trim().length >= 7;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsProcessing(true);
    setTimeout(() => {
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setIsProcessing(false);
      onSuccess(paymentId);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55"
      onMouseDown={(e) => {
        // close when clicking backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="
          w-full sm:max-w-3xl
          max-h-[92vh] sm:max-h-none
          overflow-y-auto sm:overflow-visible
          rounded-t-2xl sm:rounded-2xl
          border border-slate-200/70 dark:border-slate-700/70
          bg-white dark:bg-slate-900
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pay Booking Fee</h2>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl grid place-items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5 text-slate-600 dark:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
            {/* Left: Summary (compact) */}
            <div className="border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/40">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">Booking</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
                  {booking.location}
                </p>

                <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <Row label="Date" value={dateLabel} />
                  <Row label="Time" value={booking.time} />
                  <Row label="Slots" value={slotsLabel} />
                  <Row label="ID" value={booking.bookingId} mono />
                </div>

                <div className="mt-4 rounded-xl bg-lime-50 dark:bg-lime-500/10 border border-lime-200 dark:border-lime-400/20 p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300">Pay now</p>
                  <p className="text-2xl font-extrabold text-lime-700 dark:text-lime-300 leading-tight">
                    Rs.{total}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Non-refundable booking fee
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-5 w-5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                      Non-refundable fee
                    </p>
                    <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                      You agree Rs.150 is not refunded if cancelled.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right: Form (tight, 2 columns) */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Card Number"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                />

                <Input
                  label="Cardholder Name"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="Name on card"
                  autoComplete="cc-name"
                />

                <Input
                  label="Expiry"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                />

                <Input
                  label="CVV"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={3}
                />

                <Input
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@email.com"
                  type="email"
                  autoComplete="email"
                />

                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+94 7X XXX XXXX"
                  autoComplete="tel"
                />
              </div>

              <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                Tip: Press <span className="font-semibold">ESC</span> to close.
              </p>
            </div>
          </div>

          {/* Sticky footer actions (MOST convenient) */}
          <div className="px-4 sm:px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-36 px-5 py-2.5 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canPay}
              className={`w-full sm:w-44 px-5 py-2.5 rounded-xl font-semibold transition
                ${
                  canPay
                    ? 'bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 hover:shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {isProcessing ? 'Processing…' : `Pay Now`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- small helpers ---------- */

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={`text-xs text-right text-slate-700 dark:text-slate-200 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Input(props: any) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <input
        {...rest}
        required
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                   focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition"
      />
    </div>
  );
}
