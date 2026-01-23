# Admin Database Structure - Unified Tables

## Overview

This document explains the unified database structure for the Easy-Park parking/property management system. **Admin and frontend now share the same database tables**, ensuring data consistency and eliminating duplicate entries.

## Key Principles

1. **Single Source of Truth**: All data is stored in unified tables used by both admin panel and customer frontend
2. **No Duplicate Tables**: The old separate `admin_*` tables are deprecated in favor of unified tables
3. **Real-time Sync**: When a property is added from frontend, it immediately appears in admin panel
4. **Shared Booking Data**: All bookings are visible to both customers (their own) and admins (all)

---

## 🏢 Admin Property Table (Unified)

**Database Table**: `parking_locations`  
**Prisma Model**: `ParkingLocation`

### Field Mapping

| Admin Field | Database Column | Description |
|-------------|-----------------|-------------|
| Property ID (unique) | `id` | Unique identifier (CUID) |
| Property Name | `name` | Name of the parking property |
| Location | `address` | Physical address/location |
| Description | `description` | Optional property description |
| Price per Hour | `pricePerHour` | Hourly parking rate (default: 300) |
| Price per Day | `pricePerDay` | Daily parking rate (default: 2000) |
| Parking Area Status | `status` | ACTIVATED / NOT_ACTIVATED |
| Total Parking Slots | `totalSlots` | Total number of slots |
| Available Parking Slots | Calculated | Count of slots where status='AVAILABLE' |
| Created Date | `createdAt` | Timestamp when property was created |
| Last Updated Date | `updatedAt` | Timestamp of last update |
| Owner | `ownerId` -> `User` | Optional owner reference |

### API Endpoints

```
GET    /api/admin/properties          - Get all properties (admin only)
POST   /api/admin/properties          - Create new property
PATCH  /api/admin/properties          - Update property details/status
DELETE /api/admin/properties?propertyId=xxx - Delete property

GET    /api/parking-lots              - Get properties (frontend, respects status)
POST   /api/parking-lots              - Create property (land owner/admin)
```

### Usage Example

```typescript
import { adminPropertiesApi } from '@/app/services/admin-api';

// Get all properties for admin panel
const properties = await adminPropertiesApi.getAll();

// Filter by status
const activeProperties = await adminPropertiesApi.getAll({ status: 'ACTIVATED' });

// Create new property
await adminPropertiesApi.create({
  propertyName: 'Downtown Parking',
  location: '123 Main St',
  pricePerHour: 300,
  parkingAreaStatus: 'ACTIVATED',
  slots: [
    { type: 'Normal', count: 20 },
    { type: 'EV', count: 5 },
    { type: 'Car Washing', count: 3 }
  ]
});

// Toggle status
await adminPropertiesApi.toggleStatus(propertyId, 'DEACTIVATED');
```

---

## 📖 View Booking Details Table (Unified)

**Database Tables**: `bookings` + `booking_slots` + `parking_slots` + `parking_locations`  
**Prisma Models**: `Booking`, `BookingSlot`, `ParkingSlot`, `ParkingLocation`

### Field Mapping

| Admin Field | Source | Description |
|-------------|--------|-------------|
| Booking ID | `Booking.id` | Unique booking identifier |
| Booking Number | Generated | BK-{last 6 chars of ID} |
| Property ID | `ParkingSlot.locationId` | Linked property |
| Property Name | `ParkingLocation.name` | Property name via relation |
| Booking Date | `Booking.date` | Date of parking |
| Start Time | `Booking.startTime` | Booking start time |
| End Time | `Booking.endTime` | Booking end time |
| Slot Number | `ParkingSlot.number` | Booked slot number |
| User ID | `Booking.userId` | Customer's user ID |
| Customer Name | `User.fullName` | Customer's full name |
| Booking Status | `Booking.status` | PENDING/CONFIRMED/PAID/COMPLETED/CANCELLED |

### API Endpoints

```
GET   /api/admin/bookings             - Get all bookings with filters
PATCH /api/admin/bookings             - Update booking status

GET   /api/bookings                   - Get bookings (user's own or all for admin)
POST  /api/bookings                   - Create new booking (frontend)
```

### Admin Booking View Features

1. **View All Bookings**: Admin can see all bookings across all properties
2. **Filter by Property**: Filter bookings for a specific property
3. **Search by Date**: Find bookings on a specific date
4. **Search by Time Range**: Find bookings within a time range
5. **Group by Property**: See bookings organized by property

### Usage Example

```typescript
import { adminBookingsApi } from '@/app/services/admin-api';

// Get all bookings
const bookings = await adminBookingsApi.getAll();

// Filter by property
const propertyBookings = await adminBookingsApi.getAll({ 
  propertyId: 'clxxxx...' 
});

// Filter by date
const dateBookings = await adminBookingsApi.getAll({ 
  date: '2026-01-22' 
});

// Filter by time range
const timeBookings = await adminBookingsApi.getAll({ 
  startTime: '09:00',
  endTime: '17:00'
});

// Get bookings grouped by property
const grouped = await adminBookingsApi.getGroupedByProperty();
```

