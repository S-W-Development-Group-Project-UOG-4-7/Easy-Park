const API_BASE_URL = 'http://localhost:3001/api';

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ token: string; admin: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: { username: string; email: string; password: string; fullName?: string }) =>
    apiRequest<{ token: string; admin: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiRequest<any>('/auth/profile'),

  updateProfile: (data: { fullName?: string; phone?: string; email?: string }) =>
    apiRequest<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Properties API
export const propertiesApi = {
  getAll: () => apiRequest<any[]>('/properties'),

  getById: (id: string) => apiRequest<any>(`/properties/${id}`),

  create: (data: { propertyName: string; address: string; parkingSlots?: any[] }) =>
    apiRequest<{ id: string; message: string }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; address?: string; description?: string }) =>
    apiRequest<{ message: string }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/properties/${id}`, {
      method: 'DELETE',
    }),
};

// Bookings API
export const bookingsApi = {
  getAll: (filters?: { propertyId?: string; date?: string; time?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.propertyId && filters.propertyId !== 'all') params.append('propertyId', filters.propertyId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.time) params.append('time', filters.time);
    if (filters?.status) params.append('status', filters.status);
    return apiRequest<any[]>(`/bookings?${params}`);
  },

  getById: (id: string) => apiRequest<any>(`/bookings/${id}`),

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

// Stats API
export const statsApi = {
  getDashboard: () =>
    apiRequest<{
      totalRevenue: number;
      availableSlots: number;
      totalCustomers: number;
      todayBookings: number;
      monthlyRevenue: { month: string; revenue: number }[];
      parkingTypes: { type: string; count: number }[];
      propertyOccupancy: { name: string; totalSlots: number; occupiedSlots: number; occupancyRate: number }[];
    }>('/stats'),
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
  auth: authApi,
  properties: propertiesApi,
  bookings: bookingsApi,
  stats: statsApi,
  customers: customersApi,
  slots: slotsApi,
};
