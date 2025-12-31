# Easy-Park Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Update your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/easypark?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database named `easypark`
3. Update `DATABASE_URL` in `.env`

**Option B: Cloud PostgreSQL (Recommended for beginners)**
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Free tier available
- [Railway](https://railway.app) - Free tier available

### 4. Run Database Migrations
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 5. Seed the Database (Optional)
```bash
npm run db:seed
```

This creates:
- Test user: `test@easypark.com` / `password123`
- Admin user: `admin@easypark.com` / `admin123`
- Sample parking locations and slots

### 6. Start Development Server
```bash
npm run dev
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up` | Register new user |
| POST | `/api/auth/sign-in` | Login user |
| POST | `/api/auth/sign-out` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PATCH | `/api/users/profile` | Update profile |
| PUT | `/api/users/profile` | Change password |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all user bookings |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/[id]` | Get booking by ID |
| PATCH | `/api/bookings/[id]` | Update booking |
| DELETE | `/api/bookings/[id]` | Delete booking |

### Parking Slots

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slots` | Get all slots |
| POST | `/api/slots` | Create slot (admin) |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | Get all locations |
| POST | `/api/locations` | Create location (admin) |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | Get user payments |
| POST | `/api/payments` | Process payment |

---

## Example API Usage

### Sign Up
```javascript
const response = await fetch('/api/auth/sign-up', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe',
    contactNo: '0771234567',
    vehicleNumber: 'ABC-1234',
    nic: '200012345678'
  })
});
```

### Sign In
```javascript
const response = await fetch('/api/auth/sign-in', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

### Create Booking
```javascript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    date: '2025-01-15',
    startTime: '2025-01-15T09:00:00Z',
    endTime: '2025-01-15T12:00:00Z',
    duration: 3,
    slotIds: ['slot-id-1', 'slot-id-2']
  })
});
```

### Process Payment
```javascript
const response = await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    bookingId: 'booking-id',
    amount: 900,
    method: 'CARD'
  })
});
```

---

## Database Management

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Generate Prisma Client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create a migration
npm run db:migrate
```

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── sign-up/route.ts
│   │   │   ├── sign-in/route.ts
│   │   │   ├── sign-out/route.ts
│   │   │   └── me/route.ts
│   │   ├── bookings/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── locations/route.ts
│   │   ├── payments/route.ts
│   │   ├── slots/route.ts
│   │   └── users/
│   │       └── profile/route.ts
│   └── ...
├── lib/
│   ├── api-response.ts    # API response helpers
│   ├── auth.ts            # Authentication utilities
│   ├── prisma.ts          # Prisma client
│   └── types.ts           # TypeScript types
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
└── .env                   # Environment variables
```
