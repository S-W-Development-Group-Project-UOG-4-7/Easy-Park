'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function passwordStrengthLabel(password: string) {
  const score =
    Number(password.length >= 8) +
    Number(/[A-Z]/.test(password)) +
    Number(/[a-z]/.test(password)) +
    Number(/[0-9]/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500' };
  return { label: 'Strong', color: 'bg-green-500' };
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const strength = useMemo(() => passwordStrengthLabel(newPassword), [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || 'Failed to reset password');
      }

      setSuccess('Password reset successful. You can now sign in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0F172A] to-[#020617] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-[#334155]/50 bg-linear-to-br from-[#1E293B] to-[#0F172A] p-8 shadow-2xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-[#E5E7EB]">Reset Password</h1>
          <p className="mb-6 text-center text-sm text-[#84CC16]">Set a new password for your EasyPark account</p>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
              {success}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-lg border border-[#334155] bg-white/5 px-4 py-3 text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>

            <div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${Math.min(100, (newPassword.length / 16) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#94A3B8]">Strength: {strength.label}</p>
            </div>

            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-[#334155] bg-white/5 px-4 py-3 text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#84CC16] to-[#BEF264] py-3 font-semibold text-[#0F172A] disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/sign-in" className="text-sm text-[#94A3B8] underline hover:text-[#E5E7EB]">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
