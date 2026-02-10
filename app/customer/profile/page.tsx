'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider'; // Import Auth to get current user data

type InputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

type TextAreaFieldProps = {
  label: string;
  value: string;
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
        phone: user.contactNo || '',
        vehicleNumber: user.vehicleNumber || '',
        nic: user.nic || '',
      }));
    }
  }, [user]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        fullName: formData.fullName,
        email: formData.email,
        contactNo: formData.phone,
        vehicleNumber: formData.vehicleNumber,
        nic: formData.nic,
      };

      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { success: false, error: await response.text() };

      if (response.ok && data.success) {
        alert("Profile updated successfully!");
      } else {
        const msg =
          data.error ||
          data.message ||
          (response.status === 401 ? 'Please sign in again.' : 'Unknown error');
        alert("Failed to update profile: " + msg);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">User Profile</h1>

      <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-700 p-8 space-y-10">

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-lime-400 to-emerald-400 flex items-center justify-center text-3xl font-bold text-slate-900">
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
              placeholder="Enter NIC"
              onChange={(v) => updateField("nic", v)}
            />

            <InputField
              label="Email Address"
              value={formData.email}
              placeholder="Enter email"
              onChange={(v) => updateField("email", v)}
            />

            <InputField
              label="Phone Number"
              value={formData.phone}
              placeholder="Enter phone number"
              onChange={(v) => updateField("phone", v)}
            />

            <InputField
              label="Residential Address"
              value={formData.address}
              placeholder="Enter residential address"
              onChange={(v) => updateField("address", v)}
            />
          </div>
        </section>

        {/* Vehicle Information */}
        <section>
          <h3 className="text-lg font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">Vehicle Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Vehicle Registration Number"
              value={formData.vehicleNumber}
              placeholder="Enter vehicle registration number"
              onChange={(v) => updateField("vehicleNumber", v)}
            />

            <InputField
              label="Vehicle Type"
              value={formData.vehicleType}
              placeholder="Enter vehicle type (e.g., Car, SUV)"
              onChange={(v) => updateField("vehicleType", v)}
            />

            <InputField
              label="Vehicle Model"
              value={formData.vehicleModel}
              placeholder="Enter vehicle model"
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
        <div className="flex gap-4 justify-end pt-6 border-t border-slate-700">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 text-slate-900 font-semibold hover:shadow-lg hover:shadow-lime-500/50 transition-all duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, placeholder, onChange }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all"
      />
    </div>
  );
}

function TextAreaField({ label, value, placeholder, onChange }: TextAreaFieldProps) {
  return (
    <div className="space-y-2 col-span-1 md:col-span-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all resize-none h-24"
      />
    </div>
  );
}
