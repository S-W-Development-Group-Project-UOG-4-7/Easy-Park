import { useState } from 'react';
import { Building2, MapPin, Plus, X } from 'lucide-react';
import { propertiesApi } from '../services/api';

interface ParkingSlot {
  type: 'EV' | 'Normal' | 'Car Washing';
  count: number;
}

export default function AddPropertiesPage() {
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    parkingSlots: [] as ParkingSlot[],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const parkingTypes: ParkingSlot['type'][] = ['EV', 'Normal', 'Car Washing'];

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await propertiesApi.create(formData);
      setSuccess(true);
      setFormData({
        propertyName: '',
        address: '',
        parkingSlots: [],
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-[#E5E7EB] text-[#111827]">Add Properties</h1>
        <p className="mt-2 text-sm dark:text-[#94A3B8] text-[#6B7280]">
          Add new parking properties to the system
        </p>
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
                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                placeholder="Enter property name"
                className="w-full rounded-lg border bg-linear-to-b pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400"
              />
            </div>
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
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter property address"
                className="w-full rounded-lg border bg-linear-to-b pl-10 pr-4 py-2.5 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827] placeholder-slate-400"
              />
            </div>
          </div>

          {/* Parking Slots */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-sm font-medium dark:text-[#E5E7EB] text-[#111827]">
                Parking Slots
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
              <p className="text-sm dark:text-[#94A3B8] text-[#6B7280]">
                No parking slots added. Click "Add Slot Type" to add slots.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.parkingSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 rounded-lg border p-4 dark:border-slate-800/60 dark:bg-slate-900/30 border-slate-200/60 bg-slate-50/50"
                  >
                    <select
                      value={slot.type}
                      onChange={(e) => handleSlotChange(index, 'type', e.target.value as ParkingSlot['type'])}
                      className="flex-1 rounded-lg border bg-linear-to-b px-3 py-2 text-sm transition-colors dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-[#E5E7EB] border-slate-200/60 from-white to-[#F3F4F6] text-[#111827]"
                    >
                      {parkingTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === 'EV' ? 'EV Slot' : type}
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

        {/* Submit Button */}
        <div className="flex justify-end">
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
            Property added successfully!
          </div>
        )}
      </form>
    </div>
  );
}

