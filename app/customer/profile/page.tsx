'use client';

import { useState } from 'react';

type InputFieldProps = {
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
};

type TextAreaFieldProps = {
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    nic: '',
    email: '',
    phone: '',
    address: '',
    vehicleNumber: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleColor: ''
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving profile...", formData);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-100">User Profile</h1>

      <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-700 p-8 space-y-10">

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime-400 to-emerald-400 flex items-center justify-center text-3xl font-bold text-slate-900">
            --
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-200">User Name</h2>
          <p className="text-sm text-slate-400">Registered Vehicle Owner</p>
        </div>

        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              placeholder="Enter full name"
              onChange={(v) => updateField("fullName", v)}
            />

            <InputField
              label="National Identity Card (NIC)"
              placeholder="Enter NIC number"
              onChange={(v) => updateField("nic", v)}
            />

            <InputField
              label="Email Address"
              placeholder="Enter email address"
              onChange={(v) => updateField("email", v)}
            />

            <InputField
              label="Phone Number"
              placeholder="Enter phone number"
              onChange={(v) => updateField("phone", v)}
            />

            <TextAreaField
              label="Residential Address"
              placeholder="Enter residential address"
              onChange={(v) => updateField("address", v)}
            />
          </div>
        </section>

        {/* Vehicle Details */}
        <section>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Vehicle Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Vehicle Registration Number"
              placeholder="Enter vehicle registration number"
              onChange={(v) => updateField("vehicleNumber", v)}
            />

            <InputField
              label="Vehicle Type"
              placeholder="Sedan, SUV, Motorcycle, etc."
              onChange={(v) => updateField("vehicleType", v)}
            />

            <InputField
              label="Vehicle Brand and Model"
              placeholder="Toyota Axio, Honda Vezel, etc."
              onChange={(v) => updateField("vehicleModel", v)}
            />

            <InputField
              label="Vehicle Color"
              placeholder="Enter vehicle color"
              onChange={(v) => updateField("vehicleColor", v)}
            />
          </div>
        </section>

        {/* Save Button — EXACT Pay Now Styling */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="
              px-6 py-2.5 
              bg-gradient-to-r from-lime-500 to-lime-400 
              text-slate-900 
              rounded-lg font-semibold 
              hover:shadow-lg hover:scale-105 
              transition-all duration-300
            "
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

function InputField({ label, placeholder, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-slate-400">
        {label}
      </label>
      <input
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-lg px-4 py-2 
          bg-slate-800 border border-slate-600 
          text-slate-100 placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-lime-500
        "
      />
    </div>
  );
}

function TextAreaField({ label, placeholder, onChange }: TextAreaFieldProps) {
  return (
    <div className="md:col-span-2">
      <label className="block mb-1 text-sm font-medium text-slate-400">
        {label}
      </label>
      <textarea
        rows={3}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-lg px-4 py-2 
          bg-slate-800 border border-slate-600 
          text-slate-100 placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-lime-500
        "
      />
    </div>
  );
}
