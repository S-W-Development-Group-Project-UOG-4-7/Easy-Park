# Washer Dashboard - Implementation Guide

## Overview

A comprehensive washer dashboard UI built with Next.js, TypeScript, and Tailwind CSS. This dashboard provides washers with a complete booking management system including real-time status updates, customer details, filtering, and notifications.

## Features Implemented

### ✅ Core Features

1. **View Booked Slots Table**
   - Displays all bookings with columns: Slot Time, Customer Name, Vehicle, Status, Actions
   - Expandable rows showing detailed booking information
   - Real-time status updates

2. **Customer Details Modal**
   - Pop-up modal showing complete customer information
   - Vehicle details display
   - Booking information
   - Direct call button to customer

3. **Accept Request Button**
   - Marks booking as "ACCEPTED"
   - Updates status dynamically in real-time
   - Bulk accept functionality

4. **Confirm/Complete Button**
   - Marks booking as "COMPLETED"
   - Updates status and statistics
   - Bulk complete functionality

### ✅ Advanced Features

1. **Filter & Search**
   - Search by customer name or vehicle number
   - Filter by status (Pending, Accepted, Completed, Cancelled)
   - Filter by date and time range
   - Sort by earliest slot, latest slot, vehicle type, or status

2. **Notifications / Alerts**
   - Real-time notification badge with unread count
   - Toast notifications for new bookings
   - Notification dropdown with full history
   - Mark as read / dismiss functionality

3. **Booking Details Preview**
   - Click on "Details" button to view full customer information
   - Expandable rows in the table for quick preview
   - Service type, vehicle info, and time slot display

4. **Dashboard Stats**
   - Total bookings for the day
   - Pending bookings count
   - Accepted bookings count
   - Completed bookings count
   - Completion rate percentage
   - Daily summary cards

5. **Cancel / Reschedule Option**
   - Request reschedule button with reason
   - Cancel booking functionality
   - Reschedule request tracking

6. **Sort Bookings**
   - Sort by earliest time slot
   - Sort by latest time slot
   - Sort by vehicle type
   - Sort by status

7. **Bulk Actions**
   - Checkbox selection for each booking
   - Select all / deselect all
   - Bulk accept multiple bookings
   - Bulk complete multiple bookings

## Project Structure

```
app/
├── washer/
│   └── page.tsx                          # Main washer dashboard page
├── components/washer/
│   ├── WasherBookingsTable.tsx          # Bookings table with actions
│   ├── CustomerDetailsModal.tsx         # Customer details modal
│   ├── FilterAndSearch.tsx              # Filter and search controls
│   ├── DashboardStats.tsx               # Stats cards and summary
│   └── NotificationBadge.tsx            # Notification system
├── services/
│   └── washer-api.ts                    # API calls for washer operations
└── lib/
    ├── washer-types.ts                  # TypeScript types and interfaces
    └── types.ts                         # Existing app types
```

## Component Details

### WasherBookingsTable
- **Props:**
  - `bookings: WasherBooking[]` - Array of bookings to display
  - `onBookingUpdated: (bookingId, newStatus) => void` - Callback when status changes
  - `onViewDetails: (booking) => void` - Callback when Details button clicked
  - `isLoading?: boolean` - Loading state

- **Features:**
  - Expandable rows with service details
  - Checkbox selection for bulk actions
  - Accept, Complete buttons
  - Details button for modal
  - Status badges with icons

### CustomerDetailsModal
- **Props:**
  - `booking: WasherBooking | null` - Booking to display
  - `isOpen: boolean` - Modal visibility
  - `onClose: () => void` - Close callback

- **Features:**
  - Personal information section
  - Vehicle information
  - Booking details
  - Reschedule status
  - Call customer button

### FilterAndSearch
- **Props:**
  - `onFilterChange: (filters) => void` - Callback when filters change
  - `isLoading?: boolean` - Loading state

- **Features:**
  - Search input
  - Quick status filter buttons
  - Advanced filters panel
  - Date and time range selection
  - Sort options
  - Reset filters button

### DashboardStats
- **Props:**
  - `stats: DashboardStats` - Statistics object
  - `isLoading?: boolean` - Loading state

- **Features:**
  - 4 main stat cards (Total, Pending, Accepted, Completed)
  - Completion rate with progress bar
  - Daily summary cards
  - Motivational messages

