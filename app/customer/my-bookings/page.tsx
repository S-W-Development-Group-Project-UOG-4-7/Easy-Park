'use client';

import { useState, useEffect } from 'react';
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
  duration: number; // <-- NEW
  slots: BookingSlot[];
  slotType: 'ev' | 'car-wash' | 'normal' | 'mixed';
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
  paymentId?: string;
}

type FilterType = 'all' | 'pending' | 'paid' | 'completed';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('bookings') || '[]');
    stored.sort(
      (a: Booking, b: Booking) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setBookings(stored);
  }, []);

  // --------------------------------------------------
  // ONLINE FEE
  // --------------------------------------------------

  const getOnlineFee = () => 150;

  // --------------------------------------------------
  // HOURLY COUNTER FEE LOGIC
  // --------------------------------------------------

  const getHourlyRate = (slotType: string) => {
    if (slotType === 'normal') return 300;
    if (slotType === 'ev' || slotType === 'car-wash') return 350;
    if (slotType === 'mixed') return 350; // highest rate rule
    return 300;
  };

  const getTotalCounterFee = (booking: Booking) => {
    const hourlyRate = getHourlyRate(booking.slotType);
    return hourlyRate * booking.duration;
  };

  // --------------------------------------------------
  // End Time Calculation Using Duration
  // --------------------------------------------------

  const getEndTime = (start: string, duration: number) => {
    const [t, p] = start.split(" ");
    const [h, m] = t.split(":");

    let hour = Number(h);

    if (p === "PM" && hour !== 12) hour += 12;
    if (p === "AM" && hour === 12) hour = 0;

    let end = (hour + duration) % 24;

    const disp = end === 0 ? 12 : end > 12 ? end - 12 : end;
    return `${disp}:${m} ${end >= 12 ? "PM" : "AM"}`;
  };

  // --------------------------------------------------
  // PAYMENT HANDLERS
  // --------------------------------------------------

  const handlePayNow = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (selectedBooking) {
      const updated = bookings.map((b) =>
        b.bookingId === selectedBooking.bookingId
          ? { ...b, status: 'paid' as const, paymentId }
          : b
      );
      setBookings(updated);
      localStorage.setItem('bookings', JSON.stringify(updated));
    }
    setSelectedBooking(null);
    setShowPaymentForm(false);
  };

  // --------------------------------------------------
  // CANCEL LOGIC
  // --------------------------------------------------

  const confirmCancelBooking = () => {
    if (!cancelTarget) return;

    const updated = bookings.map((b) =>
      b.bookingId === cancelTarget.bookingId
        ? { ...b, status: 'cancelled' as const }
        : b
    );

    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
    setCancelTarget(null);
  };

  // --------------------------------------------------
  // DELETE BOOKING
  // --------------------------------------------------

  const handleDeleteBooking = (bookingId: string) => {
    const updated = bookings.filter((b) => b.bookingId !== bookingId);
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  // --------------------------------------------------
  // STYLING HELPERS
  // --------------------------------------------------

  const getSlotTypeLabel = (type: string) => {
    switch (type) {
      case 'ev': return 'EV Charging';
      case 'car-wash': return 'Car Wash';
      case 'mixed': return 'Mixed';
      default: return 'Standard';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', icon: '⏳' },
      paid: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', icon: '✓' },
      completed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: '✓' },
      cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: '✕' },
    };

    const s = styles[status as keyof typeof styles];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>
        {s.icon} {status}
      </span>
    );
  };

  const filtered = bookings.filter((b) => filter === "all" || b.status === filter);

  // --------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------

  if (bookings.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-500 to-lime-400 bg-clip-text text-transparent">
          My Bookings
        </h1>

        <div className="p-12 text-center rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border">
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300">
            No Bookings Yet
          </h2>

          <a href="/customer/view-bookings"
            className="px-6 py-3 mt-5 inline-block bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition">
            Book Now
          </a>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-500 to-lime-400 bg-clip-text text-transparent">
        My Bookings
      </h1>

      <div className="grid gap-4">
        {filtered.map((booking) => {

          const onlineFee = getOnlineFee();
          const counterFee = getTotalCounterFee(booking);

          const isExpanded = expandedBooking === booking.bookingId;

          return (
            <div
              key={booking.bookingId}
              className="bg-gradient-to-br from-white to-slate-50 dark:from-[#1E293B] dark:to-[#0F172A] rounded-xl border p-6 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">{booking.location}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Booking ID: {booking.bookingId}
                  </p>
                </div>

                {getStatusBadge(booking.status)}
              </div>

              {/* INFO ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                
                <Detail label="Date" value={new Date(booking.date).toLocaleDateString()} />

                <Detail 
                  label="Time" 
                  value={`${booking.time} → ${getEndTime(booking.time, booking.duration)}`} 
                />

                <Detail 
                  label="Duration" 
                  value={`${booking.duration} hour${booking.duration > 1 ? "s" : ""}`} 
                />

                <Detail label="Slot Type" value={getSlotTypeLabel(booking.slotType)} />

                {/* FEES BOX */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Online Fee</p>
                  <p className="font-bold text-lime-600 dark:text-lime-400">
                    Rs. {onlineFee}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Counter Fee (Hourly × Duration)
                  </p>

                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Rs. {counterFee}
                  </p>
                </div>

              </div>

              {/* SLOTS */}
              <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Selected Slots
                </p>
                <div className="flex flex-wrap gap-2">
                  {booking.slots.map((slot) => (
                    <span
                      key={slot.id}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border rounded-lg text-sm"
                    >
                      {slot.number}
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 pt-4 border-t flex gap-3 border-slate-200 dark:border-slate-700">

                {booking.status === "pending" && (
                  <button
                    onClick={() => handlePayNow(booking)}
                    className="px-6 py-2.5 bg-gradient-to-r from-lime-500 to-lime-400 rounded-lg text-slate-900 font-semibold hover:scale-105 hover:shadow-lg transition"
                  >
                    Pay Now
                  </button>
                )}

                {(booking.status === "pending" || booking.status === "paid") && (
                  <button
                    onClick={() => setCancelTarget(booking)}
                    className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                  >
                    Cancel Booking
                  </button>
                )}

                <button
                  onClick={() => handleDeleteBooking(booking.bookingId)}
                  className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    setExpandedBooking(isExpanded ? null : booking.bookingId)
                  }
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {isExpanded ? "Hide" : "View"} Details
                </button>
              </div>

              {/* EXPANDED DETAILS */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                  {booking.paymentId && (
                    <p>
                      <strong>Payment ID:</strong> {booking.paymentId}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PAYMENT FORM */}
      {showPaymentForm && selectedBooking && (
        <PaymentForm
          booking={selectedBooking}
          total={getOnlineFee()}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setSelectedBooking(null);
            setShowPaymentForm(false);
          }}
        />
      )}

      {/* CANCELLATION MODAL */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-sm w-full border dark:border-slate-700 animate-fadeIn">

            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
              ⚠️ Cancellation Notice
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              This booking includes a <strong>non-refundable</strong> online fee of{" "}
              <strong>Rs.150</strong>.  
              If you cancel now, this amount will not be refunded.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Keep Booking
              </button>

              <button
                onClick={confirmCancelBooking}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
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

/* ---------------------------------------------
   SMALL UI COMPONENT
--------------------------------------------- */

function Detail({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="font-semibold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}
