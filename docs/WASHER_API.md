# Washer Dashboard API Documentation

This document describes the backend API routes for the Washer Dashboard feature in Easy-Park.

## Base URL
All API routes are prefixed with `/api/washer`

## Authentication
All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

Or via cookie named `token`.

### Allowed Roles
- `WASHER` - Primary role for car wash operations
- `ADMIN` - Full access to all operations
- `COUNTER` - Counter staff access

---

## Bookings API

### GET /api/washer/bookings
Fetch all washer bookings with filtering, searching, and sorting.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `PENDING`, `ACCEPTED`, `COMPLETED`, `CANCELLED`, or `ALL` |
| `date` | string | Filter by date (YYYY-MM-DD format) |
| `search` | string | Search by customer name or vehicle |
| `sortBy` | string | Sort order: `earliest`, `latest`, `vehicle`, `status` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "customerId": "clyyy...",
      "slotTime": "2026-01-21T09:00:00.000Z",
      "vehicle": "Toyota Camry - AB-1234",
      "serviceType": "Full Car Wash",
      "status": "PENDING",
      "notes": "Please clean interior thoroughly",
      "createdAt": "2026-01-21T08:00:00.000Z",
      "updatedAt": "2026-01-21T08:00:00.000Z",
      "customer": {
        "id": "clyyy...",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+94 77 123 4567",
        "vehicleDetails": "Toyota Camry 2020 - Silver"
      }
    }
  ],
  "message": "Washer bookings retrieved successfully"
}
```

---

### POST /api/washer/bookings
Create a new washer booking.

**Request Body:**
```json
{
  "customerId": "clyyy...",
  "slotTime": "2026-01-21T09:00:00.000Z",
  "vehicle": "Toyota Camry - AB-1234",
  "serviceType": "Full Car Wash",
  "notes": "Optional notes"
}
```

**Response:** Created booking object with status `PENDING`

---

### GET /api/washer/bookings/:id
Fetch a single booking by ID.

---

### PATCH /api/washer/bookings/:id/accept
Accept a pending booking.

**Valid Transition:** `PENDING` → `ACCEPTED`

**Response:**
```json
{
  "success": true,
  "data": { /* updated booking object */ },
  "message": "Booking accepted successfully"
}
```

---

### PATCH /api/washer/bookings/:id/confirm
Complete/confirm an accepted booking.

**Valid Transition:** `ACCEPTED` → `COMPLETED`

**Response:**
```json
{
  "success": true,
  "data": { /* updated booking object */ },
  "message": "Booking completed successfully"
}
```

---

### PATCH /api/washer/bookings/:id/cancel
Cancel a booking.

**Valid Transitions:** 
- `PENDING` → `CANCELLED`
- `ACCEPTED` → `CANCELLED`

**Note:** Cannot cancel `COMPLETED` bookings.

---

### PATCH /api/washer/bookings/:id/reschedule
Reschedule a booking to a new time.

**Request Body:**
```json
{
  "slotTime": "2026-01-22T10:00:00.000Z"
}
```

**Valid States:** Only `PENDING` or `ACCEPTED` bookings can be rescheduled.

---

### PATCH /api/washer/bookings/bulk
Perform bulk operations on multiple bookings.

**Request Body:**
```json
{
  "ids": ["booking-id-1", "booking-id-2"],
  "action": "accept" | "confirm" | "cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": [
      { "id": "booking-id-1", "status": "ACCEPTED" }
    ],
    "failed": [
      { "id": "booking-id-2", "reason": "Invalid status transition" }
    ]
  },
  "message": "Bulk accept completed. 1 succeeded, 1 failed."
}
```

---

## Customers API

### GET /api/washer/customers
Fetch all customers with optional search.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, email, or phone |

---

### POST /api/washer/customers
Create a new customer.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94 77 123 4567",
  "vehicleDetails": "Toyota Camry 2020 - Silver",
  "otherRelevantInfo": "Optional info"
}
```

