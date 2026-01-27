'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CreditCard, CheckCircle, ShieldCheck, X } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: () => Promise<void>;
  onClose: () => void;
}

export default function PaymentGatewayModal({ amount, onSuccess, onClose }: PaymentGatewayProps) {
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Format card number with spaces
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(val.replace(/(\d{4})/g, '$1 ').trim());
  };

  const handlePay = async () => {
    // Basic validation
    if (cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvc.length < 3) {
      setError('Please enter valid card details');
      return;
    }

    setStep('processing');
    setError(null);

    // Simulate Gateway Delay
    setTimeout(async () => {
      try {
        await onSuccess(); // Call the actual API function passed from parent
        setStep('success');
        setTimeout(onClose, 2000); // Auto close after success
      } catch (err: any) {
        setStep('input');
        setError(err.message || 'Payment failed. Please try again.');
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-lime-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Secure Payment</h3>
            <p className="text-slate-400 text-sm mt-1">Complete your advance payment to secure slots.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 flex justify-between items-center">
            <span className="text-slate-400 text-sm">Amount Due</span>
            <span className="text-xl font-bold text-white">Rs. {amount.toLocaleString()}</span>
          </div>

          {step === 'input' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-lime-400 outline-none transition-colors pl-12"
                  />
                  <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-lime-400 outline-none text-center transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">CVC</label>
                  <input 
                    type="password" 
                    placeholder="123" 
                    maxLength={3}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:border-lime-400 outline-none text-center transition-colors"
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <span className="text-xs text-red-400 font-bold">{error}</span>
                </motion.div>
              )}

              <button 
                onClick={handlePay}
                className="w-full py-4 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-lime-400/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Pay Now <ShieldCheck className="w-4 h-4" />
              </button>
              
              <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-slate-600">
                <ShieldCheck className="w-3 h-3" />
                <span>256-bit SSL Encrypted Payment</span>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-lime-400 animate-spin mx-auto" />
              <div>
                <h4 className="text-white font-bold">Processing Payment...</h4>
                <p className="text-slate-500 text-xs mt-1">Please do not close this window.</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h4 className="text-white font-bold text-xl">Payment Successful!</h4>
                <p className="text-slate-500 text-sm mt-1">Your booking has been confirmed.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}