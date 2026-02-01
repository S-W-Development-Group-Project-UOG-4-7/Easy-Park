'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, CreditCard, Lock, Eye, EyeOff, RefreshCw, Trash2, Edit2, AlertCircle, UserPlus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  contactNo: string | null;
  nic: string | null;
  address?: string;
  createdAt: string;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNo: string;
  nic: string;
  address: string;
  role: 'COUNTER' | 'WASHER' | 'LAND_OWNER';
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  contactNo?: string;
  nic?: string;
  address?: string;
}

export default function AddUsersPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: '',
    nic: '',
    address: '',
    role: 'COUNTER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Fetch existing users (COUNTER, WASHER, LAND_OWNER only)
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/users?roles=COUNTER,WASHER,LAND_OWNER', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Mobile number is required';
    }

    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          contactNo: formData.contactNo,
          nic: formData.nic,
          address: formData.address,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          contactNo: '',
          nic: '',
          address: '',
          role: 'COUNTER',
        });
        setErrors({});
        fetchUsers();
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        alert(data.error || 'Failed to create user. Please try again.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'COUNTER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'WASHER':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'LAND_OWNER':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">Add Users</h1>
          <p className="mt-1 text-sm dark:text-[#94A3B8] text-[#6B7280]">
            Create and manage COUNTER, WASHER, and LAND_OWNER accounts.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            User created successfully!
          </div>
        )}

        {/* Add User Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border bg-gradient-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                }}
                placeholder="Enter full name"
                className={`w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.fullName ? 'border-red-500' : ''}`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: undefined });
                }}
                placeholder="Enter address"
                className={`w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* NIC */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                NIC
              </label>
              <input
                type="text"
                value={formData.nic}
                onChange={(e) => {
                  setFormData({ ...formData, nic: e.target.value });
                  if (errors.nic) setErrors({ ...errors, nic: undefined });
                }}
                placeholder="Enter NIC number"
                className={`w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.nic ? 'border-red-500' : ''}`}
              />
              {errors.nic && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.nic}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.contactNo}
                onChange={(e) => {
                  setFormData({ ...formData, contactNo: e.target.value });
                  if (errors.contactNo) setErrors({ ...errors, contactNo: undefined });
                }}
                placeholder="Enter mobile number"
                className={`w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.contactNo ? 'border-red-500' : ''}`}
              />
              {errors.contactNo && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.contactNo}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="Enter email address"
                className={`w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'COUNTER' | 'WASHER' | 'LAND_OWNER' })}
                className="w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] cursor-pointer"
              >
                <option value="COUNTER">COUNTER</option>
                <option value="WASHER">WASHER</option>
                <option value="LAND_OWNER">LAND_OWNER</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Enter password"
                  className={`w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 pr-10 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280] hover:text-[#84CC16]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder="Confirm password"
                  className={`w-full rounded-lg border bg-gradient-to-b px-4 py-2.5 pr-10 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280] hover:text-[#84CC16]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#84CC16] to-[#BEF264] px-6 py-2.5 text-sm font-medium text-slate-900 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>

        {/* Added Users Table */}
        <div className="rounded-xl border bg-gradient-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-[#E5E7EB] text-[#111827]">Added Users</h2>
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="flex items-center gap-2 text-sm dark:text-[#84CC16] text-[#65A30D] hover:opacity-80 transition-opacity"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin dark:text-[#84CC16] text-[#65A30D]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 dark:text-[#94A3B8] text-[#6B7280]">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No users found. Create your first user above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700 border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">Full Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">Mobile</th>
                    <th className="px-4 py-3 text-left text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">NIC</th>
                    <th className="px-4 py-3 text-center text-sm font-medium dark:text-[#94A3B8] text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b dark:border-slate-800 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm dark:text-[#E5E7EB] text-[#111827]">{user.fullName}</td>
                      <td className="px-4 py-3 text-sm dark:text-[#E5E7EB] text-[#111827]">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-[#E5E7EB] text-[#111827]">{user.contactNo || '-'}</td>
                      <td className="px-4 py-3 text-sm dark:text-[#E5E7EB] text-[#111827]">{user.nic || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            disabled={deletingId === user.id}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            {deletingId === user.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
