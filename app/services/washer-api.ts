import { WasherBooking, BookingStatus, DashboardStats } from '@/lib/washer-types';
import { ApiResponse } from '@/lib/types';

const API_BASE_URL = '/api';

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

interface WasherApiConfig {
  headers?: HeadersInit;
}

const defaultConfig: WasherApiConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper to make API requests with fallback
async function washerApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  config: WasherApiConfig = defaultConfig
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultConfig.headers,
        ...config.headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API endpoint not available');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    // Re-throw to let caller handle with demo data
    throw error;
  }
}

export const washerApi = {
  // Get all bookings for washer (or specific date)
  getBookings: async (date?: string, status?: BookingStatus) => {
    let endpoint = '/bookings?role=washer';
    if (date) endpoint += `&date=${date}`;
    if (status) endpoint += `&status=${status}`;
    
    const response = await washerApiRequest<ApiResponse<WasherBooking[]>>(endpoint);
    return response.data || [];
  },

  // Get single booking details
  getBookingById: async (bookingId: string) => {
    const response = await washerApiRequest<ApiResponse<WasherBooking>>(
      `/bookings/${bookingId}?role=washer`
    );
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, newStatus: BookingStatus, notes?: string) => {
    const response = await washerApiRequest<ApiResponse<WasherBooking>>(
      `/bookings/${bookingId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          washerNotes: notes,
          washerAction: true,
        }),
      }
    );
    return response.data;
  },

  // Accept a booking
  acceptBooking: async (bookingId: string) => {
    return washerApi.updateBookingStatus(bookingId, 'ACCEPTED');
  },

  // Complete a booking
  completeBooking: async (bookingId: string, notes?: string) => {
    return washerApi.updateBookingStatus(bookingId, 'COMPLETED', notes);
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string) => {
    return washerApi.updateBookingStatus(bookingId, 'CANCELLED', reason);
  },

  // Request reschedule
  requestReschedule: async (bookingId: string, reason: string) => {
    const response = await washerApiRequest<ApiResponse<WasherBooking>>(
      `/bookings/${bookingId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          rescheduleRequested: true,
          rescheduleReason: reason,
        }),
      }
    );
    return response.data;
  },

  // Bulk update bookings
  bulkUpdateBookings: async (bookingIds: string[], action: 'accept' | 'complete') => {
    const status = action === 'accept' ? 'ACCEPTED' : 'COMPLETED';
    const response = await washerApiRequest<ApiResponse<{ updatedCount: number }>>(
      '/bookings/bulk-update',
      {
        method: 'PATCH',
        body: JSON.stringify({
          bookingIds,
          status,
        }),
      }
    );
    return response.data;
  },

  // Get dashboard stats for today
  getDashboardStats: async (date?: string) => {
    let endpoint = '/bookings/washer/stats';
    if (date) endpoint += `?date=${date}`;
    
    const response = await washerApiRequest<ApiResponse<DashboardStats>>(endpoint);
    return response.data || {
      totalBookings: 0,
      pendingBookings: 0,
      acceptedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
    };
  },

  // Get customer details
  getCustomerDetails: async (customerId: string) => {
    const response = await washerApiRequest<ApiResponse<any>>(
      `/users/${customerId}`
    );
    return response.data;
  },
};
