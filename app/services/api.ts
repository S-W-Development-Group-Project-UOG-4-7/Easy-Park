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
    cache: 'no-store',
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

export type PropertySlotType = 'Normal' | 'EV' | 'Car Washing';

export interface PropertySlot {
  id: string | number;
  number: string;
  slotNumber?: string;
  type: PropertySlotType;
  status: string;
}

export interface PropertySummary {
  id: string | number;
  name: string;
  address: string;
  description?: string;
  totalSlots: number;
  availableSlots: number;
  normalSlots: number;
  evSlots: number;
  carWashSlots: number;
  pricePerHour: number;
  pricePerDay: number;
  status: 'ACTIVATED' | 'DEACTIVATED' | 'NOT_ACTIVATED';
  slots: PropertySlot[];
  createdAt: string | Date;
}

const normalizeSlotType = (rawType: unknown): PropertySlotType => {
  if (typeof rawType !== 'string') return 'Normal';
  const normalized = rawType.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (normalized === 'EV' || normalized === 'EV_SLOT' || normalized === 'EV_CHARGING') return 'EV';
  if (normalized === 'CAR_WASH' || normalized === 'CAR_WASHING' || normalized === 'CARWASH') return 'Car Washing';
  return 'Normal';
};

const inferSlotTypeFromNumber = (slotNumber: unknown): PropertySlotType => {
  if (typeof slotNumber !== 'string') return 'Normal';
  const upper = slotNumber.trim().toUpperCase();
  if (upper.startsWith('EV')) return 'EV';
  if (upper.startsWith('CW')) return 'Car Washing';
  return 'Normal';
};

const normalizeProperty = (property: any): PropertySummary => {
  const rawSlots = Array.isArray(property?.slots) ? property.slots : [];
  const slots: PropertySlot[] = rawSlots.map((slot: any) => ({
    id: slot?.id,
    number: slot?.number || slot?.slotNumber || '',
    slotNumber: slot?.slotNumber || slot?.number || '',
    type: slot?.type ? normalizeSlotType(slot.type) : inferSlotTypeFromNumber(slot?.slotNumber || slot?.number),
    status: typeof slot?.status === 'string' ? slot.status : 'available',
  }));

  const countedNormal = slots.filter((slot) => slot.type === 'Normal').length;
  const countedEv = slots.filter((slot) => slot.type === 'EV').length;
  const countedCarWash = slots.filter((slot) => slot.type === 'Car Washing').length;

  return {
    ...property,
    id: property?.id,
    name: property?.name || property?.propertyName || '',
    address: property?.address || property?.location || '',
    totalSlots: property?.totalSlots ?? slots.length,
    availableSlots: property?.availableSlots ?? slots.filter((slot) => slot.status === 'available').length,
    normalSlots: property?.normalSlots ?? countedNormal,
    evSlots: property?.evSlots ?? countedEv,
    carWashSlots: property?.carWashSlots ?? countedCarWash,
    pricePerHour: property?.pricePerHour ?? 300,
    pricePerDay: property?.pricePerDay ?? 2000,
    status: property?.status || 'DEACTIVATED',
    slots,
    createdAt: property?.createdAt || new Date().toISOString(),
  };
};

// Properties API - Uses admin_properties table (unified for admin and frontend)
export const propertiesApi = {
  getAll: async (showAll: boolean = true): Promise<PropertySummary[]> => {
    // Fetch from admin properties endpoint
    try {
      const response = await apiRequest<{ properties?: any[]; parkingLots?: any[] }>(`/admin/properties?ts=${Date.now()}`);
      const properties = response.properties || response.parkingLots || [];
      return properties.map(normalizeProperty);
    } catch (error) {
      // Fallback to parking-lots for non-admin users
      const response = await apiRequest<{ parkingLots: any[] }>(`/parking-lots?showAll=${showAll}`);
      return (response.parkingLots || []).map(normalizeProperty);
    }
  },

  getActivated: async (): Promise<PropertySummary[]> => {
    try {
      const response = await apiRequest<{ properties: any[] }>('/admin/properties?status=ACTIVATED');
      return (response.properties || []).map(normalizeProperty);
    } catch (error) {
      const response = await apiRequest<{ parkingLots: any[] }>('/parking-lots?showAll=false');
      return (response.parkingLots || []).map(normalizeProperty);
    }
  },

  getById: (id: string | number) => apiRequest<any>(`/parking-lots/${id}`),

  create: async (data: { 
    propertyName: string; 
    address: string; 
    parkingSlots?: any[];
    pricePerHour?: number;
    pricePerDay?: number;
    status?: 'ACTIVATED' | 'NOT_ACTIVATED' | 'DEACTIVATED';
  }) => {
    // Save to admin_properties table via admin endpoint
    return apiRequest<{ property: any; parkingLot: any }>('/admin/properties', {
      method: 'POST',
      body: JSON.stringify({
        propertyName: data.propertyName,
        location: data.address,
        slots: data.parkingSlots,
        pricePerHour: data.pricePerHour || 300,
        status: data.status === 'ACTIVATED' ? 'ACTIVATED' : 'DEACTIVATED',
      }),
    });
  },

  update: (id: string | number, data: { 
    name?: string; 
    address?: string; 
    description?: string;
    status?: 'ACTIVATED' | 'NOT_ACTIVATED' | 'DEACTIVATED';
    pricePerHour?: number;
    pricePerDay?: number;
    totalSlots?: number;
  }) =>
    apiRequest<{ message: string; property: any; parkingLot: any }>('/admin/properties', {
      method: 'PATCH',
      body: JSON.stringify({ 
        id: String(id), 
        propertyName: data.name,
        location: data.address,
        description: data.description,
        status: data.status === 'ACTIVATED' ? 'ACTIVATED' : 'DEACTIVATED',
        pricePerHour: data.pricePerHour,
        totalSlots: data.totalSlots,
      }),
    }),

  toggleStatus: (id: string | number, status: 'ACTIVATED' | 'NOT_ACTIVATED' | 'DEACTIVATED') =>
    apiRequest<{ message: string; property: any; parkingLot: any }>('/admin/properties', {
      method: 'PATCH',
      body: JSON.stringify({ 
        id: String(id), 
        status: status === 'ACTIVATED' ? 'ACTIVATED' : 'DEACTIVATED' 
      }),
    }),

  updatePrices: (id: string | number, pricePerHour: number, pricePerDay?: number) =>
    apiRequest<{ message: string; property: any; parkingLot: any }>('/admin/properties', {
      method: 'PATCH',
      body: JSON.stringify({ id: String(id), pricePerHour }),
    }),

  delete: (id: string | number) =>
    apiRequest<{ message: string }>(`/admin/properties?propertyId=${id}`, {
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
