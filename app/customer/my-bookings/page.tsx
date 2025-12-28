'use client';

import { useEffect, useMemo, useState } from 'react';
import PaymentForm from '../../components/PaymentForm';

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
  duration: number;
  slots: BookingSlot[];
  slotType: 'ev' | 'car-wash' | 'normal' | 'mixed';
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
  paymentId?: string;
}

type Filter = 'all' | 'pending' | 'paid' | 'completed' | 'cancelled';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    stored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setBookings(stored);
  }, []);

  // ✅ Pricing rules:
  // Full fee per slot per hour = 300
  // Online fee (advance) per slot = 150 (paid once, NOT per hour)
  const FULL_FEE_PER_SLOT_PER_HOUR = 300;
  const ONLINE_FEE_PER_SLOT = 150;

  // ✅ Total = 300 * duration(hours) * number of slots
  const getTotal = (b: Booking) => FULL_FEE_PER_SLOT_PER_HOUR * b.duration * b.slots.length;

  // ✅ Pay now = 150 * number of slots (one time)
  const getPaidNow = (b: Booking) => ONLINE_FEE_PER_SLOT * b.slots.length;

  // ✅ Remaining = Total - PaidNow
  const getRemaining = (b: Booking) => Math.max(0, getTotal(b) - getPaidNow(b));

  const handlePayNow = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (!selectedBooking) return;

    const updated: Booking[] = bookings.map((b) =>
      b.bookingId === selectedBooking.bookingId
        ? { ...b, status: 'paid' as Booking['status'], paymentId }
        : b
    );

    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
    setSelectedBooking(null);
    setShowPaymentForm(false);
  };

  const handleDelete = (bookingId: string) => {
    const updated: Booking[] = bookings.filter((b) => b.bookingId !== bookingId);
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  const confirmCancelBooking = () => {
    if (!cancelTarget) return;

    const updated: Booking[] = bookings.map((b) =>
      b.bookingId === cancelTarget.bookingId
        ? { ...b, status: 'cancelled' as Booking['status'] }
        : b
    );

    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
    setCancelTarget(null);
  };

  const filtered = useMemo(
    () => bookings.filter((b) => filter === 'all' || b.status === filter),
    [bookings, filter]
  );

  const statusMeta = (status: Booking['status']) => {
    if (status === 'paid')
      return {
        label: 'Paid',
        pill: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    if (status === 'pending')
      return {
        label: 'Pending',
        pill: 'bg-amber-500/12 text-amber-300 border-amber-500/20',
        dot: 'bg-amber-400',
      };
    if (status === 'cancelled')
      return {
        label: 'Cancelled',
        pill: 'bg-rose-500/12 text-rose-300 border-rose-500/20',
        dot: 'bg-rose-400',
      };
    return {
      label: 'Completed',
      pill: 'bg-sky-500/12 text-sky-300 border-sky-500/20',
      dot: 'bg-sky-400',
    };
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-10 sm:p-12 text-center shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-lime-400">My Bookings</h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">You have no bookings yet.</p>

        <a
          href="/customer/view-bookings"
          className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 font-semibold hover:scale-105 hover:shadow-lg transition"
        >
          Book a Slot →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Online fee (Rs.{ONLINE_FEE_PER_SLOT} per slot) is{' '}
            <span className="text-rose-300 font-semibold">non-refundable</span> if you cancel.
          </p>
        </div>

        {/* Mobile-friendly filters: horizontal scroll */}
        <div className="-mx-2 px-2 overflow-x-auto">
          <div className="flex gap-2 w-max pb-1">
            {(['all', 'pending', 'paid', 'cancelled'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition
                  ${
                    filter === f
                      ? 'bg-lime-500 text-slate-900 border-lime-400'
                      : 'bg-slate-950/40 text-slate-300 border-slate-800 hover:bg-slate-900/60'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booking list */}
      <div className="grid gap-3">
        {filtered.map((b) => {
          const total = getTotal(b);
          const paidNow = getPaidNow(b);
          const remaining = getRemaining(b);
          const expanded = expandedBookingId === b.bookingId;
          const s = statusMeta(b.status);
          const canCancel = b.status === 'pending' || b.status === 'paid';

          return (
            <div
              key={b.bookingId}
              className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
            >
              {/* Top bar */}
              <div className="px-4 py-3 border-b border-slate-800/70 bg-slate-950/30">
                {/* Mobile stacks; desktop aligns */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-lime-400 to-lime-300 text-slate-900 flex items-center justify-center ring-1 ring-lime-200/30">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M5 16h14l-1.5-7H6.5L5 16Z" />
                          <path d="M7 16v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
                          <path d="M9 11h6" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-white truncate">{b.location}</h2>
                          <span
                            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${s.pill}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{b.bookingId}</p>
                      </div>
                    </div>

                    {/* Compact facts */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip label={`📅 ${formatDate(b.date)}`} />
                      <Chip label={`🕒 ${b.time}`} />
                      <Chip label={`⏱ ${b.duration}h`} />
                    </div>
                  </div>

                  {/* Price badge: full width on mobile, compact on desktop */}
                  <div className="w-full sm:w-auto">
                    <div className="rounded-xl border border-lime-400/15 bg-slate-950/35 px-3 py-2 sm:text-right">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Remaining</p>
                      <p className="text-lg font-extrabold text-lime-300 leading-tight">Rs.{remaining}</p>
                      <p className="text-[11px] text-slate-400">Total Rs.{total}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-3">
                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5">Selected slots</p>
                  <div className="flex flex-wrap gap-2">
                    {b.slots.map((slot) => (
                      <span
                        key={slot.id}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/40 text-xs text-slate-200"
                      >
                        {slot.number}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats: 1 col on tiny screens, 3 cols otherwise */}
                <div className="mt-3 grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                  <TinyStat label="Total" value={`Rs.${total}`} />
                  <TinyStat label="Paid" value={`Rs.${paidNow}`} />
                  <TinyStat label="Remaining" value={`Rs.${remaining}`} highlight />
                </div>

                {/* Actions: full width buttons on mobile */}
                <div className="mt-3 grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handlePayNow(b)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 text-sm font-semibold hover:shadow-lg transition"
                    >
                      Pay Rs.{paidNow}
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => setCancelTarget(b)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition"
                    >
                      Cancel Booking
                    </button>
                  )}

                  <button
                    onClick={() => setExpandedBookingId(expanded ? null : b.bookingId)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/40 text-slate-200 text-sm font-semibold hover:bg-slate-800/60 transition"
                  >
                    {expanded ? 'Hide' : 'Details'}
                  </button>

                  <button
                    onClick={() => handleDelete(b.bookingId)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/40 text-slate-300 text-sm font-semibold hover:text-rose-300 hover:border-rose-500/30 transition"
                  >
                    Delete
                  </button>
                </div>

                {expanded && (
                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-xs text-slate-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="text-slate-400">Created:</span>{' '}
                        <span className="font-semibold text-slate-100">{new Date(b.createdAt).toLocaleString()}</span>
                      </div>

                      {b.paymentId && (
                        <div className="font-mono text-[11px] text-slate-400">
                          Payment ID: <span className="text-slate-200">{b.paymentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Form */}
      {showPaymentForm && selectedBooking && (
        <PaymentForm
          booking={selectedBooking}
          total={getPaidNow(selectedBooking)}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setSelectedBooking(null);
            setShowPaymentForm(false);
          }}
        />
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/20 bg-slate-950 p-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
            <p className="text-sm text-slate-300 mt-2">
              You can cancel this booking, but the online fee of{' '}
              <span className="font-bold text-rose-300">Rs.{getPaidNow(cancelTarget)}</span> is{' '}
              <span className="font-bold">not refundable</span>.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:flex sm:justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/40 text-slate-200 font-semibold hover:bg-slate-800/60 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancelBooking}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------- tiny UI helpers --------- */

function Chip({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/30 text-[11px] text-slate-300">
      {label}
    </span>
  );
}

function TinyStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-lime-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}
