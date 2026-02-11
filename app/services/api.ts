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

export interface AdminProperty {
  id: string;
  propertyName: string;
  location: string;
  pricePerHour: number;
  totalSlots: number;
  status: 'ACTIVATED' | 'DEACTIVATED';
}

export interface PublicPropertySlot {
  id: string;
  number: string;
  type: 'NORMAL' | 'EV' | 'CAR_WASH';
  isBooked: boolean;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
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

  getActive: async (): Promise<AdminProperty[]> => {
    const response = await apiRequest<{ success: boolean; data: AdminProperty[] }>('/public/properties');
    return response.data || [];
  },

  getPublicActive: async (): Promise<AdminProperty[]> => {
    return propertiesApi.getActive();
  },

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
export interface AdminBookingRow {
  id: string;
  customerId: string;
  customerEmail?: string;
  name: string;
  address: string;
  propertyName: string;
  propertyId: string;
  parkingSlot: string;
  parkingSlotId: string;
  date: string;
  time: string;
  parkingType: 'Car Washing' | 'Normal' | 'EV Slot';
  hoursSelected: number;
  checkOutTime: string;
  paymentAmount: number;
  onlinePaid?: number;
  balanceDue?: number;
  paymentMethod: string;
  paymentStatus?: string;
  bookingType?: 'NORMAL' | 'EV_SLOT' | 'CAR_WASHING';
  extrasCost?: number;
  checkInTime?: string;
  extras?: string;
  status?: string;
  vehicleNumber?: string;
}

export interface BookingPaymentDetails {
  paymentId: string | null;
  bookingId: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
  };
  property: {
    id: string | null;
    name: string;
    address: string | null;
  };
  totalAmount: number;
  onlinePaid: number;
  balanceDue: number;
  currency: string;
  paymentMethod: string;
  paymentGatewayStatus: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  transactionId: string | null;
  bookingDate: string;
  bookingTime: string;
  hoursSelected: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  parkingType: 'Normal' | 'Car Washing' | 'EV Slot';
  bookingType: 'NORMAL' | 'EV_SLOT' | 'CAR_WASHING';
  extras: unknown;
  createdAt: string;
  updatedAt: string;
}

const toIsoDateString = (raw: unknown): string => {
  if (!raw) return '';
  const date = new Date(String(raw));
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toISOString().split('T')[0];
};

