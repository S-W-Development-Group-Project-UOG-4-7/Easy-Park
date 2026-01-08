import { useState } from 'react';
import { Car, Zap, Droplets, X } from 'lucide-react';

interface ParkingSlot {
  id: string;
  number: string;
  type: 'Normal' | 'Car Washing' | 'EV Slot';
  isBooked: boolean;
  bookingId?: string;
  customerName?: string;
  customerId?: string;
}

interface ParkingSlotVisualizationProps {
  slots: ParkingSlot[];
  propertyName: string;
}

export default function ParkingSlotVisualization({ slots, propertyName }: ParkingSlotVisualizationProps) {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showModal, setShowModal] = useState(false);

  const bookedSlots = slots.filter(s => s.isBooked).length;
  const availableSlots = slots.length - bookedSlots;

  const getSlotColor = (slot: ParkingSlot) => {
    if (slot.isBooked) {
      return 'bg-red-500 hover:bg-red-600 border-red-600';
    }
    
    switch (slot.type) {
      case 'Normal':
        return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
      case 'Car Washing':
        return 'bg-purple-500 hover:bg-purple-600 border-purple-600';
      case 'EV Slot':
        return 'bg-green-500 hover:bg-green-600 border-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600 border-gray-600';
    }
  };

  const getSlotIcon = (type: ParkingSlot['type']) => {
    switch (type) {
      case 'Normal':
        return <Car className="h-4 w-4" />;
      case 'Car Washing':
        return <Droplets className="h-4 w-4" />;
      case 'EV Slot':
        return <Zap className="h-4 w-4" />;
    }
  };

  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    if (slot.isBooked) {
      setShowModal(true);
    }
  };

  // Group slots by type for better visualization
  const normalSlots = slots.filter(s => s.type === 'Normal');
  const carWashSlots = slots.filter(s => s.type === 'Car Washing');
  const evSlots = slots.filter(s => s.type === 'EV Slot');

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-linear-to-br p-4 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
          <p className="text-xs font-medium dark:text-slate-400 text-slate-600">Total Slots</p>
          <p className="mt-1 text-2xl font-bold dark:text-slate-100 text-slate-900">{slots.length}</p>
        </div>
        <div className="rounded-lg border bg-linear-to-br p-4 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
          <p className="text-xs font-medium dark:text-slate-400 text-slate-600">Booked</p>
          <p className="mt-1 text-2xl font-bold text-red-500">{bookedSlots}</p>
        </div>
        <div className="rounded-lg border bg-linear-to-br p-4 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
          <p className="text-xs font-medium dark:text-slate-400 text-slate-600">Available</p>
          <p className="mt-1 text-2xl font-bold text-green-500">{availableSlots}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-linear-to-br p-4 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded border bg-blue-500 border-blue-600" />
          <span className="text-sm dark:text-slate-300 text-slate-700">Normal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded border bg-purple-500 border-purple-600" />
          <span className="text-sm dark:text-slate-300 text-slate-700">Car Washing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded border bg-green-500 border-green-600" />
          <span className="text-sm dark:text-slate-300 text-slate-700">EV Slot</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded border bg-red-500 border-red-600" />
          <span className="text-sm dark:text-slate-300 text-slate-700">Booked</span>
        </div>
      </div>

      {/* Parking Slots Grid */}
      <div className="space-y-6">
        {/* Normal Slots */}
        {normalSlots.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold dark:text-slate-200 text-slate-800">Normal Slots</h3>
            <div className="grid grid-cols-8 gap-2 md:grid-cols-10 lg:grid-cols-12">
              {normalSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className={`flex h-12 items-center justify-center rounded-lg border text-xs font-medium text-white transition-all hover:scale-105 ${getSlotColor(slot)}`}
                  title={slot.isBooked ? `Booked by ${slot.customerName}` : `Available - ${slot.number}`}
                >
                  {getSlotIcon(slot.type)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Car Washing Slots */}
        {carWashSlots.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold dark:text-slate-200 text-slate-800">Car Washing Slots</h3>
            <div className="grid grid-cols-8 gap-2 md:grid-cols-10 lg:grid-cols-12">
              {carWashSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className={`flex h-12 items-center justify-center rounded-lg border text-xs font-medium text-white transition-all hover:scale-105 ${getSlotColor(slot)}`}
                  title={slot.isBooked ? `Booked by ${slot.customerName}` : `Available - ${slot.number}`}
                >
                  {getSlotIcon(slot.type)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EV Slots */}
        {evSlots.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold dark:text-slate-200 text-slate-800">EV Slots</h3>
            <div className="grid grid-cols-8 gap-2 md:grid-cols-10 lg:grid-cols-12">
              {evSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className={`flex h-12 items-center justify-center rounded-lg border text-xs font-medium text-white transition-all hover:scale-105 ${getSlotColor(slot)}`}
                  title={slot.isBooked ? `Booked by ${slot.customerName}` : `Available - ${slot.number}`}
                >
                  {getSlotIcon(slot.type)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Booking Details */}
      {showModal && selectedSlot && selectedSlot.isBooked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-linear-to-br p-6 dark:border-slate-800/60 dark:from-[#1E293B] dark:to-[#0F172A] border-slate-200/60 from-white to-[#F3F4F6]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold dark:text-slate-100 text-slate-900">Slot Booking Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5 dark:text-slate-300 text-slate-700" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium dark:text-slate-400 text-slate-600">Slot Number</p>
                <p className="text-base dark:text-slate-100 text-slate-900">{selectedSlot.number}</p>
              </div>
              <div>
                <p className="text-sm font-medium dark:text-slate-400 text-slate-600">Slot Type</p>
                <p className="text-base dark:text-slate-100 text-slate-900">{selectedSlot.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium dark:text-slate-400 text-slate-600">Customer Name</p>
                <p className="text-base dark:text-slate-100 text-slate-900">{selectedSlot.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium dark:text-slate-400 text-slate-600">Customer ID</p>
                <p className="text-base dark:text-slate-100 text-slate-900">{selectedSlot.customerId || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-lg bg-linear-to-r from-lime-500 to-lime-400 dark:from-lime-400 dark:to-lime-300 px-4 py-2 font-medium text-slate-950 dark:text-slate-900 transition-all hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
