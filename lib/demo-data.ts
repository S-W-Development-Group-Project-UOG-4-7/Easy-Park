/**
 * Demo/Example Data for Washer Dashboard
 * This file contains sample data structures and examples
 */

import { WasherBooking, DashboardStats, BookingStatus } from '@/lib/washer-types';

// Example Bookings Data
export const EXAMPLE_BOOKINGS: WasherBooking[] = [
  {
    id: 'booking-001',
    customerId: 'customer-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    vehicleNumber: 'AB-1234',
    vehicleType: 'Sedan',
    slotTime: '09:00 AM',
    slotDate: '2024-01-19',
    serviceType: 'Full Car Wash',
    duration: 60,
    status: 'PENDING' as BookingStatus,
    location: 'Colombo 07',
    notes: 'Vehicle has a small dent on the right side',
    createdAt: '2024-01-19T08:30:00Z',
  },
  {
    id: 'booking-002',
    customerId: 'customer-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1234567891',
    vehicleNumber: 'CD-5678',
    vehicleType: 'SUV',
    slotTime: '10:30 AM',
    slotDate: '2024-01-19',
    serviceType: 'Premium Detailing',
    duration: 90,
    status: 'ACCEPTED' as BookingStatus,
    location: 'Colombo 03',
    notes: '',
    createdAt: '2024-01-19T09:15:00Z',
  },
  {
    id: 'booking-003',
    customerId: 'customer-003',
    customerName: 'Robert Johnson',
    customerEmail: 'robert@example.com',
    customerPhone: '+1234567892',
    vehicleNumber: 'EF-9012',
    vehicleType: 'Hatchback',
    slotTime: '12:00 PM',
    slotDate: '2024-01-19',
    serviceType: 'Quick Wash',
    duration: 30,
    status: 'COMPLETED' as BookingStatus,
    location: 'Malabe',
    notes: '',
    createdAt: '2024-01-19T10:00:00Z',
  },
  {
    id: 'booking-004',
    customerId: 'customer-004',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1234567893',
    vehicleNumber: 'GH-3456',
    vehicleType: 'Truck',
    slotTime: '02:00 PM',
    slotDate: '2024-01-19',
    serviceType: 'Truck Wash',
    duration: 120,
    status: 'PENDING' as BookingStatus,
    location: 'Kelaniya',
    notes: 'Heavy mud accumulation, needs extra attention',
    createdAt: '2024-01-19T10:45:00Z',
  },
  {
    id: 'booking-005',
    customerId: 'customer-005',
    customerName: 'Michael Brown',
    customerEmail: 'michael@example.com',
    customerPhone: '+1234567894',
    vehicleNumber: 'IJ-7890',
    vehicleType: 'Van',
    slotTime: '03:30 PM',
    slotDate: '2024-01-19',
    serviceType: 'Full Car Wash',
    duration: 60,
    status: 'CANCELLED' as BookingStatus,
    location: 'Negombo',
    notes: 'Customer cancelled due to bad weather',
    createdAt: '2024-01-19T11:20:00Z',
  },
];

// Example Dashboard Stats
export const EXAMPLE_STATS: DashboardStats = {
  totalBookings: 5,
  pendingBookings: 2,
  acceptedBookings: 1,
  completedBookings: 1,
  cancelledBookings: 1,
};

// Example filtered bookings
export const EXAMPLE_FILTERED_BY_STATUS = {
  PENDING: EXAMPLE_BOOKINGS.filter(b => b.status === 'PENDING'),
  ACCEPTED: EXAMPLE_BOOKINGS.filter(b => b.status === 'ACCEPTED'),
  COMPLETED: EXAMPLE_BOOKINGS.filter(b => b.status === 'COMPLETED'),
  CANCELLED: EXAMPLE_BOOKINGS.filter(b => b.status === 'CANCELLED'),
};

