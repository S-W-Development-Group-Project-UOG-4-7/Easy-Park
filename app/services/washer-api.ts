import { WasherBooking, BookingStatus, DashboardStats, NotificationAlert } from '@/lib/washer-types';

// API Base URL
const API_BASE = '/api/washer';

// Helper to get auth headers (token from localStorage/cookies)
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Generic API fetch helper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

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

// Environment flag to use demo data vs real API
const USE_DEMO_DATA = process.env.NEXT_PUBLIC_USE_DEMO_DATA === 'true';

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

// Transform API booking to frontend WasherBooking format
function transformBooking(apiBooking: any): WasherBooking {
  const slotDateTime = new Date(apiBooking.slotTime);
  return {
    id: apiBooking.id,
    customerId: apiBooking.customerId,
    customerName: apiBooking.customer?.name || 'Unknown',
    customerEmail: apiBooking.customer?.email,
    customerPhone: apiBooking.customer?.phone,
    vehicleNumber: apiBooking.vehicle,
    vehicleType: 'Other', // Could be derived from vehicleDetails
    slotTime: slotDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    slotDate: slotDateTime.toISOString().split('T')[0],
    serviceType: apiBooking.serviceType,
    duration: 60, // Default, could be based on serviceType
    status: apiBooking.status as BookingStatus,
    location: 'Main Location', // Could be added to model
    notes: apiBooking.notes || '',
    createdAt: apiBooking.createdAt,
  };
}