const toTimeString = (raw: unknown): string => {
  if (!raw) return '';
  const date = new Date(String(raw));
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const toParkingType = (rawType: unknown): 'Car Washing' | 'Normal' | 'EV Slot' => {
  const normalized = String(rawType || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (normalized === 'EV' || normalized === 'EV_SLOT') return 'EV Slot';
  if (normalized === 'CAR_WASH' || normalized === 'CAR_WASHING') return 'Car Washing';
  return 'Normal';
};

export const bookingsApi = {
  getAll: async (filters?: { propertyId?: string; date?: string; time?: string; status?: string }): Promise<AdminBookingRow[]> => {
    const params = new URLSearchParams();
    if (filters?.propertyId && filters.propertyId !== 'all') params.append('propertyId', filters.propertyId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.time) params.append('startTime', filters.time);
    if (filters?.status) params.append('status', filters.status);
    const response = await apiRequest<{ success: boolean; bookings: any[]; total: number }>(`/admin/bookings?${params}`);
    const bookings = response.bookings || [];

    return bookings.map((booking: any): AdminBookingRow => ({
      id: String(booking.bookingId || booking.id || ''),
      customerId: String(booking.customerId || booking.userId || ''),
      customerEmail: booking.customerEmail || 'N/A',
      name: booking.customerName || booking.name || 'Unknown',
      address: booking.customerAddress || booking.address || 'N/A',
      propertyName: booking.propertyName || 'Unknown',
      propertyId: String(booking.propertyId || ''),
      parkingSlot: booking.slotNumber || booking.parkingSlot || 'N/A',
      parkingSlotId: String(booking.allSlots?.[0]?.id || booking.parkingSlotId || ''),
      date: toIsoDateString(booking.bookingDate || booking.date),
      time: toTimeString(booking.startTime || booking.time),
      parkingType: toParkingType(booking.allSlots?.[0]?.type || booking.parkingType),
      hoursSelected: Number(booking.duration || booking.hoursSelected || 1),
      checkOutTime: booking.endTime || booking.checkOutTime || '',
      paymentAmount: Number(booking.totalAmount || booking.paymentAmount || 0),
      onlinePaid: Number(booking.onlinePaid ?? booking.paidAmount ?? 0),
      balanceDue: Number(
        booking.balanceDue ??
          Math.max(
            0,
            Number(booking.totalAmount || booking.paymentAmount || 0) -
              Number(booking.onlinePaid ?? booking.paidAmount ?? 0)
          )
      ),
      paymentMethod: booking.paymentMethod || booking.payment?.method || 'N/A',
      paymentStatus: booking.paymentStatus || booking.payment?.paymentStatus || '',
      bookingType: booking.bookingType || undefined,
      extrasCost: Number(booking.extrasCost || 0),
      checkInTime: booking.checkInTime || booking.startTime || '',
      extras: booking.extras ? JSON.stringify(booking.extras) : '',
      status: String(booking.bookingStatus || booking.status || 'PENDING').toLowerCase(),
      vehicleNumber: booking.vehicleNumber || 'N/A',
    }));
  },

  getPaymentDetails: async (bookingId: string): Promise<BookingPaymentDetails> => {
    const response = await apiRequest<{ success: boolean; data: BookingPaymentDetails }>(
      `/admin/bookings/${bookingId}/payment`
    );
    return response.data;
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
      const [statsRes, parkingLotsRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include', cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch admin stats'))))
          .catch(() => ({ totalRevenue: 0, totalCustomers: 0, activeBookings: 0 })),
        fetch('/api/parking-lots', { credentials: 'include', cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => ({ parkingLots: [] })),
      ]);

      const parkingLots = parkingLotsRes.parkingLots || [];

      const toFiniteNumber = (value: unknown) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const availableSlots = parkingLots.reduce((sum: number, lot: any) => sum + (lot.availableSlots || 0), 0);

      const totalRevenue = toFiniteNumber(statsRes.totalRevenue);
      const totalCustomers = toFiniteNumber(statsRes.totalCustomers);
      const activeBookings = toFiniteNumber(statsRes.activeBookings);

      return {
        totalRevenue,
        availableSlots,
        totalCustomers,
        activeBookings,
        todayBookings: activeBookings,
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
        activeBookings: 0,
        todayBookings: 0,
        monthlyRevenue: [],
        parkingTypes: [],
        propertyOccupancy: [],
      };
    }
  },
};

// Customers API
export interface AdminCustomerVehicleDetails {
  registrationNumber: string | null;
  type: string | null;
  model: string | null;
  color: string | null;
}

export interface AdminCustomerProfile {
  id: string;
  fullName: string | null;
  email: string | null;
  nic: string | null;
  phone: string | null;
  address: string | null;
  role: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  vehicle: AdminCustomerVehicleDetails;
}

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

  getById: async (id: string): Promise<AdminCustomerProfile> => {
    const response = await apiRequest<{ success: boolean; data: any }>(`/admin/customers/${id}`);
    const data = response.data || {};
    return {
      id: String(data.id || id),
      fullName: data.fullName ?? null,
      email: data.email ?? null,
      nic: data.nic ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      role: data.role ?? null,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
      vehicle: {
        registrationNumber: data.vehicle?.registrationNumber ?? null,
        type: data.vehicle?.type ?? null,
        model: data.vehicle?.model ?? null,
        color: data.vehicle?.color ?? null,
      },
    };
  },

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
  getByProperty: async (
    propertyId: string,
    params: { date: string; time?: string; duration?: string | number }
  ): Promise<PublicPropertySlot[]> => {
    const query = new URLSearchParams();
    query.append('date', params.date);
    if (params.time) query.append('time', params.time);
    if (params.duration !== undefined) query.append('duration', String(params.duration));

    const response = await apiRequest<{ success: boolean; data: PublicPropertySlot[] }>(
      `/public/properties/${propertyId}/slots?${query.toString()}`
    );
    return response.data || [];
  },

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