### NotificationBadge
- **Props:**
  - `notifications: NotificationAlert[]` - Array of notifications
  - `onDismiss: (notificationId) => void` - Dismiss callback
  - `onMarkAsRead: (notificationId) => void` - Mark as read callback

- **Features:**
  - Bell icon with unread count badge
  - Dropdown notification list
  - Toast notifications
  - Color-coded notification types
  - Auto-dismiss after 5 seconds

## API Integration

The dashboard uses the `washer-api` service for all backend operations:

```typescript
// Get bookings
const bookings = await washerApi.getBookings(date?, status?);

// Update booking status
await washerApi.updateBookingStatus(bookingId, newStatus, notes?);

// Quick actions
await washerApi.acceptBooking(bookingId);
await washerApi.completeBooking(bookingId, notes?);
await washerApi.cancelBooking(bookingId, reason?);

// Bulk operations
await washerApi.bulkUpdateBookings(bookingIds, action);

// Get stats
const stats = await washerApi.getDashboardStats(date?);

// Customer details
const customer = await washerApi.getCustomerDetails(customerId);
```

## Types

### WasherBooking
```typescript
interface WasherBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleNumber: string;
  vehicleType: 'Sedan' | 'SUV' | 'Hatchback' | 'Truck' | 'Van' | 'Other';
  slotTime: string;
  slotDate: string;
  serviceType: string;
  duration: number;
  status: BookingStatus;
  location: string;
  notes?: string;
  createdAt: string;
  rescheduleRequested?: boolean;
}
```

### BookingFilters
```typescript
interface BookingFilters {
  searchQuery: string;
  statusFilter: BookingStatus | 'ALL';
  dateFilter?: string;
  timeRange?: { start: string; end: string };
  sortBy: 'earliest' | 'latest' | 'vehicle_type' | 'status';
}
```

### DashboardStats
```typescript
interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}
```

## Styling

The dashboard uses:
- **Tailwind CSS** for all styling
- **Dark theme** with lime/green accents
- **Responsive design** for mobile, tablet, and desktop
- **Lucide React icons** for all UI elements

### Color Scheme
- Primary: Lime (#CCFF00)
- Pending: Yellow
- Accepted: Blue/Purple
- Completed: Green
- Cancelled: Red
- Background: Dark blue gradient

## Data Flow

```
Main Dashboard Page
    ↓
Load bookings & stats (useEffect)
    ↓
Apply filters to bookings
    ↓
Render components:
    - DashboardStats
    - FilterAndSearch
    - WasherBookingsTable
    - NotificationBadge
    ↓
User Actions (Accept/Complete/View Details)
    ↓
API Call via washerApi
    ↓
Update local state
    ↓
Re-render table with new status
```

## Usage

### Basic Setup

1. **Import the page component** - It's already set up at `/app/washer/page.tsx`

2. **Ensure API endpoints exist:**
   - `GET /api/bookings?role=washer` - Get bookings
   - `PATCH /api/bookings/{id}` - Update booking status
   - `GET /api/bookings/washer/stats` - Get dashboard stats
   - `GET /api/users/{id}` - Get customer details

3. **Environment Setup** - Uses existing authentication context

### Customization

- Modify color scheme in components using Tailwind classes
- Adjust refresh interval (currently 30 seconds) in useEffect
- Customize notification types in `washer-types.ts`
- Add more stat cards in `DashboardStats` component

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Data refreshes every 30 seconds
- Notifications auto-dismiss after 5 seconds
- Debounced search input
- Efficient table rendering with React fragments
- Modal uses React Portal to prevent DOM bloat

## Future Enhancements

1. **Real-time updates** using WebSocket
2. **Export bookings** to CSV/PDF
3. **Rating and feedback** after completion
4. **Service time tracking** with timer
5. **Payment status** integration
6. **Customer rating** display
7. **Earnings summary** dashboard
8. **Schedule preferences** for washers

## Troubleshooting

### Bookings not loading
- Check API endpoints are correctly configured
- Verify authentication token is valid
- Check browser console for API errors

### Notifications not appearing
- Ensure notifications array has items
- Check if modal/backdrop is blocking notification
- Verify notification types are correct

### Filters not working
- Verify filter state is being passed to table
- Check booking data has required fields
- Ensure date/time formats match

## Support

For issues or questions:
1. Check component TypeScript types
2. Verify API response format
3. Review browser console for errors
4. Check Tailwind CSS class names
