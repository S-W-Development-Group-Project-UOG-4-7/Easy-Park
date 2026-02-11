export type CounterViewKey = 'dashboard' | 'parking' | 'reports' | 'analytics';

export type CounterSlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export type CounterSlotType = 'NORMAL' | 'EV' | 'CAR_WASH';

export type CounterBookingStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface CounterParkingArea {
  id: string;
  name: string;
  address: string;
  pricePerHour: number;
  pricePerDay: number;
}

export interface CounterSlot {
  id: string;
  slotNumber: string;
  type: CounterSlotType;
  status: CounterSlotStatus;
  isAvailable: boolean;
}

export interface CounterBooking {
  bookingId: string;
  bookingNumber: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  vehicleNumber: string;
  vehicleType: string | null;
  slotNumber: string;
  status: CounterBookingStatus;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  paidAmount: number;
  onlinePaid: number;
  cashPaid: number;
  balanceDue: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  allSlots: Array<{
    id: string;
    number: string;
    zone: string;
    type: CounterSlotType;
  }>;
  latestCounterAction?: {
    action: string;
    note: string | null;
    createdAt: string;
    counterName: string;
  } | null;
}

export interface CounterStats {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  maintenanceSlots: number;
  activeBookings: number;
  todayRevenue: number;
}
