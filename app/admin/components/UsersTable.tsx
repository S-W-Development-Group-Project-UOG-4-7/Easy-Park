'use client';

import { useMemo } from 'react';

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  contactNo?: string | null;
  nic: string | null;
  createdAt: string;
};

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  error?: string;
  title?: string;
  emptyMessage?: string;
  onRefresh: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function UsersTable({
  users,
  loading,
  error,
  title = 'Users',
  emptyMessage = 'No users found.',
  onRefresh,
  onView,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const rows = useMemo(() => users, [users]);

  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <button
          onClick={onRefresh}
          className="text-xs font-semibold text-lime-500 hover:text-lime-400 transition"
        >
          Refresh
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-rose-400">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading users...</div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">{emptyMessage}</div>
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
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                    {user.phone || user.contactNo || '-'}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{user.nic || '-'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(user.id)}
                        className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(user.id)}
                        className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
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
  );
}
