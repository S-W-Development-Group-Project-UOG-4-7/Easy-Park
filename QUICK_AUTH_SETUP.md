# Quick Setup Guide for Easy-Park Auth

## Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Create PostgreSQL database:
```sql
CREATE DATABASE easypark;
```

### 3. Environment Configuration
Verify `.env` file exists with:
```env
DATABASE_URL="postgresql://postgres:12345678@localhost:5432/easypark?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="development"
```

### 4. Run Database Migrations
```bash
npm run db:migrate
```

### 5. (Optional) Seed Demo Data
```bash
npm run db:seed
```

### 6. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Testing Authentication

### Create New Account
1. Go to http://localhost:3000/sign-up
2. Fill in the form
3. Select your role
4. Click "Continue"

### Login to Existing Account
1. Go to http://localhost:3000/sign-in
2. Enter email and password
3. Click "Continue"

## Auth API Endpoints

### POST /api/auth/sign-up
Create new user account
```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "role": "CUSTOMER"
  }'
```

### POST /api/auth/sign-in
Login to existing account
```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### GET /api/auth/me
Get current user info (requires auth token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/auth/sign-out
Logout (requires auth token)
```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Run: `npm run db:migrate`

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Permission Errors
```bash
rm -rf node_modules
npm install
```

## Support
See AUTH_FIXES_SUMMARY.md for detailed fix information.