---

## 🔍 Available Slots for Frontend

The frontend should show only available slots based on the booking table:

```typescript
import { adminBookingsApi } from '@/app/services/admin-api';

// Get available slots for a property at a specific date/time
const availableSlots = await adminBookingsApi.getAvailableSlots(
  propertyId,
  '2026-01-22',
  '10:00',
  '14:00'
);
```

This checks:
1. Slot status is 'AVAILABLE'
2. No conflicting bookings exist for the time range

---

## Database Schema Overview

```prisma
// Unified Property Table (used by admin + frontend)
model ParkingLocation {
  id           String                @id @default(cuid())
  name         String                // Property Name
  address      String                // Location
  description  String?
  totalSlots   Int                   // Total Parking Slots
  pricePerHour Float @default(300)   // Price per Hour
  pricePerDay  Float @default(2000)
  status       ParkingLocationStatus // ACTIVATED / NOT_ACTIVATED
  ownerId      String?
  createdAt    DateTime @default(now()) // Created Date
  updatedAt    DateTime @updatedAt      // Last Updated Date
  slots        ParkingSlot[]
  
  @@map("parking_locations")
}

// Unified Slot Table
model ParkingSlot {
  id           String          @id @default(cuid())
  number       String          // Slot Number
  zone         String          
  type         SlotType        // NORMAL, EV, CAR_WASH
  status       SlotStatus      // AVAILABLE, OCCUPIED, MAINTENANCE
  pricePerHour Float
  locationId   String          // Property ID (FK)
  bookings     BookingSlot[]
  
  @@map("parking_slots")
}

// Unified Booking Table (admin + frontend)
model Booking {
  id          String        @id @default(cuid())   // Booking ID
  userId      String                               // User ID
  date        DateTime                             // Booking Date
  startTime   DateTime                             // Start Time
  endTime     DateTime                             // End Time
  duration    Int
  totalAmount Float
  status      BookingStatus                        // Booking Status
  slots       BookingSlot[]
  
  @@map("bookings")
}

// Junction table for booking-slot relationship
model BookingSlot {
  id        String
  bookingId String          // Links to Booking
  slotId    String          // Links to ParkingSlot (has locationId for Property)
  
  @@map("booking_slots")
}

// User table (admin customers)
model User {
  id            String    // User ID
  fullName      String    // Customer Name
  email         String
  contactNo     String?
  vehicleNumber String?
  bookings      Booking[]
  
  @@map("users")
}
```

---

## Migration Notes

### Deprecated Tables (No Longer Used)
- `admin_properties` → Use `parking_locations`
- `admin_parking_slots` → Use `parking_slots`
- `admin_bookings` → Use `bookings`
- `admin_customers` → Use `users`

### Data Migration (if needed)
If you have existing data in the old admin tables that needs to be preserved:

```sql
-- Migrate admin properties to parking_locations (if not already there)
INSERT INTO parking_locations (id, name, address, description, "totalSlots", "pricePerHour", status, "createdAt", "updatedAt")
SELECT id, "propertyName", location, description, "totalSlots", "pricePerHour", 
       CASE status WHEN 'ACTIVATED' THEN 'ACTIVATED' ELSE 'NOT_ACTIVATED' END,
       "createdAt", "updatedAt"
FROM admin_properties
WHERE id NOT IN (SELECT id FROM parking_locations);
```

---

## Frontend Integration

### Properties Listing
```typescript
// Frontend uses the same API, just filtered by status
import { propertiesApi } from '@/app/services/api';

// Shows only ACTIVATED properties to customers
const properties = await propertiesApi.getActivated();
```

### Making Bookings
```typescript
import { bookingsApi } from '@/app/services/api';

// Creates booking in unified bookings table
await bookingsApi.create({
  date: '2026-01-22',
  startTime: '10:00',
  endTime: '14:00',
  slotIds: ['slot-id-1', 'slot-id-2']
});
```

---

## Summary

| Feature | Table Used | Admin Access | Frontend Access |
|---------|------------|--------------|-----------------|
| Properties | `parking_locations` | All (ACTIVATED + NOT_ACTIVATED) | Only ACTIVATED |
| Slots | `parking_slots` | All | Based on availability |
| Bookings | `bookings` | All bookings | User's own bookings |
| Customers | `users` | All users | Own profile |

This unified structure ensures:
✅ Properties added from frontend appear in admin  
✅ Data is consistent across admin and frontend  
✅ No duplicate entries  
✅ Real-time availability based on bookings  
