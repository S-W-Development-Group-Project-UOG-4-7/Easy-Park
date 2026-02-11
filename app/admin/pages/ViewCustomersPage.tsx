'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import UsersTable from '../components/UsersTable';

type CustomerRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  contactNo?: string | null;
  nic: string | null;
  createdAt: string;
};

type CustomerApiRow = {
  id: string;
  fullName?: string;
  full_name?: string;
  email: string;
  role?: string | null;
  phone?: string | null;
  contactNo?: string | null;
  nic?: string | null;
  createdAt?: string;
};

type ToastState = {
  message: string;
  type: 'error' | 'success';
} | null;

export default function ViewCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const mapCustomerRows = useCallback((rows: CustomerApiRow[]): CustomerRow[] => {
    return rows.map((row) => ({
      id: row.id,
      fullName: row.fullName || row.full_name || '',
      email: row.email,
      role: row.role || 'CUSTOMER',
      phone: row.phone ?? row.contactNo ?? null,
      contactNo: row.contactNo ?? row.phone ?? null,
      nic: row.nic ?? null,
      createdAt: row.createdAt || new Date(0).toISOString(),
    }));
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        const rows = Array.isArray(data.data) ? data.data : [];
        setCustomers(mapCustomerRows(rows));
        setError('');
        return;
      }
      if (res.status === 401 || res.status === 403) {
        router.replace('/sign-in');
        return;
      }
      const message = data.error || 'Failed to load customers';
      setError(message);
      setToast({ message, type: 'error' });
    } catch (err) {
      console.error('Failed to load customers', err);
      const message = 'Failed to load customers';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [mapCustomerRows, router]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this customer? This action cannot be undone.');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const message = data.error || 'Failed to delete customer';
        setError(message);
        setToast({ message, type: 'error' });
        return;
      }
      setToast({ message: 'Customer deleted successfully', type: 'success' });
      await fetchCustomers();
    } catch (err) {
      console.error('Delete customer error', err);
      const message = 'Failed to delete customer';
      setError(message);
      setToast({ message, type: 'error' });
    }
  };

  const toastClassName = useMemo(() => {
    if (!toast) return '';
    if (toast.type === 'success') {
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
    }
    return 'border-rose-500/40 bg-rose-500/10 text-rose-200';
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">View Customers</h1>
          <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
            Review and manage CUSTOMER accounts.
          </p>
        </div>
      </div>

      {toast ? (
        <div className={`fixed right-6 top-20 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg ${toastClassName}`}>
          {toast.message}
        </div>
      ) : null}

      <UsersTable
        users={customers}
        loading={loading}
        error={error}
        onRefresh={fetchCustomers}
        title="Customers"
        emptyMessage="No customers found."
        onView={(id) => router.push(`/admin/users/${id}`)}
        onEdit={(id) => router.push(`/admin/users/${id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
