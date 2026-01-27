'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentFormProps {
  booking: any;
  total: number;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export default function PaymentForm({ booking, total, onSuccess, onClose }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (cardNumber.length < 19 || cvc.length < 3 || expiry.length < 5) {
      setError('Please enter valid card details');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          amount: total,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess(data.data.id); // Pass the new payment ID back to parent
      } else {
        setError(data.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/10 blur-[80px] rounded-full -z-10" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Secure Payment</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">✕</button>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400">Total Amount</p>
            <p className="text-lg font-bold text-white">Rs.{total}</p>
          </div>
          <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-xs font-mono text-slate-300">
            VISA
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Card Number</label>
            <input 
              type="text" 
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-lime-500 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Expiry</label>
              <input 
                type="text" 
                placeholder="MM/YY"
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-lime-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">CVC</label>
              <input 
                type="password" 
                placeholder="123"
                maxLength={3}
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-lime-500 outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-lime-500 to-lime-400 text-slate-900 rounded-xl font-bold uppercase tracking-wide text-xs hover:shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              `Pay Rs.${total}`
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}