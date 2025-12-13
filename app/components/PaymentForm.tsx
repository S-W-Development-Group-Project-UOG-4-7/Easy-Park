'use client';

import { useState } from 'react';

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
  total: number;
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      alert('Please agree to the non-refundable terms and conditions to proceed');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setIsProcessing(false);
      onSuccess(paymentId);
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').substring(0, 3);
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 
      bg-black/40 backdrop-blur-xl animate-fadeIn">

      {/* Glass Container */}
      <div className="
        w-full max-w-2xl max-h-[90vh] overflow-y-auto 
        rounded-2xl border border-white/20 
        bg-white/10 dark:bg-slate-800/20 
        backdrop-blur-2xl shadow-2xl p-6 md:p-8 
        animate-scaleIn
      ">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-lime-400 to-lime-300 bg-clip-text text-transparent drop-shadow-sm">
            Payment Details
          </h2>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition duration-200"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Booking Summary */}
        <div className="
          bg-white/20 dark:bg-slate-900/30 
          backdrop-blur-xl border border-white/20 
          rounded-xl p-5 mb-6 shadow-inner
        ">
          <h3 className="font-semibold text-white/90 mb-2">Booking Summary</h3>

          <div className="text-sm text-white/80 space-y-1">
            <p>Booking ID: {booking.bookingId}</p>
            <p>Location: {booking.location}</p>
            <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
            <p>Time: {booking.time}</p>
            <p>Slots: {booking.slots.map((s) => s.number).join(', ')}</p>

            <p className="text-xl font-bold text-lime-300 mt-3 drop-shadow">
              Total: Rs. {total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Card Number */}
          <InputField
            label="Card Number"
            name="cardNumber"
            value={formData.cardNumber}
            placeholder="1234 5678 9012 3456"
            onChange={handleInputChange}
            maxLength={19}
          />

          {/* Cardholder Name */}
          <InputField
            label="Cardholder Name"
            name="cardName"
            value={formData.cardName}
            placeholder="John Doe"
            onChange={handleInputChange}
          />

          {/* Expiry/CVV */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Expiry Date"
              name="expiryDate"
              value={formData.expiryDate}
              placeholder="MM/YY"
              onChange={handleInputChange}
              maxLength={5}
            />
            <InputField
              label="CVV"
              name="cvv"
              value={formData.cvv}
              placeholder="123"
              onChange={handleInputChange}
              maxLength={3}
            />
          </div>

          {/* Email */}
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            placeholder="your@email"
            onChange={handleInputChange}
          />

          {/* Phone */}
          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            placeholder="+94 XXXXXXXX"
            onChange={handleInputChange}
          />

          {/* Terms */}
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-4 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-red-300 bg-white/20"
              />
              <div>
                <p className="font-semibold">Non-Refundable Terms</p>
                <p className="text-xs opacity-80">
                  I understand that the <strong>Rs.150 booking fee is strictly non-refundable</strong>.
                </p>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-6 py-3 rounded-lg font-semibold 
                bg-white/20 text-white/80 backdrop-blur-xl 
                border border-white/30 hover:bg-white/30 transition
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!agreedToTerms || isProcessing}
              className={`
                flex-1 px-6 py-3 rounded-lg font-semibold transition-all 
                ${agreedToTerms && !isProcessing
                    ? 'bg-gradient-to-r from-lime-400 to-lime-300 text-slate-900 hover:scale-105 shadow-xl'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'}
              `}
            >
              {isProcessing ? 'Processing...' : `Pay Rs. ${total}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   SMALL REUSABLE INPUT COMPONENT
----------------------------------------------------- */
function InputField({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-2">
        {label}
      </label>
      <input
        {...props}
        required
        className="
          w-full px-4 py-2 rounded-lg border  
          bg-white/20 text-white placeholder-white/60
          backdrop-blur-xl border-white/30 
          focus:outline-none focus:ring-2 focus:ring-lime-400
        "
      />
    </div>
  );
}
