/**
 * Admin API Service
 * 
 * This service connects the admin panel frontend to the admin_properties table.
 * It ensures that:
 * 1. Admin and frontend use the SAME table (admin_properties)
 * 2. Properties added from frontend appear in admin panel
 * 3. Data stored in database is correctly fetched and displayed
 * 4. No duplicate or separate tables
 * 
 * Database Mapping:
 * - Admin Property Table = admin_properties table
 * - Admin Parking Slots = admin_parking_slots table
 * - Admin Bookings = admin_bookings table
 */

const API_BASE_URL = '/api';

// Helper to get headers
const getHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
  };
};

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// ==========================================
// ADMIN PROPERTY API
// ==========================================
// Uses unified ParkingLocation table
// Fields: Property ID, Property Name, Location, Price per Hour, 
//         Parking Area Status, Total Parking Slots, Available Parking Slots,
//         Created Date, Last Updated Date

export interface AdminProperty {
  propertyId: string;
  propertyName: string;
  location: string;
  description?: string;
  pricePerHour: number;
  pricePerDay: number;
  parkingAreaStatus: 'ACTIVATED' | 'NOT_ACTIVATED';
  totalParkingSlots: number;
  availableParkingSlots: number;
  createdDate: string | Date;
  lastUpdatedDate: string | Date;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  slots?: AdminSlot[];
  slotBreakdown?: {
    normal: number;
    ev: number;
    carWash: number;
  };
}

export interface AdminSlot {
  id: string;
  slotNumber: string;
  zone: string;
  type: 'Normal' | 'EV Slot' | 'Car Washing';
  status: 'available' | 'occupied' | 'maintenance';
  pricePerHour: number;
}

