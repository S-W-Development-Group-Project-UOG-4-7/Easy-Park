'use client';

import { useState } from 'react';

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  type?: string;
};

type TextAreaFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
};

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    nic: '123456789V',
    email: 'john.doe@example.com',
    phone: '+94771234567',
    address: '123 Main Street, Colombo 05',
    vehicleNumber: 'ABC-1234',
    vehicleType: 'SUV',
    vehicleModel: 'Toyota RAV4',
    vehicleColor: 'Silver',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(formData);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setOriginalData(formData);
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log('Saving profile...', formData);
    // Add your save logic here
    setIsEditing(false);
    alert('Profile saved successfully!');
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  return (
    <div className="relative z-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-50">User Profile</h1>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-lime-400/70 hover:text-lime-100"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="surface-card relative overflow-hidden rounded-3xl p-8 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.08),transparent_32%)]" />

        <div className="relative space-y-8">
          {/* User Avatar and Name */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 via-lime-500 to-lime-200 text-4xl font-bold text-slate-950 shadow-neon-lime">
              {formData.fullName.charAt(0) || 'U'}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-50">
                {formData.fullName || 'User Name'}
              </h2>
              <p className="text-sm text-slate-400">Registered Vehicle Owner</p>
            </div>
          </div>

          {/* Personal Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Full Name"
                placeholder="Enter full name"
                value={formData.fullName}
                editable={isEditing}
                onChange={(v) => updateField('fullName', v)}
              />
              <InputField
                label="National Identity Card (NIC)"
                placeholder="Enter NIC number"
                value={formData.nic}
                editable={isEditing}
                onChange={(v) => updateField('nic', v)}
              />
              <InputField
                label="Email Address"
                placeholder="Enter email address"
                value={formData.email}
                type="email"
                editable={isEditing}
                onChange={(v) => updateField('email', v)}
              />
              <InputField
                label="Phone Number"
                placeholder="Enter phone number"
                value={formData.phone}
                type="tel"
                editable={isEditing}
                onChange={(v) => updateField('phone', v)}
              />
              <TextAreaField
                label="Residential Address"
                placeholder="Enter residential address"
                value={formData.address}
                editable={isEditing}
                onChange={(v) => updateField('address', v)}
              />
            </div>
          </section>

          <div className="divider-faint" />

          {/* Vehicle Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Vehicle Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Vehicle Registration Number"
                placeholder="Enter vehicle registration number"
                value={formData.vehicleNumber}
                editable={isEditing}
                onChange={(v) => updateField('vehicleNumber', v)}
              />
              <InputField
                label="Vehicle Type"
                placeholder="Sedan, SUV, Motorcycle, etc."
                value={formData.vehicleType}
                editable={isEditing}
                onChange={(v) => updateField('vehicleType', v)}
              />
              <InputField
                label="Vehicle Brand and Model"
                placeholder="Toyota Axio, Honda Vezel, etc."
                value={formData.vehicleModel}
                editable={isEditing}
                onChange={(v) => updateField('vehicleModel', v)}
              />
              <InputField
                label="Vehicle Color"
                placeholder="Enter vehicle color"
                value={formData.vehicleColor}
                editable={isEditing}
                onChange={(v) => updateField('vehicleColor', v)}
              />
            </div>
          </section>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/70 hover:text-red-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 px-6 py-3 text-sm font-semibold text-slate-900 transition duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-lime-500/30"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

function InputField({
  label,
  placeholder,
  value,
  onChange,
  editable = false,
  type = 'text',
}: InputFieldProps) {
  const disabled = !editable;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        type={type}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition ${
          disabled
            ? 'cursor-default border-slate-800/70 bg-slate-900/40 text-slate-400'
            : 'border-slate-700/70 bg-slate-900/70 focus:border-lime-400/80 focus:ring-2 focus:ring-lime-400/50'
        }`}
      />
    </div>
  );
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  editable = false,
}: TextAreaFieldProps) {
  const disabled = !editable;

  return (
    <div className="md:col-span-2 space-y-1">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <textarea
        rows={3}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition ${
          disabled
            ? 'cursor-default border-slate-800/70 bg-slate-900/40 text-slate-400'
            : 'border-slate-700/70 bg-slate-900/70 focus:border-lime-400/80 focus:ring-2 focus:ring-lime-400/50'
        }`}
      />
    </div>
  );
}
