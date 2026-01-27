'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider'; // Import Auth to get current user data

type InputFieldProps = {
  label: string;
  value: string; // Added value prop
  placeholder: string;
  onChange: (value: string) => void;
};

type TextAreaFieldProps = {
  label: string;
  value: string; // Added value prop
  placeholder: string;
  onChange: (value: string) => void;
};

export default function ProfilePage() {
  const { user } = useAuth();
  
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

  // Load existing user data when page opens
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.contactNo || ''
        vehicleNumber: user.vehicleNumber || '',
        nic: user.nic || '',
        // Add other fields if they exist in your user object
      }));
    }
  }, [user]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving profile...", formData);
    // Add API call to update profile here
    alert("Profile updated successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">User Profile</h1>

      <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-700 p-8 space-y-10">

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime-400 to-emerald-400 flex items-center justify-center text-3xl font-bold text-slate-900">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-200">{formData.fullName || 'User Name'}</h2>
          <p className="text-sm text-slate-400">{formData.email}</p>
        </div>

        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              value={formData.fullName}
              placeholder="Enter full name"
              onChange={(v) => updateField("fullName", v)}
            />

            <InputField
              label="National Identity Card (NIC)"
              value={formData.nic}
              placeholder="Enter NIC number"
              onChange={(v) => updateField("nic", v)}
            />

            <InputField
              label="Email Address"
              value={formData.email}
              placeholder="Enter email address"
              onChange={(v) => updateField("email", v)}
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              placeholder="Enter phone number"
              onChange={(v) => updateField("phone", v)}
            />

            <TextAreaField
              label="Residential Address"
              value={formData.address}
              placeholder="Enter residential address"
              onChange={(v) => updateField("address", v)}
            />
          </div>
        </section>

        {/* Vehicle Details */}
        <section>
          <h3 className="text-lg font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">Vehicle Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Vehicle Registration Number"
              value={formData.vehicleNumber}
              placeholder="e.g. CAB-1234"
              onChange={(v) => updateField("vehicleNumber", v)}
            />

            <InputField
              label="Vehicle Type"
              value={formData.vehicleType}
              placeholder="Sedan, SUV, Motorcycle, etc."
              onChange={(v) => updateField("vehicleType", v)}
            />

            <InputField
              label="Vehicle Brand and Model"
              value={formData.vehicleModel}
              placeholder="Toyota Axio, Honda Vezel, etc."
              onChange={(v) => updateField("vehicleModel", v)}
            />

            <InputField
              label="Vehicle Color"
              value={formData.vehicleColor}
              placeholder="Enter vehicle color"
              onChange={(v) => updateField("vehicleColor", v)}
            />
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="
              px-8 py-3 
              bg-gradient-to-r from-lime-500 to-lime-400 
              text-slate-900 
              rounded-xl font-bold 
              hover:shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:scale-105 
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

function InputField({ label, value, placeholder, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        type="text"
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl px-4 py-3 
          bg-slate-800 border border-slate-700 
          text-slate-100 placeholder:text-slate-600
          focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500
          transition-colors
        "
      />
    </div>
  );
}

function TextAreaField({ label, value, placeholder, onChange }: TextAreaFieldProps) {
  return (
    <div className="md:col-span-2">
      <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl px-4 py-3 
          bg-slate-800 border border-slate-700 
          text-slate-100 placeholder:text-slate-600
          focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500
          transition-colors resize-none
        "
      />
    </div>
  );
}