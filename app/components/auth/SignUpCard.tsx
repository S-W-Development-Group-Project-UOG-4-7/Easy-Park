'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '../AuthModalProvider';

// Map roles to their redirect paths
const ROLE_REDIRECT_MAP: Record<string, string> = {
  ADMIN: '/admin',
  CUSTOMER: '/customer',
  COUNTER: '/counter',
  LANDOWNER: '/land_owner',
  LAND_OWNER: '/land_owner',
  WASHER: '/washer',
};

export function SignUpCard() {
  const router = useRouter();
  const { openSignIn } = useAuthModal();
  const [formData, setFormData] = useState({
    fullName: '',
    contactNo: '',
    email: '',
    vehicleNumber: '',
    nic: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
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
        credentials: 'include',
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
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Success! Redirect based on user role
      const redirectPath = ROLE_REDIRECT_MAP.CUSTOMER || '/customer';
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
      <div className="bg-linear-to-br from-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl p-8 border border-[#334155]/50">
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
            className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-linear-to-r hover:from-[#84CC16] hover:to-[#BEF264] hover:text-black transition-all duration-300 shadow-lg hover:shadow-[#84CC16]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#94A3B8]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => openSignIn()}
              className="text-blue-500 hover:text-blue-400 underline transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
