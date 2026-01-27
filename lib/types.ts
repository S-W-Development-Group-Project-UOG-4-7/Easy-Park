// Common types used across the application

export interface User {
  id: string;
  email: string;
  fullName: string;
  contactNo?: string;
  vehicleNumber?: string;
  nic?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'COUNTER' | 'LAND_OWNER' | 'WASHER';
  createdAt: string;
}

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  description?: string;
  totalSlots: number;
  availableSlots?: number;
  slots?: ParkingSlot[];
}

export interface ParkingSlot {
  id: string;
  number: string;
  type: 'NORMAL' | 'EV' | 'CAR_WASH';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  pricePerHour: number;
  locationId: string;
  location?: ParkingLocation;
  isAvailable?: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  slots: BookingSlot[];
  payment?: Payment;
  createdAt: string;
}

export interface BookingSlot {
  id: string;
  bookingId: string;
  slotId: string;
  slot?: ParkingSlot;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'CARD' | 'CASH' | 'ONLINE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  contactNo?: string;
  vehicleNumber?: string;
  nic?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Booking request types
export interface CreateBookingRequest {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  slotIds: string[];
}

// Payment request types
export interface ProcessPaymentRequest {
  bookingId: string;
  amount: number;
  method?: 'CARD' | 'CASH' | 'ONLINE';
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  };
}
