/**
 * Admin API Index
 * 
 * This module exports all admin-related API functionality.
 * All APIs use the unified database tables (shared with frontend).
 * 
 * Available endpoints:
 * - /api/admin/properties - Property management
 * - /api/admin/bookings - Booking management
 */

export * from './properties/route';
export * from './bookings/route';
