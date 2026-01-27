// Use relative URL for Next.js API routes
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
    credentials: 'include', // Include cookies for authentication
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// Properties API (using parking-lots endpoint)
export const propertiesApi = {
  getAll: async (showAll: boolean = true) => {
    const response = await apiRequest<{ parkingLots: any[] }>(`/parking-lots?showAll=${showAll}`);
    return response.parkingLots || [];
  },

  getActivated: async () => {
    const response = await apiRequest<{ parkingLots: any[] }>('/parking-lots?showAll=false');
    return response.parkingLots || [];
  },

  getById: (id: string | number) => apiRequest<any>(`/parking-lots/${id}`),

  create: async (data: { 
    propertyName: string; 
    address: string; 
    parkingSlots?: any[];
    pricePerHour?: number;
    pricePerDay?: number;
    status?: 'ACTIVATED' | 'NOT_ACTIVATED';
  }) => {
    // Get current user to use as owner
    const userResponse = await fetch('/api/auth/me', { credentials: 'include' });
    const userData = await userResponse.json();
    const ownerId = userData.data?.id || userData.id;
    
    if (!ownerId) {
      throw new Error('User not authenticated');
    }
    
    return apiRequest<{ parkingLot: any }>('/parking-lots', {
      method: 'POST',
      body: JSON.stringify({
        name: data.propertyName,
        address: data.address,
        ownerId: ownerId,
        slots: data.parkingSlots,
        pricePerHour: data.pricePerHour,
        pricePerDay: data.pricePerDay,
        status: data.status,
      }),
    });
  },

  update: (id: string | number, data: { 
    name?: string; 
    address?: string; 
    description?: string;
    status?: 'ACTIVATED' | 'NOT_ACTIVATED';
    pricePerHour?: number;
    pricePerDay?: number;
    totalSlots?: number;
  }) =>
    apiRequest<{ message: string; parkingLot: any }>('/parking-lots', {
      method: 'PATCH',
      body: JSON.stringify({ id: String(id), ...data }),
    }),

  toggleStatus: (id: string | number, status: 'ACTIVATED' | 'NOT_ACTIVATED') =>
    apiRequest<{ message: string; parkingLot: any }>('/parking-lots', {
      method: 'PATCH',
      body: JSON.stringify({ id: String(id), status }),
    }),

  updatePrices: (id: string | number, pricePerHour: number, pricePerDay?: number) =>
    apiRequest<{ message: string; parkingLot: any }>('/parking-lots', {
      method: 'PATCH',
      body: JSON.stringify({ id: String(id), pricePerHour, pricePerDay }),
    }),

  delete: (id: string | number) =>
    apiRequest<{ message: string }>(`/parking-lots/${id}`, {
      method: 'DELETE',
    }),
};

