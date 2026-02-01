'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UsersTable from '../components/UsersTable';

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  contactNo: string | null;
  nic: string | null;
  createdAt: string;
};

export default function ViewUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
        setError('');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">View Users</h1>
          <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
            Review and manage all COUNTER, WASHER, and LAND_OWNER accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/users')}
          className="px-4 py-2 rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold"
        >
          Back to Add Users
        </button>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        error={error}
        onRefresh={fetchUsers}
        onView={(id) => router.push(`/admin/users/${id}`)}
        onEdit={(id) => router.push(`/admin/users/${id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
