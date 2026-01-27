import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and admin info
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      // Redirect to admin home
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br dark:from-[#0F172A] dark:to-[#1E293B] from-[#F3F4F6] to-white p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-linear-to-br p-8 shadow-xl dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#84CC16] to-[#BEF264] mb-4">
              <Lock className="w-8 h-8 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold dark:text-[#E5E7EB] text-[#111827]">
              Admin Login
            </h1>
            <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
              Sign in to access the parking management dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-[#E5E7EB] text-[#111827]">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-[#94A3B8] text-[#6B7280]" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username or email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-linear-to-b text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-[#E5E7EB] text-[#111827]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-[#94A3B8] text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg border bg-linear-to-b text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#84CC16]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280] hover:text-[#84CC16]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-linear-to-r from-[#84CC16] to-[#BEF264] text-slate-950 font-semibold transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-lg bg-[#84CC16]/10 border border-[#84CC16]/20">
            <p className="text-sm font-medium dark:text-[#E5E7EB] text-[#111827] mb-2">
              Demo Credentials:
            </p>
            <p className="text-sm dark:text-[#94A3B8] text-[#6B7280]">
              Username: <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800">admin</code>
            </p>
            <p className="text-sm dark:text-[#94A3B8] text-[#6B7280]">
              Password: <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