// Bookings API
export const bookingsApi = {
  getAll: async (filters?: { propertyId?: string; date?: string; time?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.propertyId && filters.propertyId !== 'all') params.append('propertyId', filters.propertyId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.time) params.append('time', filters.time);
    if (filters?.status) params.append('status', filters.status);
    params.append('all', 'true'); // Get all bookings for admin
    
    try {
      const response = await apiRequest<{ success: boolean; data: any[] }>(`/bookings?${params}`);
      const bookings = response.data || [];
      
      // Transform bookings to match the expected format in ViewBookingDetailsPage
      return bookings.map((booking: any) => ({
        id: booking.id,
        customerId: booking.user?.id || booking.customerId || 'N/A',
        name: booking.user?.name || booking.name || 'Unknown',
        address: booking.user?.address || booking.address || 'N/A',
        propertyName: booking.slot?.parkingLot?.name || booking.slots?.[0]?.location || booking.propertyName || 'Unknown',
        propertyId: booking.slot?.parkingLot?.id || booking.slots?.[0]?.slot?.locationId || booking.propertyId || '',
        parkingSlot: booking.slot?.slotNumber || booking.slots?.[0]?.number || booking.parkingSlot || 'N/A',
        parkingSlotId: booking.slots?.[0]?.id || booking.parkingSlotId || '',
        date: booking.date || '',
        time: booking.startTime || booking.time || '',
        parkingType: booking.slot?.type || booking.parkingType || 'Normal',
        hoursSelected: parseInt(booking.duration) || booking.hoursSelected || 1,
        checkOutTime: booking.endTime || booking.checkOutTime || '',
        paymentAmount: booking.totalAmount || booking.paymentAmount || 0,
        paymentMethod: booking.payment?.method || booking.paymentMethod || 'Cash',
        extras: booking.extras || '',
        status: booking.status || 'pending',
        vehicleNumber: booking.vehicleNumber || 'N/A',
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  getById: async (id: string) => {
    const response = await apiRequest<{ success: boolean; data: any }>(`/bookings/${id}`);
    return response.data;
  },

  create: (data: any) =>
    apiRequest<{ id: string; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { bookingStatus?: string; paymentStatus?: string; checkOutTime?: string }) =>
    apiRequest<{ message: string }>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    }),
};

// Stats API - uses available endpoints to calculate stats
export const statsApi = {
  getDashboard: async () => {
    try {
      // Fetch data from available endpoints
      const [parkingLotsRes, bookingsRes] = await Promise.all([
        fetch('/api/parking-lots', { credentials: 'include' }).then(r => r.json()).catch(() => ({ parkingLots: [] })),
        fetch('/api/bookings?all=true', { credentials: 'include' }).then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      
      const parkingLots = parkingLotsRes.parkingLots || [];
      const bookings = bookingsRes.data || [];
      
      // Calculate stats
      const totalSlots = parkingLots.reduce((sum: number, lot: any) => sum + (lot.totalSlots || 0), 0);
      const availableSlots = parkingLots.reduce((sum: number, lot: any) => sum + (lot.availableSlots || 0), 0);
      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
      const totalCustomers = new Set(bookings.map((b: any) => b.userId)).size;
      
      return {
        totalRevenue,
        availableSlots,
        totalCustomers,
        todayBookings: bookings.filter((b: any) => {
          const today = new Date().toISOString().split('T')[0];
          return b.createdAt?.startsWith(today);
        }).length,
        monthlyRevenue: [],
        parkingTypes: [],
        propertyOccupancy: parkingLots.map((lot: any) => ({
          name: lot.name,
          totalSlots: lot.totalSlots || 0,
          occupiedSlots: (lot.totalSlots || 0) - (lot.availableSlots || 0),
          occupancyRate: lot.totalSlots ? Math.round(((lot.totalSlots - lot.availableSlots) / lot.totalSlots) * 100) : 0,
        })),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return {
        totalRevenue: 0,
        availableSlots: 0,
        totalCustomers: 0,
        todayBookings: 0,
        monthlyRevenue: [],
        parkingTypes: [],
        propertyOccupancy: [],
      };
    }
  },
};

// Customers API
export const customersApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    return apiRequest<{ customers: any[]; total: number; page: number; limit: number }>(
      `/customers?${searchParams}`
    );
  },

  getById: (id: string) => apiRequest<any>(`/customers/${id}`),

  create: (data: { name: string; email?: string; phone?: string; address?: string }) =>
    apiRequest<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; email?: string; phone?: string; address?: string }) =>
    apiRequest<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// Slots API
export const slotsApi = {
  getAll: (filters?: { propertyId?: string; status?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    return apiRequest<any[]>(`/slots?${params}`);
  },

  update: (id: string, data: { status?: string; hourlyRate?: number }) =>
    apiRequest<{ message: string }>(`/slots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  create: (data: { propertyId: string; slotNumber: string; type: string; hourlyRate?: number }) =>
    apiRequest<{ id: string; message: string }>('/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/slots/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  properties: propertiesApi,
  bookings: bookingsApi,
  stats: statsApi,
  customers: customersApi,
  slots: slotsApi,
};
