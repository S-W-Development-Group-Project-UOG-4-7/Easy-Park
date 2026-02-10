'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider'; 
import PaymentForm from '../../components/PaymentForm';

// --- Interfaces ---
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
  totalAmount?: number;
  paidAmount?: number;
}

type Filter = 'all' | 'pending' | 'paid' | 'completed' | 'cancelled';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  
  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentMode, setPaymentMode] = useState<'advance' | 'remaining' | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  // --- Pricing Logic ---
  const FULL_FEE_PER_HOUR = 300;      // Total cost rate: 300 per hour
  const ADVANCE_PAYMENT_FIXED = 150;  // Fixed advance payment (not per slot)

  // 1. Calculate Full Total Cost
  // Formula: Duration (hours) × Rate (300/hour) × Number of Slots
  const calculateTotal = (b: Booking) => 
    b.totalAmount ?? (FULL_FEE_PER_HOUR * b.duration * b.slots.length);

  // 2. Calculate Required Advance (Fixed 150, regardless of slots)
  const calculateAdvance = (b: Booking) => 
    ADVANCE_PAYMENT_FIXED;

  // 3. Get Amount Actually Paid (from DB)
  const getAmountPaid = (b: Booking) => 
    b.paidAmount ?? 0;

  // 4. Calculate Remaining Balance (Total - Paid)
  const calculateRemaining = (b: Booking) => 
    Math.max(0, calculateTotal(b) - getAmountPaid(b));

  // 5. Effective Status (cancelled > pending if remaining > 0 > paid)
  const getEffectiveStatus = (b: Booking) => {
    if (b.status === 'cancelled') return 'cancelled' as const;
    const remaining = calculateRemaining(b);
    return remaining > 0 ? ('pending' as const) : ('paid' as const);
  };

  // --- Fetch Bookings ---
  const fetchBookings = async (retry = false) => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      if (bookings.length === 0) setLoading(true); 
      const res = await fetch('/api/bookings/list', { credentials: 'include' });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { success: false, error: await res.text() };
      if (res.ok && data.success) {
        setBookings(data.data || []);
      } else if (res.status === 401) {
        router.replace('/sign-in');
      } else if (!retry && res.status === 404 && (data.error === 'User not found' || data.message === 'User not found')) {
        await refreshUser();
        return fetchBookings(true);
      } else {
        console.error('Failed to load bookings', data.error || data.message || res.statusText);
      }
    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchBookings();
  }, [authLoading, user]);

  // --- Handlers ---

  const handlePayAdvance = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentMode('advance');
    setPaymentAmount(calculateAdvance(booking));
    setShowPaymentForm(true);
  };

  const handlePayRemaining = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentMode('remaining');
    setPaymentAmount(calculateRemaining(booking));
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (_payload: { paymentId: string; booking: any }) => {
    if (!selectedBooking) return;
    
    setSelectedBooking(null);
    setShowPaymentForm(false);
    setPaymentAmount(null);
    setPaymentMode(null);
    await fetchBookings(); // Backend is source of truth
  };

  const confirmCancelBooking = async () => {
    if (!cancelTarget) return;
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: cancelTarget.bookingId })
      });
      const data = await res.json();

      if (data.success) {
        const updated = bookings.map((b) =>
          b.bookingId === cancelTarget.bookingId
            ? { ...b, status: 'cancelled' as const }
            : b
        );
        setBookings(updated);
      } else {
        alert(data.error || "Failed to cancel");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setCancelTarget(null);
    }
  };

  const filtered = useMemo(
    () => bookings.filter((b) => {
      if (filter === 'all') return true;
      return getEffectiveStatus(b) === filter;
    }),
    [bookings, filter]
  );

  const statusMeta = (status: Booking['status']) => {
    if (status === 'paid') return { label: 'Paid', pill: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/20', dot: 'bg-emerald-400' };
    if (status === 'pending') return { label: 'Pending Payment', pill: 'bg-amber-500/12 text-amber-300 border-amber-500/20', dot: 'bg-amber-400' };
    if (status === 'cancelled') return { label: 'Cancelled', pill: 'bg-rose-500/12 text-rose-300 border-rose-500/20', dot: 'bg-rose-400' };
    return { label: 'Completed', pill: 'bg-sky-500/12 text-sky-300 border-sky-500/20', dot: 'bg-sky-400' };
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) { return iso; }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="h-8 w-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-10 sm:p-12 text-center shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-lime-400">My Bookings</h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">You have no bookings yet.</p>
        <a href="/customer/view-bookings" className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 font-semibold hover:scale-105 hover:shadow-lg transition">
          Book a Slot →
        </a>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pay <span className="text-lime-400 font-bold">Rs.{ADVANCE_PAYMENT_FIXED}</span> advance now. Pay the rest at the location.
          </p>
        </div>

        {/* Filters */}
        <div className="-mx-2 px-2 overflow-x-auto">
          <div className="flex gap-2 w-max pb-1">
            {(['all', 'pending', 'paid', 'cancelled'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition
                  ${filter === f ? 'bg-lime-500 text-slate-900 border-lime-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Booking List */}
      <div className="grid gap-3">
        {filtered.map((b) => {
          const total = calculateTotal(b);
          const advanceRequired = calculateAdvance(b);
          const paidSoFar = getAmountPaid(b);
          
          // Logic: Remaining = Total - Paid
          // If status is pending, paid is 0, remaining = total
          // If status is paid, paid is 150, remaining = total - 150
          const remaining = calculateRemaining(b);
          const effectiveStatus = getEffectiveStatus(b);
          
          const expanded = expandedBookingId === b.bookingId;
          const s = statusMeta(effectiveStatus);
          const canCancel = b.status === 'pending' || b.status === 'paid';

          return (
            <div key={b.bookingId} className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
              {/* Top Bar */}
              <div className="px-4 py-3 border-b border-slate-800/70 bg-slate-950/30">
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
                          <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${s.pill}`}>
                            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{b.bookingId.slice(0, 8)}...</p>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip label={`📅 ${formatDate(b.date)}`} />
                      <Chip label={`🕒 ${b.time}`} />
                      <Chip label={`⏱ ${b.duration}h`} />
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="w-full sm:w-auto">
                    <div className="rounded-xl border border-lime-400/15 bg-slate-950/35 px-3 py-2 sm:text-right">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Due at Location</p>
                      <p className="text-lg font-extrabold text-lime-300 leading-tight">Rs.{remaining}</p>
                      <p className="text-[11px] text-slate-400">Total Bill Rs.{total}</p>
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
                      <span key={slot.id} className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/40 text-xs text-slate-200">
                        {slot.number}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                  <TinyStat label="Total Value" value={`Rs.${total}`} />
                  <TinyStat label="Paid Online" value={`Rs.${paidSoFar}`} />
                  <TinyStat label="Balance Due" value={`Rs.${remaining}`} highlight />
                </div>

                {/* Actions */}
                <div className="mt-3 grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                  {b.status === 'pending' && (
                    <button onClick={() => handlePayAdvance(b)} className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 text-sm font-semibold hover:shadow-lg transition">
                      Pay Advance (Rs.{advanceRequired})
                    </button>
                  )}
                  {b.status !== 'cancelled' && remaining > 0 && (
                    <button onClick={() => handlePayRemaining(b)} className="w-full sm:w-auto px-4 py-2 rounded-xl border border-lime-400/40 bg-slate-900/40 text-lime-200 text-sm font-semibold hover:bg-slate-800/60 transition">
                      Pay Remaining (Rs.{remaining})
                    </button>
                  )}
                  {canCancel && (
                    <button onClick={() => setCancelTarget(b)} className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition">
                      Cancel Booking
                    </button>
                  )}
                  <button onClick={() => setExpandedBookingId(expanded ? null : b.bookingId)} className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/40 text-slate-200 text-sm font-semibold hover:bg-slate-800/60 transition">
                    {expanded ? 'Hide' : 'Details'}
                  </button>
                </div>

                {/* Expanded Details */}
                {expanded && (
                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-xs text-slate-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="text-slate-400">Created:</span>{' '}
                        <span className="font-semibold text-slate-100">{new Date(b.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        ID: <span className="text-slate-200">{b.bookingId}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedBooking && (
        <PaymentForm
          booking={selectedBooking}
          // The form asks "How much do you want to pay?". We pass the selected amount here.
          total={paymentAmount ?? (paymentMode === 'remaining' ? calculateRemaining(selectedBooking) : calculateAdvance(selectedBooking))}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setSelectedBooking(null);
            setShowPaymentForm(false);
            setPaymentAmount(null);
            setPaymentMode(null);
          }}
        />
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
            <p className="text-sm text-slate-300 mt-2">
              If you have already paid the advance of <span className="font-bold text-rose-300">Rs.{calculateAdvance(cancelTarget)}</span>, it is non-refundable.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCancelTarget(null)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900">
                Keep Booking
              </button>
              <button onClick={confirmCancelBooking} className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700">
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Small UI Helpers ---
function Chip({ label }: { label: string }) {
  return <span className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/30 text-[11px] text-slate-300">{label}</span>;
}

function TinyStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-lime-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}
