import { WasherBooking, BookingStatus, DashboardStats } from '@/lib/washer-types';

// Demo data for development/fallback
const DEMO_BOOKINGS: WasherBooking[] = [
  {
    id: 'booking-001',
    customerId: 'customer-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+94 77 123 4567',
    vehicleNumber: 'AB-1234',
    vehicleType: 'Sedan',
    slotTime: '09:00 AM',
    slotDate: new Date().toISOString().split('T')[0],
    serviceType: 'Full Car Wash',
    duration: 60,
    status: 'PENDING',
    location: 'Colombo 07',
    notes: 'Please clean the interior thoroughly',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-002',
    customerId: 'customer-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+94 77 234 5678',
    vehicleNumber: 'CD-5678',
    vehicleType: 'SUV',
    slotTime: '10:30 AM',
    slotDate: new Date().toISOString().split('T')[0],
    serviceType: 'Premium Detailing',
    duration: 90,
    status: 'ACCEPTED',
    location: 'Colombo 03',
    notes: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-003',
    customerId: 'customer-003',
    customerName: 'Robert Johnson',
    customerEmail: 'robert@example.com',
    customerPhone: '+94 77 345 6789',
    vehicleNumber: 'EF-9012',
    vehicleType: 'Hatchback',
    slotTime: '12:00 PM',
    slotDate: new Date().toISOString().split('T')[0],
    serviceType: 'Quick Wash',
    duration: 30,
    status: 'COMPLETED',
    location: 'Malabe',
    notes: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-004',
    customerId: 'customer-004',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah@example.com',
    customerPhone: '+94 77 456 7890',
    vehicleNumber: 'GH-3456',
    vehicleType: 'Truck',
    slotTime: '02:00 PM',
    slotDate: new Date().toISOString().split('T')[0],
    serviceType: 'Truck Wash',
    duration: 120,
    status: 'PENDING',
    location: 'Kelaniya',
    notes: 'Heavy mud - needs extra cleaning',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-005',
    customerId: 'customer-005',
    customerName: 'Michael Brown',
    customerEmail: 'michael@example.com',
    customerPhone: '+94 77 567 8901',
    vehicleNumber: 'IJ-7890',
    vehicleType: 'Van',
    slotTime: '03:30 PM',
    slotDate: new Date().toISOString().split('T')[0],
    serviceType: 'Full Car Wash',
    duration: 60,
    status: 'PENDING',
    location: 'Negombo',
    notes: '',
    createdAt: new Date().toISOString(),
  },
];

// In-memory state for demo mode
let demoBookingsState = [...DEMO_BOOKINGS];

// Helper to calculate stats from bookings
function calculateStats(bookings: WasherBooking[]): DashboardStats {
  return {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
    acceptedBookings: bookings.filter(b => b.status === 'ACCEPTED').length,
    completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
  };
}

export const washerApi = {
  // Get all bookings for washer (using demo data)
  getBookings: async (date?: string, status?: BookingStatus): Promise<WasherBooking[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...demoBookingsState];
    
    if (date) {
      filtered = filtered.filter(b => b.slotDate === date);
    }
    if (status) {
      filtered = filtered.filter(b => b.status === status);
    }
    
    return filtered;
  },

  // Get single booking details
  getBookingById: async (bookingId: string): Promise<WasherBooking | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return demoBookingsState.find(b => b.id === bookingId);
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, newStatus: BookingStatus, notes?: string): Promise<WasherBooking | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = demoBookingsState.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      demoBookingsState[index] = {
        ...demoBookingsState[index],
        status: newStatus,
        notes: notes || demoBookingsState[index].notes,
      };
      return demoBookingsState[index];
    }
    return undefined;
  },

  // Accept a booking
  acceptBooking: async (bookingId: string): Promise<WasherBooking | undefined> => {
    return washerApi.updateBookingStatus(bookingId, 'ACCEPTED');
  },

  // Complete a booking
  completeBooking: async (bookingId: string, notes?: string): Promise<WasherBooking | undefined> => {
    return washerApi.updateBookingStatus(bookingId, 'COMPLETED', notes);
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string): Promise<WasherBooking | undefined> => {
    return washerApi.updateBookingStatus(bookingId, 'CANCELLED', reason);
  },

  // Request reschedule
  requestReschedule: async (bookingId: string, reason: string): Promise<WasherBooking | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = demoBookingsState.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      demoBookingsState[index] = {
        ...demoBookingsState[index],
        rescheduleRequested: true,
        rescheduleReason: reason,
      };
      return demoBookingsState[index];
    }
    return undefined;
  },

  // Bulk update bookings
  bulkUpdateBookings: async (bookingIds: string[], action: 'accept' | 'complete'): Promise<{ updatedCount: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newStatus: BookingStatus = action === 'accept' ? 'ACCEPTED' : 'COMPLETED';
    let updatedCount = 0;
    
    bookingIds.forEach(id => {
      const index = demoBookingsState.findIndex(b => b.id === id);
      if (index !== -1) {
        demoBookingsState[index] = {
          ...demoBookingsState[index],
          status: newStatus,
        };
        updatedCount++;
      }
    });
    
    return { updatedCount };
  },

  // Get dashboard stats for today
  getDashboardStats: async (date?: string): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let filtered = demoBookingsState;
    if (date) {
      filtered = demoBookingsState.filter(b => b.slotDate === date);
    }
    
    return calculateStats(filtered);
  },

  // Get customer details
  getCustomerDetails: async (customerId: string): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const booking = demoBookingsState.find(b => b.customerId === customerId);
    if (booking) {
      return {
        id: booking.customerId,
        fullName: booking.customerName,
        email: booking.customerEmail,
        contactNo: booking.customerPhone,
        vehicleNumber: booking.vehicleNumber,
      };
    }
    return null;
  },

  // Reset demo data
  resetDemoData: () => {
    demoBookingsState = [...DEMO_BOOKINGS];
  },
};
