// Washer-specific types and interfaces

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface WasherBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleNumber: string;
  vehicleType: 'Sedan' | 'SUV' | 'Hatchback' | 'Truck' | 'Van' | 'Other';
  slotTime: string; // Format: "HH:MM AM/PM"
  slotDate: string; // Format: "YYYY-MM-DD"
  serviceType: string; // e.g., "Car Wash", "Full Detail", "Quick Wash"
  duration: number; // in minutes
  status: BookingStatus;
  location: string;
  notes?: string;
  createdAt: string;
  rescheduleRequested?: boolean;
  rescheduleReason?: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface NotificationAlert {
  id: string;
  type: 'new_booking' | 'urgent_reminder' | 'upcoming_slot';
  message: string;
  timestamp: string;
  read: boolean;
  bookingId?: string;
}

export interface BookingFilters {
  searchQuery: string;
  statusFilter: BookingStatus | 'ALL';
  dateFilter?: string; // YYYY-MM-DD format
  timeRange?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  sortBy: 'earliest' | 'latest' | 'vehicle_type' | 'status';
}