---

### GET /api/washer/customers/:id
Fetch full customer details with booking history and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clyyy...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94 77 123 4567",
    "vehicleDetails": "Toyota Camry 2020 - Silver",
    "bookings": [ /* array of bookings */ ],
    "stats": {
      "total": 10,
      "pending": 1,
      "accepted": 2,
      "completed": 6,
      "cancelled": 1
    }
  }
}
```

---

### PATCH /api/washer/customers/:id
Update customer details.

---

### DELETE /api/washer/customers/:id
Delete a customer (Admin only, no existing bookings allowed).

---

## Dashboard Stats API

### GET /api/washer/stats
Get dashboard statistics.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | Date to get stats for (YYYY-MM-DD), defaults to today |

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "totalBookingsToday": 5,
      "pendingBookings": 2,
      "acceptedBookings": 1,
      "completedBookings": 1,
      "cancelledBookings": 1
    },
    "allTime": {
      "total": 50,
      "pending": 5,
      "accepted": 10,
      "completed": 30,
      "cancelled": 5
    },
    "upcomingBookings": [
      /* next 5 bookings in next 2 hours */
    ],
    "totalCustomers": 25,
    "date": "2026-01-21"
  }
}
```

---

## Notifications API

### GET /api/washer/notifications
Fetch all notifications.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `unreadOnly` | boolean | Set to `true` to fetch only unread |
| `limit` | number | Max notifications to fetch (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "clzzz...",
        "type": "new_booking",
        "message": "New booking from John Doe",
        "bookingId": "clxxx...",
        "read": false,
        "createdAt": "2026-01-21T08:00:00.000Z"
      }
    ],
    "unreadCount": 3
  }
}
```

---

### POST /api/washer/notifications
Create a notification (Admin only).

**Request Body:**
```json
{
  "type": "new_booking" | "urgent_reminder" | "upcoming_slot",
  "message": "Notification message",
  "bookingId": "optional-booking-id"
}
```

---

### PATCH /api/washer/notifications
Mark all notifications as read.

---

### PATCH /api/washer/notifications/:id
Mark a single notification as read/unread.

**Request Body:**
```json
{
  "read": true
}
```

---

### DELETE /api/washer/notifications
Clear all read notifications (Admin only).

---

### DELETE /api/washer/notifications/:id
Delete a single notification (Admin only).

---

## Status Flow

```
    ┌─────────┐
    │ PENDING │
    └────┬────┘
         │ accept
         ▼
    ┌──────────┐
    │ ACCEPTED │
    └────┬─────┘
         │ confirm
         ▼
    ┌───────────┐
    │ COMPLETED │
    └───────────┘

Any status (except COMPLETED) can be CANCELLED
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, invalid status transition) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Internal Server Error |

---

## Database Models

### WasherCustomer
```prisma
model WasherCustomer {
  id                String           @id @default(cuid())
  name              String
  email             String           @unique
  phone             String
  vehicleDetails    String
  otherRelevantInfo String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  bookings          WasherBooking[]
}
```

### WasherBooking
```prisma
model WasherBooking {
  id          String              @id @default(cuid())
  customerId  String
  customer    WasherCustomer      @relation(...)
  slotTime    DateTime
  vehicle     String
  serviceType String
  status      WasherBookingStatus @default(PENDING)
  notes       String?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}

enum WasherBookingStatus {
  PENDING
  ACCEPTED
  COMPLETED
  CANCELLED
}
```

### WasherNotification
```prisma
model WasherNotification {
  id        String   @id @default(cuid())
  type      String   // 'new_booking', 'urgent_reminder', 'upcoming_slot'
  message   String
  bookingId String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Testing

### Test User Credentials
- **Washer:** `washer@easypark.com` / `washer123`
- **Admin:** `admin@easypark.com` / `admin123`

### Run Seed
```bash
npx prisma db seed
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Run Migrations
```bash
npx prisma migrate dev
```
