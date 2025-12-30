'use client';

import { useState, useEffect } from 'react';

interface ParkingSlot {
  id: string;
  row: string;
  col: number;
  type: 'normal' | 'ev' | 'carwash' | 'disabled';
  isOccupied: boolean;
}

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: BookingData) => void;
  selectedSlot?: ParkingSlot | null;
}

export interface BookingData {
  id: string;
  driverName: string;
  vehicleNumber: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  parkingSpot: string;
  entryTime: string;
  expectedExitTime: string;
  vehicleType: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  amount?: number;
}

export default function BookingForm({ isOpen, onClose, onSubmit, selectedSlot }: BookingFormProps) {
  const [formData, setFormData] = useState({
    driverName: '',
    vehicleNumber: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    parkingSpot: '',
    entryTime: '',
    expectedExitTime: '',
    vehicleType: 'Car',
    paymentMethod: 'Cash',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update parking spot when selectedSlot changes or form opens
  useEffect(() => {
    if (isOpen) {
      if (selectedSlot) {
        setFormData(prev => ({ ...prev, parkingSpot: selectedSlot.id }));
      } else {
        setFormData(prev => ({ ...prev, parkingSpot: '' }));
      }
    }
  }, [selectedSlot, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.parkingSpot.trim()) newErrors.parkingSpot = 'Parking spot is required';
    if (!formData.entryTime) newErrors.entryTime = 'Entry time is required';
    if (!formData.expectedExitTime) newErrors.expectedExitTime = 'Expected exit time is required';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Calculate amount based on duration (default $5 per hour, minimum $5)
    const entryTime = new Date(formData.entryTime);
    const exitTime = new Date(formData.expectedExitTime);
    const durationHours = Math.max(1, Math.ceil((exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60)));
    const amount = durationHours * 5;

    const booking: BookingData = {
      id: Date.now().toString(),
      ...formData,
      amount,
      createdAt: new Date().toISOString(),
    };

    onSubmit(booking);
    
    // Reset form
    setFormData({
      driverName: '',
      vehicleNumber: '',
      idNumber: '',
      phoneNumber: '',
      email: '',
      parkingSpot: '',
      entryTime: '',
      expectedExitTime: '',
      vehicleType: 'Car',
      paymentMethod: 'Cash',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#84CC16] to-[#BEF264] bg-clip-text text-transparent">New Booking</h2>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#E5E7EB] text-2xl transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Driver Name */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Driver Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.driverName ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                  placeholder="Enter driver name"
                />
                {errors.driverName && (
                  <p className="text-red-400 text-xs mt-1">{errors.driverName}</p>
                )}
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Vehicle Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.vehicleNumber ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                  placeholder="ABC-1234"
                />
                {errors.vehicleNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.vehicleNumber}</p>
                )}
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  ID Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.idNumber ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                  placeholder="Enter ID number"
                />
                {errors.idNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.idNumber}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.phoneNumber ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                  placeholder="+1234567890"
                />
                {errors.phoneNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.email ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                  placeholder="driver@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Parking Spot */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Parking Spot <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="parkingSpot"
                  value={formData.parkingSpot}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.parkingSpot ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                  placeholder="A-12"
                />
                {errors.parkingSpot && (
                  <p className="text-red-400 text-xs mt-1">{errors.parkingSpot}</p>
                )}
              </div>

              {/* Entry Time */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Entry Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="entryTime"
                  value={formData.entryTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.entryTime ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                />
                {errors.entryTime && (
                  <p className="text-red-400 text-xs mt-1">{errors.entryTime}</p>
                )}
              </div>

              {/* Expected Exit Time */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Expected Exit Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="expectedExitTime"
                  value={formData.expectedExitTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16] ${
                    errors.expectedExitTime ? 'border-red-500' : 'border-slate-700/50'
                  }`}
                />
                {errors.expectedExitTime && (
                  <p className="text-red-400 text-xs mt-1">{errors.expectedExitTime}</p>
                )}
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
                >
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Mobile Payment">Mobile Payment</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[#94A3B8] mb-2 text-sm font-medium">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#84CC16]"
                placeholder="Additional notes or special instructions..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-700/50 text-[#E5E7EB] rounded-lg font-semibold hover:bg-slate-700 transition-all border border-slate-600/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#84CC16] to-[#BEF264] text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-lime-500/50 transition-all"
              >
                Create Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



