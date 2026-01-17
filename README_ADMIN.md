# Admin Page - EasyPark Parking Management System

This document describes the Admin page implementation for the EasyPark parking management system.

## Features

### 1. Admin Home Page
- **Summary Cards** displaying:
  - Total Revenue
  - Available Parking Slots
  - Customers Using the System
- Beautiful gradient design with dark/light mode support

### 2. View Booking Details Page
- **Filters**:
  - Property selection dropdown
  - Date picker
  - Search functionality
- **Table Features**:
  - Sortable columns (Customer ID, Name, Address, Property, Parking Slot, Date)
  - Pagination
  - Expandable rows showing detailed customer information
- **Customer Details View** includes:
  - Name and Address
  - Property Place & Parking Slot Number
  - Parking Type (Car Washing, Normal, EV Slot)
  - Hours Selected
  - Check Out Time
  - Payment Details (Amount, Method, Extras)

### 3. Add Properties Page
- Form to add new parking properties
- Fields:
  - Property Name
  - Location/Address
  - Parking Slots (EV, Normal, Car Washing) with count
- Dynamic slot type addition/removal

### 4. Navigation Sidebar
- Fixed left sidebar with:
  - Admin Name display
  - Home link
  - View Booking Details link
  - Add Properties link
  - Sign Out button
- Responsive design (hidden on mobile, visible on desktop)

## Installation

### Frontend Dependencies

Install the required frontend packages:

```bash
npm install lucide-react react-datepicker @types/react-datepicker
```

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=easypark
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### Database Setup (Optional)

The backend will work with mock data if no database is configured. To use a real database:

1. Create a MySQL database named `easypark`
2. Update the `.env` file with your database credentials
3. The server will automatically create the required tables on startup

## Usage

### Accessing Admin Pages

1. Start the frontend development server:
```bash
npm run dev
```

2. Navigate to:
   - Admin Home: `http://localhost:5173/admin`
   - View Bookings: `http://localhost:5173/admin/bookings`
   - Add Properties: `http://localhost:5173/admin/properties/add`

### Theme Toggle

Click the sun/moon icon in the top-right corner to toggle between dark and light modes.

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/stats` - Get revenue, available slots, and customer count
- `GET /api/properties` - List all properties
- `POST /api/properties` - Add a new property
- `GET /api/bookings` - List bookings (supports `propertyId` and `date` query params)
- `GET /api/bookings/:id` - Get single booking details

All endpoints require authentication (Bearer token in Authorization header).

## Design Specifications

### Dark Mode Gradients
- Background: `#0F172A` → `#020617`
- Surface: `#1E293B` → `#0F172A`
- Accent: `#84CC16` → `#BEF264`
- Text/Muted: `#E5E7EB` / `#94A3B8`

### Light Mode Gradients
- Background: `#F9FAFB` → `#E5E7EB`
- Surface: `#FFFFFF` → `#F3F4F6`
- Accent: `#84CC16` → `#BEF264`
- Text/Muted: `#111827` / `#6B7280`

## File Structure

```
src/
├── components/
│   ├── AdminSidebar.tsx      # Left sidebar navigation
│   └── AdminLayout.tsx        # Layout wrapper for admin pages
├── pages/
│   ├── AdminHomePage.tsx      # Admin home page with stats
│   ├── ViewBookingDetailsPage.tsx  # Bookings table and filters
│   └── AddPropertiesPage.tsx  # Add property form
├── contexts/
│   └── ThemeContext.tsx       # Dark/light mode context
└── App.tsx                    # Routing configuration

server/
├── index.js                   # Express server and API endpoints
└── package.json               # Backend dependencies
```

## Notes

- The page is named "Admin Home" (not "Dashboard") as requested
- All tables are sortable and filterable
- Pagination is included for large datasets
- The design is fully responsive
- Mock data is used if the database is not configured