export const adminPropertiesApi = {
  /**
   * Get all properties for admin panel
   * Uses unified ParkingLocation table
   */
  getAll: async (filters?: { status?: string; search?: string }): Promise<AdminProperty[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await apiRequest<{ success: boolean; properties: AdminProperty[]; total: number }>(
      `/admin/properties?${params}`
    );
    return response.properties || [];
  },

  /**
   * Get a single property by ID
   */
  getById: async (propertyId: string): Promise<AdminProperty | null> => {
    const properties = await adminPropertiesApi.getAll();
    return properties.find(p => p.propertyId === propertyId) || null;
  },

  /**
   * Create a new property
   * Data is saved to ParkingLocation table - visible on both admin and frontend
   */
  create: async (data: {
    propertyName: string;
    location: string;
    description?: string;
    pricePerHour?: number;
    pricePerDay?: number;
    parkingAreaStatus?: 'ACTIVATED' | 'NOT_ACTIVATED';
    slots?: Array<{ type: string; count: number }>;
  }): Promise<{ success: boolean; property: AdminProperty; message: string }> => {
    return apiRequest('/admin/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update property details
   */
  update: async (propertyId: string, data: {
    propertyName?: string;
    location?: string;
    description?: string;
    pricePerHour?: number;
    pricePerDay?: number;
    parkingAreaStatus?: 'ACTIVATED' | 'NOT_ACTIVATED';
  }): Promise<{ success: boolean; property: AdminProperty; message: string }> => {
    return apiRequest('/admin/properties', {
      method: 'PATCH',
      body: JSON.stringify({ propertyId, ...data }),
    });
  },

  /**
   * Toggle property activation status
   */
  toggleStatus: async (propertyId: string, newStatus: 'ACTIVATED' | 'NOT_ACTIVATED'): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/admin/properties', {
      method: 'PATCH',
      body: JSON.stringify({ propertyId, parkingAreaStatus: newStatus }),
    });
  },

  /**
   * Delete a property
   */
  delete: async (propertyId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/properties?propertyId=${propertyId}`, {
      method: 'DELETE',
    });
  },
};


// ==========================================
// ADMIN BOOKING DETAILS API
// ==========================================
// Uses unified Booking + BookingSlot + ParkingSlot + ParkingLocation tables
// Fields: Booking ID, Property ID, Property Name, Booking Date, Start Time,
//         End Time, Slot Number, User ID / Customer Name, Booking Status

export interface AdminBookingDetails {
  bookingId: string;
  bookingNumber: string;
  propertyId: string | null;
  propertyName: string;
  propertyAddress: string;
  bookingDate: string | Date;
  startTime: string | Date;
  endTime: string | Date;
  slotNumber: string;
  slotZone: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleNumber?: string;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  duration: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  allSlots: Array<{
    id: string;
    number: string;
    zone: string;
    type: string;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BookingsGroupedByProperty {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  bookings: AdminBookingDetails[];
  totalBookings: number;
  totalRevenue: number;
}

export const adminBookingsApi = {
  /**
   * Get all bookings with optional filters
   * Admin can: View all bookings, Filter by property, Search by date/time
   */
  getAll: async (filters?: {
    propertyId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    search?: string;
  }): Promise<AdminBookingDetails[]> => {
    const params = new URLSearchParams();
    if (filters?.propertyId && filters.propertyId !== 'all') params.append('propertyId', filters.propertyId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.startTime) params.append('startTime', filters.startTime);
    if (filters?.endTime) params.append('endTime', filters.endTime);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await apiRequest<{ success: boolean; bookings: AdminBookingDetails[]; total: number }>(
      `/admin/bookings?${params}`
    );
    return response.bookings || [];
  },

  /**
   * Get bookings grouped by property
   * Shows bookings organized by property for easier management
   */
  getGroupedByProperty: async (filters?: {
    date?: string;
    status?: string;
  }): Promise<BookingsGroupedByProperty[]> => {
    const params = new URLSearchParams();
    params.append('groupByProperty', 'true');
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await apiRequest<{ success: boolean; groupedByProperty: BookingsGroupedByProperty[]; total: number }>(
      `/admin/bookings?${params}`
    );
    return response.groupedByProperty || [];
  },

  /**
   * Get a single booking by ID
   */
  getById: async (bookingId: string): Promise<AdminBookingDetails | null> => {
    const bookings = await adminBookingsApi.getAll();
    return bookings.find(b => b.bookingId === bookingId) || null;
  },

  /**
   * Update booking status
   */
  updateStatus: async (bookingId: string, status: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/admin/bookings', {
      method: 'PATCH',
      body: JSON.stringify({ bookingId, status }),
    });
  },

  /**
   * Get available slots for a property based on existing bookings
   * Frontend should show only available slots based on this
   */
  getAvailableSlots: async (propertyId: string, date: string, startTime: string, endTime: string): Promise<AdminSlot[]> => {
    // Get property with all slots
    const property = await adminPropertiesApi.getById(propertyId);
    if (!property || !property.slots) return [];

    // Get bookings for the date
    const bookings = await adminBookingsApi.getAll({ propertyId, date });
    
    // Filter slots that are not booked during the time range
    const bookedSlotIds = new Set<string>();
    bookings.forEach(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      const requestStart = new Date(`${date}T${startTime}`);
      const requestEnd = new Date(`${date}T${endTime}`);
      
      // Check for time overlap
      if (requestStart < bookingEnd && requestEnd > bookingStart) {
        booking.allSlots.forEach(slot => bookedSlotIds.add(slot.id));
      }
    });

    return property.slots.filter(slot => 
      slot.status === 'available' && !bookedSlotIds.has(slot.id)
    );
  },
};


// ==========================================
// ADMIN DASHBOARD STATS API
// ==========================================
// Aggregates data from unified tables for admin dashboard

export interface AdminDashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalSlots: number;
  availableSlots: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCustomers: number;
  propertyOccupancy: Array<{
    propertyId: string;
    propertyName: string;
    totalSlots: number;
    availableSlots: number;
    occupancyRate: number;
  }>;
}

export const adminStatsApi = {
  /**
   * Get dashboard statistics
   */
  getDashboard: async (): Promise<AdminDashboardStats> => {
    try {
      // Fetch properties and bookings from unified tables
      const [properties, bookings] = await Promise.all([
        adminPropertiesApi.getAll(),
        adminBookingsApi.getAll(),
      ]);

      const today = new Date().toISOString().split('T')[0];

      const stats: AdminDashboardStats = {
        totalProperties: properties.length,
        activeProperties: properties.filter(p => p.parkingAreaStatus === 'ACTIVATED').length,
        totalSlots: properties.reduce((sum, p) => sum + p.totalParkingSlots, 0),
        availableSlots: properties.reduce((sum, p) => sum + p.availableParkingSlots, 0),
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.bookingStatus === 'PENDING').length,
        completedBookings: bookings.filter(b => b.bookingStatus === 'COMPLETED').length,
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
        todayRevenue: bookings
          .filter(b => new Date(b.bookingDate).toISOString().split('T')[0] === today)
          .reduce((sum, b) => sum + b.totalAmount, 0),
        totalCustomers: new Set(bookings.map(b => b.userId)).size,
        propertyOccupancy: properties.map(p => ({
          propertyId: p.propertyId,
          propertyName: p.propertyName,
          totalSlots: p.totalParkingSlots,
          availableSlots: p.availableParkingSlots,
          occupancyRate: p.totalParkingSlots > 0 
            ? Math.round(((p.totalParkingSlots - p.availableParkingSlots) / p.totalParkingSlots) * 100)
            : 0,
        })),
      };

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalProperties: 0,
        activeProperties: 0,
        totalSlots: 0,
        availableSlots: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        totalCustomers: 0,
        propertyOccupancy: [],
      };
    }
  },
};


// ==========================================
// EXPORT ALL ADMIN APIs
// ==========================================

export default {
  properties: adminPropertiesApi,
  bookings: adminBookingsApi,
  stats: adminStatsApi,
};
