'use client';

import { createPortal } from 'react-dom';
import { Mail, Phone, MapPin, User, Car, CreditCard, X } from 'lucide-react';
import { ReactNode } from 'react';
import { AdminCustomerProfile } from '../../services/api';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  customer: AdminCustomerProfile | null;
}

const valueOrDash = (value: string | null | undefined) => {
  const normalized = typeof value === 'string' ? value.trim() : value;
  return normalized ? normalized : '—';
};

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  loading,
  error,
  customer,
}: CustomerDetailsModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[10000] w-full max-w-3xl rounded-2xl border border-slate-200/60 bg-white shadow-2xl dark:border-slate-800/60 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Customer Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View customer profile linked to the selected booking.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200/60 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {loading && (
            <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-300">
              Loading customer profile...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {!loading && !error && customer && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={<User className="h-4 w-4" />} label="Full Name" value={valueOrDash(customer.fullName)} />
                <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={valueOrDash(customer.email)} />
                <InfoCard icon={<CreditCard className="h-4 w-4" />} label="NIC" value={valueOrDash(customer.nic)} />
                <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value={valueOrDash(customer.phone)} />
                <InfoCard icon={<MapPin className="h-4 w-4" />} label="Address" value={valueOrDash(customer.address)} />
                <InfoCard icon={<User className="h-4 w-4" />} label="Role" value={valueOrDash(customer.role)} />
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Car className="h-4 w-4" />
                  Vehicle Information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <VehicleField label="Reg Number" value={valueOrDash(customer.vehicle.registrationNumber)} />
                  <VehicleField label="Type" value={valueOrDash(customer.vehicle.type)} />
                  <VehicleField label="Model" value={valueOrDash(customer.vehicle.model)} />
                  <VehicleField label="Color" value={valueOrDash(customer.vehicle.color)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">{value}</p>
    </div>
  );
}

function VehicleField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/60 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-900/50">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