// Example API responses
export const EXAMPLE_API_RESPONSES = {
  // GET /api/bookings?role=washer
  getBookings: {
    success: true,
    data: EXAMPLE_BOOKINGS,
  },

  // GET /api/bookings/washer/stats
  getDashboardStats: {
    success: true,
    data: EXAMPLE_STATS,
  },

  // PATCH /api/bookings/{id}
  updateBookingStatus: {
    success: true,
    data: {
      id: 'booking-001',
      status: 'ACCEPTED',
      updatedAt: new Date().toISOString(),
    },
  },

  // GET /api/users/{id}
  getCustomerDetails: {
    success: true,
    data: {
      id: 'customer-001',
      fullName: 'John Doe',
      email: 'john@example.com',
      contactNo: '+1234567890',
      nic: '123456789V',
      role: 'CUSTOMER',
      createdAt: '2024-01-15T10:00:00Z',
    },
  },

  // PATCH /api/bookings/bulk-update
  bulkUpdateBookings: {
    success: true,
    data: {
      updatedCount: 3,
    },
  },
};

// Demo: How to use the dashboard
export const USAGE_EXAMPLE = `
// In your washer/page.tsx or any component:

import { WasherBooking } from '@/lib/washer-types';
import { washerApi } from '@/app/services/washer-api';
import { EXAMPLE_BOOKINGS } from '@/lib/demo-data';

// 1. Load bookings
const bookings = await washerApi.getBookings('2024-01-19');

// 2. Accept a booking
await washerApi.acceptBooking('booking-001');

// 3. Complete a booking
await washerApi.completeBooking('booking-001', 'Wash completed successfully');

// 4. Cancel a booking
await washerApi.cancelBooking('booking-001', 'Customer requested cancellation');

// 5. Bulk operations
await washerApi.bulkUpdateBookings(['booking-001', 'booking-002'], 'accept');

// 6. Get stats
const stats = await washerApi.getDashboardStats('2024-01-19');

// 7. Get customer details
const customer = await washerApi.getCustomerDetails('customer-001');
`;

// Component usage examples
export const COMPONENT_USAGE = {
  WasherBookingsTable: `
    <WasherBookingsTable
      bookings={filteredBookings}
      onBookingUpdated={(bookingId, newStatus) => {
        console.log(\`Booking \${bookingId} updated to \${newStatus}\`);
      }}
      onViewDetails={(booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
      }}
      isLoading={isLoading}
    />
  `,

  CustomerDetailsModal: `
    <CustomerDetailsModal
      booking={selectedBooking}
      isOpen={showDetailsModal}
      onClose={() => setShowDetailsModal(false)}
    />
  `,

  FilterAndSearch: `
    <FilterAndSearch
      onFilterChange={(filters) => {
        // Apply filters to bookings
        setFilters(filters);
      }}
      isLoading={isLoading}
    />
  `,

  DashboardStats: `
    <DashboardStats
      stats={stats}
      isLoading={isLoading}
    />
  `,

  NotificationBadge: `
    <NotificationBadge
      notifications={notifications}
      onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      onMarkAsRead={(id) => setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )}
    />
  `,
};

// Test data generator
export function generateMockBooking(overrides?: Partial<WasherBooking>): WasherBooking {
  const id = Math.random().toString(36).substr(2, 9);
  return {
    id: `booking-${id}`,
    customerId: `customer-${id}`,
    customerName: `Customer ${id}`,
    customerEmail: `customer${id}@example.com`,
    customerPhone: `+123456789${Math.floor(Math.random() * 10)}`,
    vehicleNumber: `AB-${Math.floor(Math.random() * 10000)}`,
    vehicleType: ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van'][Math.floor(Math.random() * 5)] as any,
    slotTime: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    slotDate: new Date().toISOString().split('T')[0],
    serviceType: ['Quick Wash', 'Full Car Wash', 'Premium Detailing', 'Truck Wash'][Math.floor(Math.random() * 4)],
    duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
    status: ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'][Math.floor(Math.random() * 4)] as BookingStatus,
    location: ['Colombo 07', 'Colombo 03', 'Malabe', 'Kelaniya', 'Negombo'][Math.floor(Math.random() * 5)],
    notes: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Generate multiple mock bookings
export function generateMockBookings(count: number = 5): WasherBooking[] {
  return Array.from({ length: count }, () => generateMockBooking());
}
