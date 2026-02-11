'use client';

import { useEffect, useState } from 'react';
import { useAuthModal } from '../AuthModalProvider';

export function ForgotPasswordCard({ initialEmail = '' }: { initialEmail?: string }) {
  const { openSignIn } = useAuthModal();
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      const apiMessage =
        String(data?.message || data?.data?.message || '').trim() ||
        'If an account exists for this email, a reset link has been sent.';
      setMessage(apiMessage);
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('If an account exists for this email, a reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-[#334155]/50 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-bold text-[#E5E7EB]">Forgot Password</h1>
          <p className="text-center text-sm text-[#84CC16]">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-[#334155] bg-white/5 px-4 py-3 text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
          />

          {message ? (
            <div className="rounded-lg border border-[#334155] bg-[#0B1220] px-3 py-2 text-sm text-[#E5E7EB]">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-[#84CC16] to-[#BEF264] py-3 font-semibold text-[#0F172A] disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => openSignIn()}
            className="text-sm text-[#94A3B8] underline hover:text-[#E5E7EB]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
