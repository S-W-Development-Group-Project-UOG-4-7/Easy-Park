# Parking Admin Backend Server

A Node.js/Express backend with PostgreSQL database for the Parking Admin Panel.

## Prerequisites

1. **Node.js** v18 or higher
2. **PostgreSQL** installed and running
3. **npm** or **yarn** package manager

## Database Setup

### 1. Install PostgreSQL

Download and install PostgreSQL from https://www.postgresql.org/download/

### 2. Create Database

Open pgAdmin or psql terminal and create the database:

```sql
CREATE DATABASE parking_admin;
```

### 3. Configure Environment

Edit the `.env` file with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parking_admin
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Installation

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Run database migrations (creates tables)
npm run db:migrate

# Seed database with sample data (optional)
npm run db:seed
```

## Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The server will run at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin
- `GET /api/auth/profile` - Get current admin profile
- `PUT /api/auth/profile` - Update admin profile

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Stats
- `GET /api/stats` - Get dashboard statistics

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Parking Slots
- `GET /api/slots` - Get all slots
- `POST /api/slots` - Create new slot
- `PUT /api/slots/:id` - Update slot
- `DELETE /api/slots/:id` - Delete slot

## Default Admin Credentials

After running `npm run db:seed`:
- **Username:** admin
- **Password:** admin123

## Database Schema

### Tables
- `admins` - Admin users
- `properties` - Parking properties
- `parking_slots` - Individual parking slots
- `customers` - Customer records
- `bookings` - Booking records
- `revenue_logs` - Revenue tracking

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** pg (node-postgres)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **TypeScript:** Full type support
