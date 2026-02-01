'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RoleOption = 'COUNTER' | 'WASHER' | 'LAND_OWNER';

const ROLE_OPTIONS: RoleOption[] = ['COUNTER', 'WASHER', 'LAND_OWNER'];

const initialForm = {
  fullName: '',
  address: '',
  nic: '',
  mobileNumber: '',
  email: '',
  password: '',
  passwordConfirm: '',
  role: 'COUNTER' as RoleOption,
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.nic.trim()) errors.nic = 'NIC is required';
    if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = 'Passwords do not match';
    if (!ROLE_OPTIONS.includes(formData.role)) errors.role = 'Invalid role';
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create user');
        return;
      }
      setFormData(initialForm);
      setFieldErrors({});
      setError('');
    } catch (err) {
      console.error('Create user error', err);
      setError('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">Add Users</h1>
        <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
          Create and manage COUNTER, WASHER, and LAND_OWNER accounts.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6] space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" value={formData.fullName} error={fieldErrors.fullName} onChange={(v) => onChange('fullName', v)} />
          <Field label="Address" value={formData.address} error={fieldErrors.address} onChange={(v) => onChange('address', v)} />
          <Field label="NIC" value={formData.nic} error={fieldErrors.nic} onChange={(v) => onChange('nic', v)} />
          <Field label="Mobile Number" value={formData.mobileNumber} error={fieldErrors.mobileNumber} onChange={(v) => onChange('mobileNumber', v)} />
          <Field label="Email" value={formData.email} error={fieldErrors.email} onChange={(v) => onChange('email', v)} type="email" />
          <div className="space-y-2">
            <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">Role</label>
            <select
              value={formData.role}
              onChange={(e) => onChange('role', e.target.value)}
              className="w-full rounded-lg border bg-linear-to-b px-3 py-2 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827]"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {fieldErrors.role && <p className="text-xs text-rose-400">{fieldErrors.role}</p>}
          </div>
          <Field label="Password" value={formData.password} error={fieldErrors.password} onChange={(v) => onChange('password', v)} type="password" />
          <Field label="Confirm Password" value={formData.passwordConfirm} error={fieldErrors.passwordConfirm} onChange={(v) => onChange('passwordConfirm', v)} type="password" />
        </div>

        {error && <div className="text-sm text-rose-400">{error}</div>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/view-users')}
            className="px-5 py-2.5 rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold"
          >
            View Users
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-linear-to-r from-[#84CC16] to-[#BEF264] px-6 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-linear-to-b px-3 py-2 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400"
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
