'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Plus, X, Car, Zap, Droplets, ArrowLeft, Trash2, RefreshCw, DollarSign, Power, AlertCircle } from 'lucide-react';
import { propertiesApi } from '../../services/api';

interface Property {
  id: number;
  name: string;
  address: string;
  totalSlots: number;
  normalSlots: number;
  evSlots: number;
  carWashSlots: number;
  pricePerHour: number;
  pricePerDay: number;
  status: 'ACTIVATED' | 'NOT_ACTIVATED';
}

interface ParkingSlot {
  type: 'EV' | 'Normal' | 'Car Washing';
  count: number;
}

interface ValidationErrors {
  propertyName?: string;
  address?: string;
  pricePerHour?: string;
  pricePerDay?: string;
  parkingSlots?: string;
}

export default function AddPropertiesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    parkingSlots: [] as ParkingSlot[],
    pricePerHour: 300,
    pricePerDay: 2000,
    status: 'NOT_ACTIVATED' as 'ACTIVATED' | 'NOT_ACTIVATED',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const parkingTypes: ParkingSlot['type'][] = ['Normal', 'EV', 'Car Washing'];

  // Fetch existing properties
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const data = await propertiesApi.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Delete property
  const handleDeleteProperty = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await propertiesApi.delete(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Quick add presets
  const handleQuickAdd = (type: ParkingSlot['type'], count: number) => {
    const existingIndex = formData.parkingSlots.findIndex(s => s.type === type);
    if (existingIndex >= 0) {
      const updatedSlots = [...formData.parkingSlots];
      updatedSlots[existingIndex].count += count;
      setFormData({ ...formData, parkingSlots: updatedSlots });
    } else {
      setFormData({
        ...formData,
        parkingSlots: [...formData.parkingSlots, { type, count }],
      });
    }
  };

  const handleAddSlot = () => {
    setFormData({
      ...formData,
      parkingSlots: [...formData.parkingSlots, { type: 'Normal', count: 1 }],
    });
  };

  const handleRemoveSlot = (index: number) => {
    setFormData({
      ...formData,
      parkingSlots: formData.parkingSlots.filter((_, i) => i !== index),
    });
  };

  const handleSlotChange = (index: number, field: keyof ParkingSlot, value: string | number) => {
    const updatedSlots = [...formData.parkingSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setFormData({ ...formData, parkingSlots: updatedSlots });
    // Clear slot error when user makes changes
    if (errors.parkingSlots) {
      setErrors({ ...errors, parkingSlots: undefined });
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.propertyName.trim()) {
      newErrors.propertyName = 'Property name is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address/Location is required';
    }
    
    const totalSlots = formData.parkingSlots.reduce((sum, slot) => sum + slot.count, 0);
    if (totalSlots <= 0) {
      newErrors.parkingSlots = 'Total parking slots must be greater than 0';
    }
    
    if (formData.pricePerHour <= 0) {
      newErrors.pricePerHour = 'Price per hour must be greater than 0';
    }
    
    if (formData.pricePerDay <= 0) {
      newErrors.pricePerDay = 'Price per day must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submitting
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSuccess(false);

    try {
      await propertiesApi.create({
        propertyName: formData.propertyName,
        address: formData.address,
        parkingSlots: formData.parkingSlots,
        pricePerHour: formData.pricePerHour,
        pricePerDay: formData.pricePerDay,
        status: formData.status,
      });
      setSuccess(true);
      setFormData({
        propertyName: '',
        address: '',
        parkingSlots: [],
        pricePerHour: 300,
        pricePerDay: 2000,
        status: 'NOT_ACTIVATED',
      });
      setErrors({});
      // Refresh the properties list
      fetchProperties();
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalNormal = formData.parkingSlots.filter(s => s.type === 'Normal').reduce((sum, s) => sum + s.count, 0);
  const totalEV = formData.parkingSlots.filter(s => s.type === 'EV').reduce((sum, s) => sum + s.count, 0);
  const totalCarWash = formData.parkingSlots.filter(s => s.type === 'Car Washing').reduce((sum, s) => sum + s.count, 0);
  const totalSlots = totalNormal + totalEV + totalCarWash;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/properties')}
          className="p-2 rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">Add Properties</h1>
          <p className="mt-1 text-sm dark:text-[#94A3B8] text-[#6B7280]">
            Add new parking properties to the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
          {/* Property Name */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
              Property Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
              <input
                type="text"
                required
                value={formData.propertyName}
                onChange={(e) => {
                  setFormData({ ...formData, propertyName: e.target.value });
                  if (errors.propertyName) setErrors({ ...errors, propertyName: undefined });
                }}
                placeholder="Enter property name"
                className={`w-full rounded-lg border bg-linear-to-b pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.propertyName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.propertyName && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.propertyName}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
              Location / Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: undefined });
                }}
                placeholder="Enter property address"
                className={`w-full rounded-lg border bg-linear-to-b pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.address ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.address}
              </p>
            )}
          </div>

          {/* Pricing Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Price Per Hour (LKR)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pricePerHour}
                  onChange={(e) => {
                    setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) || 0 });
                    if (errors.pricePerHour) setErrors({ ...errors, pricePerHour: undefined });
                  }}
                  placeholder="300"
                  className={`w-full rounded-lg border bg-linear-to-b pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.pricePerHour ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.pricePerHour && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.pricePerHour}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Price Per Day (LKR)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-[#94A3B8] text-[#6B7280]" />
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pricePerDay}
                  onChange={(e) => {
                    setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 });
                    if (errors.pricePerDay) setErrors({ ...errors, pricePerDay: undefined });
                  }}
                  placeholder="2000"
                  className={`w-full rounded-lg border bg-linear-to-b pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400 ${errors.pricePerDay ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.pricePerDay && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.pricePerDay}
                </p>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
              Parking Area Status
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'ACTIVATED' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                  formData.status === 'ACTIVATED'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-green-500/50'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>Activated</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'NOT_ACTIVATED' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                  formData.status === 'NOT_ACTIVATED'
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-red-500/50'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>Not Activated</span>
              </button>
            </div>
            <p className="mt-2 text-xs dark:text-[#94A3B8] text-[#6B7280]">
              Only activated parking areas are visible to customers and washers for bookings.
            </p>
          </div>

          {/* Quick Add Presets */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
              Quick Add Slots
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleQuickAdd('Normal', 10)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Car className="w-5 h-5" />
                <span className="text-sm font-medium">+10 Normal</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('EV', 6)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
              >
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">+6 EV</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('Car Washing', 4)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <Droplets className="w-5 h-5" />
                <span className="text-sm font-medium">+4 Car Wash</span>
              </button>
            </div>
          </div>

          {/* Parking Slots */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Parking Slots Configuration
              </label>
              <button
                type="button"
                onClick={handleAddSlot}
                className="flex items-center space-x-2 rounded-lg bg-linear-to-r from-[#84CC16] to-[#BEF264] px-3 py-1.5 text-sm font-medium text-slate-950 transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Add Slot Type</span>
              </button>
            </div>

            {formData.parkingSlots.length === 0 ? (
              <div>
                <p className="text-sm dark:text-[#94A3B8] text-[#6B7280]">
                  No parking slots added. Use quick add or click "Add Slot Type" to add slots.
                </p>
                {errors.parkingSlots && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.parkingSlots}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {formData.parkingSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 rounded-lg border p-4 dark:border-slate-800/60 dark:bg-slate-900/30 border-slate-200/60 bg-slate-50/50"
                  >
                    <div className={`p-2 rounded-lg ${
                      slot.type === 'Normal' ? 'bg-blue-500/20 text-blue-400' :
                      slot.type === 'EV' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {slot.type === 'Normal' ? <Car className="w-5 h-5" /> :
                       slot.type === 'EV' ? <Zap className="w-5 h-5" /> :
                       <Droplets className="w-5 h-5" />}
                    </div>
                    <select
                      value={slot.type}
                      onChange={(e) => handleSlotChange(index, 'type', e.target.value as ParkingSlot['type'])}
                      className="flex-1 rounded-lg border bg-linear-to-b px-3 py-2 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827]"
                    >
                      {parkingTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === 'EV' ? 'EV Charging' : type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={slot.count}
                      onChange={(e) => handleSlotChange(index, 'count', parseInt(e.target.value) || 1)}
                      placeholder="Count"
                      className="w-24 rounded-lg border bg-linear-to-b px-3 py-2 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      className="rounded-lg border p-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-slate-800/60 dark:text-[#E5E7EB] border-slate-200/60 text-[#111827]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slots Preview Summary */}
        {totalSlots > 0 && (
          <div className="rounded-xl border bg-slate-950/50 p-6 dark:border-slate-800/60 border-slate-200/60">
            <h3 className="text-lg font-semibold mb-4 dark:text-[#E5E7EB] text-[#111827]">Slots Preview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Normal Slots Preview */}
              {totalNormal > 0 && (
                <div className="p-4 rounded-lg border dark:border-slate-800 border-slate-200 bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-400" />
                      <span className="font-medium dark:text-[#E5E7EB] text-[#111827]">Normal Parking</span>
                    </div>
                    <span className="text-sm text-blue-400">{totalNormal} slots</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: Math.min(totalNormal, 20) }).map((_, i) => {
                      const row = String.fromCharCode(65 + Math.floor(i / 9));
                      const col = (i % 9) + 1;
                      return (
                        <div
                          key={i}
                          className="w-8 h-7 rounded border border-slate-600 bg-slate-800/50 text-xs flex items-center justify-center text-slate-300"
                        >
                          {row}{col}
                        </div>
                      );
                    })}
                    {totalNormal > 20 && (
                      <div className="w-8 h-7 flex items-center justify-center text-xs text-slate-400">
                        +{totalNormal - 20}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Car Wash Preview */}
              {totalCarWash > 0 && (
                <div className="p-4 rounded-lg border dark:border-slate-800 border-slate-200 bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium dark:text-[#E5E7EB] text-[#111827]">Car Wash</span>
                    </div>
                    <span className="text-sm text-cyan-400">{totalCarWash} slots</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: totalCarWash }).map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-7 rounded border border-slate-600 bg-slate-800/50 text-xs flex items-center justify-center text-slate-300"
                      >
                        CW{i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EV Preview */}
              {totalEV > 0 && (
                <div className="p-4 rounded-lg border dark:border-slate-800 border-slate-200 bg-slate-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <span className="font-medium dark:text-[#E5E7EB] text-[#111827]">EV Charging</span>
                    </div>
                    <span className="text-sm text-orange-400">{totalEV} slots</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(totalEV / 2) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-11 h-7 rounded border border-slate-600 bg-slate-800/50 text-xs flex items-center justify-center text-slate-300"
                        >
                          EVK{i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.floor(totalEV / 2) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-11 h-7 rounded border border-slate-600 bg-slate-800/50 text-xs flex items-center justify-center text-slate-300"
                        >
                          EVL{i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm dark:text-[#94A3B8] text-[#6B7280]">
            Total: <span className="font-semibold text-[#84CC16]">{totalSlots}</span> parking slots
          </div>
          <button
            type="submit"
            disabled={loading || formData.parkingSlots.length === 0}
            className="rounded-lg bg-linear-to-r from-[#84CC16] to-[#BEF264] px-6 py-3 font-medium text-slate-950 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Property'}
          </button>
        </div>

        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-600 dark:text-green-400">
            Property added successfully! Redirecting...
          </div>
        )}
      </form>

      {/* Existing Properties List with Delete */}
      <div className="mt-8 rounded-xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-[#E5E7EB] text-[#111827]">
            Existing Properties
          </h2>
          <button
            onClick={fetchProperties}
            disabled={loadingProperties}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-slate-700 border-slate-200 dark:text-[#E5E7EB] text-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingProperties ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {loadingProperties ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#84CC16]"></div>
          </div>
        ) : properties.length === 0 ? (
          <p className="text-center py-8 dark:text-[#94A3B8] text-[#6B7280]">
            No properties found. Add your first property above.
          </p>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-4 rounded-lg border dark:border-slate-800/60 dark:bg-slate-900/30 border-slate-200/60 bg-slate-50/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-[#84CC16]/20 text-[#84CC16]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-[#E5E7EB] text-[#111827]">
                      {property.name}
                    </h3>
                    <p className="text-sm dark:text-[#94A3B8] text-[#6B7280]">
                      {property.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    {property.normalSlots > 0 && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <Car className="w-4 h-4" />
                        {property.normalSlots}
                      </span>
                    )}
                    {property.evSlots > 0 && (
                      <span className="flex items-center gap-1 text-orange-400">
                        <Zap className="w-4 h-4" />
                        {property.evSlots}
                      </span>
                    )}
                    {property.carWashSlots > 0 && (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Droplets className="w-4 h-4" />
                        {property.carWashSlots}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteProperty(property.id, property.name)}
                    disabled={deletingId === property.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deletingId === property.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span className="text-sm">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
