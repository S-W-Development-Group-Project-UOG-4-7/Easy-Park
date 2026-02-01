'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type RoleOption = 'COUNTER' | 'WASHER' | 'LAND_OWNER';

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  contactNo: string | null;
  nic: string | null;
  createdAt: string;
};

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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Failed to load users', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      await fetchUsers();
    } catch (err) {
      console.error('Create user error', err);
      setError('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this user? This action cannot be undone.');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete user');
        return;
      }
      await fetchUsers();
    } catch (err) {
      console.error('Delete user error', err);
      setError('Failed to delete user');
    }
  };

  const rows = useMemo(() => users, [users]);

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
        className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" value={formData.fullName} error={fieldErrors.fullName} onChange={(v) => onChange('fullName', v)} />
          <Field label="Address" value={formData.address} error={fieldErrors.address} onChange={(v) => onChange('address', v)} />
          <Field label="NIC" value={formData.nic} error={fieldErrors.nic} onChange={(v) => onChange('nic', v)} />
          <Field label="Mobile Number" value={formData.mobileNumber} error={fieldErrors.mobileNumber} onChange={(v) => onChange('mobileNumber', v)} />
          <Field label="Email" value={formData.email} error={fieldErrors.email} onChange={(v) => onChange('email', v)} type="email" />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Role</label>
            <select
              value={formData.role}
              onChange={(e) => onChange('role', e.target.value)}
              className="w-full rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-500/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Added Users</h2>
          <button
            onClick={fetchUsers}
            className="text-xs font-semibold text-lime-500 hover:text-lime-400 transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading users...</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">No users added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60">
                  <th className="py-3 pr-4">Full Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Mobile</th>
                  <th className="py-3 pr-4">NIC</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200/40 dark:border-slate-800/40">
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{user.fullName}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-slate-200/60 dark:bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{user.contactNo || '-'}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{user.nic || '-'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                          className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition"
                        >
                          Delete
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
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950/60 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
