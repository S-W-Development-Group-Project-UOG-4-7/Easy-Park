'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignUpCard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    contactNo: '',
    email: '',
    vehicleNumber: '',
    nic: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  // Helper function to get redirect path based on role
  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'CUSTOMER':
        return '/customer';
      case 'COUNTER':
        return '/counter';
      case 'LAND_OWNER':
        return '/land-owner';
      case 'WASHER':
        return '/washer';
      default:
        return '/customer';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          contactNo: formData.contactNo,
          email: formData.email,
          vehicleNumber: formData.vehicleNumber,
          nic: formData.nic,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Success! Redirect based on user role
      const redirectPath = getRedirectPath(data.data.user.role);
      router.push(redirectPath);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl p-8 border border-[#334155]/50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2 text-center">Sign up</h1>
          <p className="text-sm text-[#84CC16] text-center">Use email or service, to create account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name *"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <input
              type="tel"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="Contact No"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              placeholder="Vehicle Number"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              placeholder="NIC"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="ADMIN" className="bg-[#1E293B] text-[#E5E7EB]">Admin</option>
              <option value="CUSTOMER" className="bg-[#1E293B] text-[#E5E7EB]">Customer</option>
              <option value="COUNTER" className="bg-[#1E293B] text-[#E5E7EB]">Counter</option>
              <option value="LAND_OWNER" className="bg-[#1E293B] text-[#E5E7EB]">Land Owner</option>
              <option value="WASHER" className="bg-[#1E293B] text-[#E5E7EB]">Washer</option>
            </select>
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password *"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password *"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#334155] text-[#E5E7EB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:border-transparent transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-gradient-to-r hover:from-[#84CC16] hover:to-[#BEF264] hover:text-black transition-all duration-300 shadow-lg hover:shadow-[#84CC16]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="flex-1 py-3 rounded-lg bg-[#334155] hover:bg-[#475569] transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>

          <button
            type="button"
            className="flex-1 py-3 rounded-lg bg-[#334155] hover:bg-[#475569] transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.0 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#94A3B8]">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="text-blue-500 hover:text-blue-400 underline transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
