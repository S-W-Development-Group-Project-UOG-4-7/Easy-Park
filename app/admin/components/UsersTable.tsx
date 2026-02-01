'use client';

import { useMemo } from 'react';

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  contactNo: string | null;
  nic: string | null;
  createdAt: string;
};

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  error?: string;
  onRefresh: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function UsersTable({
  users,
  loading,
  error,
  onRefresh,
  onView,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const rows = useMemo(() => users, [users]);

  return (
    <div className="rounded-xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-[#E5E7EB] text-[#111827]">Added Users</h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
        >
          Refresh
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-rose-400">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading users...</div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">No users added yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#6B7280] dark:text-[#94A3B8]">
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
                <tr
                  key={user.id}
                  className="border-b border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <td className="py-3 pr-4 font-medium dark:text-[#E5E7EB] text-[#111827]">{user.fullName}</td>
                  <td className="py-3 pr-4 text-[#6B7280] dark:text-[#94A3B8]">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-slate-200/60 dark:bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#6B7280] dark:text-[#94A3B8]">{user.contactNo || '-'}</td>
                  <td className="py-3 pr-4 text-[#6B7280] dark:text-[#94A3B8]">{user.nic || '-'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(user.id)}
                        className="rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-1 text-xs font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(user.id)}
                        className="rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-1 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
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