export const washerApi = {
  // ==========================================
  // BOOKINGS API
  // ==========================================

  /**
   * Get all bookings for washer
   * Supports filtering by date, status, search query, and sorting
   */
  getBookings: async (
    date?: string,
    status?: BookingStatus | 'ALL',
    search?: string,
    sortBy?: 'earliest' | 'latest' | 'vehicle' | 'status'
  ): Promise<WasherBooking[]> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...demoBookingsState];
      if (date) filtered = filtered.filter(b => b.slotDate === date);
      if (status && status !== 'ALL') filtered = filtered.filter(b => b.status === status);
      return filtered;
    }

    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);

    const result = await apiFetch<any[]>(`/bookings?${params.toString()}`);
    if (result.success && result.data) {
      return result.data.map(transformBooking);
    }
    return [];
  },

  /**
   * Get single booking details
   */
  getBookingById: async (bookingId: string): Promise<WasherBooking | undefined> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return demoBookingsState.find(b => b.id === bookingId);
    }

    const result = await apiFetch<any>(`/bookings/${bookingId}`);
    if (result.success && result.data) {
      return transformBooking(result.data);
    }
    return undefined;
  },

  /**
   * Accept a booking (PENDING → ACCEPTED)
   */
  acceptBooking: async (bookingId: string): Promise<WasherBooking | undefined> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = demoBookingsState.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        demoBookingsState[index] = { ...demoBookingsState[index], status: 'ACCEPTED' };
        return demoBookingsState[index];
      }
      return undefined;
    }

    const result = await apiFetch<any>(`/bookings/${bookingId}/accept`, { method: 'PATCH' });
    if (result.success && result.data) {
      return transformBooking(result.data);
    }
    return undefined;
  },

  /**
   * Complete a booking (ACCEPTED → COMPLETED)
   */
  completeBooking: async (bookingId: string, notes?: string): Promise<WasherBooking | undefined> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = demoBookingsState.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        demoBookingsState[index] = {
          ...demoBookingsState[index],
          status: 'COMPLETED',
          notes: notes || demoBookingsState[index].notes,
        };
        return demoBookingsState[index];
      }
      return undefined;
    }

    const result = await apiFetch<any>(`/bookings/${bookingId}/confirm`, { method: 'PATCH' });
    if (result.success && result.data) {
      return transformBooking(result.data);
    }
    return undefined;
  },

  /**
   * Cancel a booking (Any → CANCELLED)
   */
  cancelBooking: async (bookingId: string, reason?: string): Promise<WasherBooking | undefined> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = demoBookingsState.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        demoBookingsState[index] = {
          ...demoBookingsState[index],
          status: 'CANCELLED',
          notes: reason || demoBookingsState[index].notes,
        };
        return demoBookingsState[index];
      }
      return undefined;
    }

    const result = await apiFetch<any>(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
    if (result.success && result.data) {
      return transformBooking(result.data);
    }
    return undefined;
  },

  /**
   * Reschedule a booking to a new time
   */
  rescheduleBooking: async (bookingId: string, newSlotTime: string): Promise<WasherBooking | undefined> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = demoBookingsState.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        const newDate = new Date(newSlotTime);
        demoBookingsState[index] = {
          ...demoBookingsState[index],
          slotTime: newDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          slotDate: newDate.toISOString().split('T')[0],
          rescheduleRequested: false,
        };
        return demoBookingsState[index];
      }
      return undefined;
    }

    const result = await apiFetch<any>(`/bookings/${bookingId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ slotTime: newSlotTime }),
    });
    if (result.success && result.data) {
      return transformBooking(result.data);
    }
    return undefined;
  },

  /**
   * Request reschedule (mark booking for reschedule)
   */
  requestReschedule: async (bookingId: string, reason: string): Promise<WasherBooking | undefined> => {
    if (USE_DEMO_DATA) {
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
    }

    // For now, store reschedule request locally
    // In production, this would be a separate API endpoint
    return washerApi.getBookingById(bookingId);
  },

  /**
   * Bulk update bookings (accept, confirm, or cancel multiple)
   */
  bulkUpdateBookings: async (
    bookingIds: string[],
    action: 'accept' | 'confirm' | 'cancel'
  ): Promise<{ success: Array<{ id: string; status: string }>; failed: Array<{ id: string; reason: string }> }> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newStatus: BookingStatus = action === 'accept' ? 'ACCEPTED' : action === 'confirm' ? 'COMPLETED' : 'CANCELLED';
      const success: Array<{ id: string; status: string }> = [];
      const failed: Array<{ id: string; reason: string }> = [];

      bookingIds.forEach(id => {
        const index = demoBookingsState.findIndex(b => b.id === id);
        if (index !== -1) {
          demoBookingsState[index] = { ...demoBookingsState[index], status: newStatus };
          success.push({ id, status: newStatus });
        } else {
          failed.push({ id, reason: 'Booking not found' });
        }
      });

      return { success, failed };
    }

    const result = await apiFetch<{
      success: Array<{ id: string; status: string }>;
      failed: Array<{ id: string; reason: string }>;
    }>('/bookings/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids: bookingIds, action }),
    });

    if (result.success && result.data) {
      return result.data;
    }
    return { success: [], failed: bookingIds.map(id => ({ id, reason: 'API error' })) };
  },

  // ==========================================
  // DASHBOARD STATS API
  // ==========================================

  /**
   * Get dashboard stats for today or a specific date
   */
  getDashboardStats: async (date?: string): Promise<{
    today: DashboardStats;
    allTime: DashboardStats & { total: number };
    upcomingBookings: any[];
    totalCustomers: number;
  }> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const filtered = date
        ? demoBookingsState.filter(b => b.slotDate === date)
        : demoBookingsState;

      return {
        today: calculateStats(filtered),
        allTime: { ...calculateStats(demoBookingsState), total: demoBookingsState.length },
        upcomingBookings: demoBookingsState.slice(0, 3),
        totalCustomers: 5,
      };
    }

    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const result = await apiFetch<any>(`/stats?${params.toString()}`);
    if (result.success && result.data) {
      return {
        today: {
          totalBookings: result.data.today.totalBookingsToday,
          pendingBookings: result.data.today.pendingBookings,
          acceptedBookings: result.data.today.acceptedBookings,
          completedBookings: result.data.today.completedBookings,
          cancelledBookings: result.data.today.cancelledBookings,
        },
        allTime: result.data.allTime,
        upcomingBookings: result.data.upcomingBookings,
        totalCustomers: result.data.totalCustomers,
      };
    }

    return {
      today: { totalBookings: 0, pendingBookings: 0, acceptedBookings: 0, completedBookings: 0, cancelledBookings: 0 },
      allTime: { total: 0, pending: 0, accepted: 0, completed: 0, cancelled: 0, totalBookings: 0, pendingBookings: 0, acceptedBookings: 0, completedBookings: 0, cancelledBookings: 0 },
      upcomingBookings: [],
      totalCustomers: 0,
    };
  },

  // ==========================================
  // CUSTOMERS API
  // ==========================================

  /**
   * Get all customers with optional search
   */
  getCustomers: async (search?: string): Promise<any[]> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const customers = demoBookingsState.map(b => ({
        id: b.customerId,
        name: b.customerName,
        email: b.customerEmail,
        phone: b.customerPhone,
        vehicleDetails: b.vehicleNumber,
      }));
      // Remove duplicates
      return customers.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
    }

    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const result = await apiFetch<any[]>(`/customers?${params.toString()}`);
    return result.success && result.data ? result.data : [];
  },

  /**
   * Get customer details by ID
   */
  getCustomerDetails: async (customerId: string): Promise<any> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const booking = demoBookingsState.find(b => b.customerId === customerId);
      if (booking) {
        return {
          id: booking.customerId,
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          vehicleDetails: booking.vehicleNumber,
          bookings: demoBookingsState.filter(b => b.customerId === customerId),
        };
      }
      return null;
    }

    const result = await apiFetch<any>(`/customers/${customerId}`);
    return result.success ? result.data : null;
  },

  /**
   * Create a new customer
   */
  createCustomer: async (customerData: {
    name: string;
    email: string;
    phone: string;
    vehicleDetails: string;
    otherRelevantInfo?: string;
  }): Promise<any> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: `customer-${Date.now()}`, ...customerData };
    }

    const result = await apiFetch<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
    return result.success ? result.data : null;
  },

  /**
   * Update customer details
   */
  updateCustomer: async (customerId: string, customerData: Partial<{
    name: string;
    email: string;
    phone: string;
    vehicleDetails: string;
    otherRelevantInfo?: string;
  }>): Promise<any> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: customerId, ...customerData };
    }

    const result = await apiFetch<any>(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(customerData),
    });
    return result.success ? result.data : null;
  },

  // ==========================================
  // NOTIFICATIONS API
  // ==========================================

  /**
   * Get all notifications
   */
  getNotifications: async (unreadOnly?: boolean): Promise<{ notifications: NotificationAlert[]; unreadCount: number }> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        notifications: [
          {
            id: 'notif-1',
            type: 'new_booking',
            message: 'New booking from John Doe for Full Car Wash',
            timestamp: new Date().toISOString(),
            read: false,
            bookingId: 'booking-001',
          },
          {
            id: 'notif-2',
            type: 'upcoming_slot',
            message: 'Upcoming slot in 30 minutes: Jane Smith - Premium Detailing',
            timestamp: new Date().toISOString(),
            read: true,
            bookingId: 'booking-002',
          },
        ],
        unreadCount: 1,
      };
    }

    const params = new URLSearchParams();
    if (unreadOnly) params.append('unreadOnly', 'true');

    const result = await apiFetch<any>(`/notifications?${params.toString()}`);
    if (result.success && result.data) {
      return {
        notifications: result.data.notifications.map((n: any) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          timestamp: n.createdAt,
          read: n.read,
          bookingId: n.bookingId,
        })),
        unreadCount: result.data.unreadCount,
      };
    }
    return { notifications: [], unreadCount: 0 };
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId: string): Promise<boolean> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }

    const result = await apiFetch<any>(`/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
    return result.success;
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async (): Promise<boolean> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }

    const result = await apiFetch<any>('/notifications', { method: 'PATCH' });
    return result.success;
  },

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * Reset demo data (for testing)
   */
  resetDemoData: () => {
    demoBookingsState = [...DEMO_BOOKINGS];
  },

  /**
   * Create a new booking
   */
  createBooking: async (bookingData: {
    customerId: string;
    slotTime: string;
    vehicle: string;
    serviceType: string;
    notes?: string;
  }): Promise<WasherBooking | null> => {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newBooking: WasherBooking = {
        id: `booking-${Date.now()}`,
        customerId: bookingData.customerId,
        customerName: 'New Customer',
        vehicleNumber: bookingData.vehicle,
        vehicleType: 'Other',
        slotTime: new Date(bookingData.slotTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        slotDate: new Date(bookingData.slotTime).toISOString().split('T')[0],
        serviceType: bookingData.serviceType,
        duration: 60,
        status: 'PENDING',
        location: 'Main Location',
        notes: bookingData.notes || '',
        createdAt: new Date().toISOString(),
      };
      demoBookingsState.push(newBooking);
      return newBooking;
    }

    const result = await apiFetch<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });

    if (result.success && result.data) {
      return transformBooking(result.data);
    }
    return null;
  },
};
