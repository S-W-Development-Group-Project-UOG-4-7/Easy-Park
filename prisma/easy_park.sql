-- 1) Create database
CREATE DATABASE easy_park;

-- 2) Connect (run this in pgAdmin Query Tool connected to postgres, then switch DB)
-- \c easy_park

-- 3) Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 4) Enums (aligned with prisma/schema.prisma)
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'CUSTOMER', 'LANDOWNER', 'WASHER', 'COUNTER');
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVATED', 'NOT_ACTIVATED');
CREATE TYPE "SlotType" AS ENUM ('NORMAL', 'EV', 'CAR_WASH');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "GatewayStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "WashStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED');

-- 5) Tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT UNIQUE,
  nic TEXT UNIQUE,
  residential_address TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  id SMALLSERIAL PRIMARY KEY,
  name "RoleName" NOT NULL UNIQUE
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  property_name TEXT NOT NULL,
  address TEXT NOT NULL,
  price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'LKR',
  status "PropertyStatus" NOT NULL DEFAULT 'NOT_ACTIVATED',
  total_slots INTEGER NOT NULL DEFAULT 0,
  total_normal_slots INTEGER NOT NULL DEFAULT 0,
  total_ev_slots INTEGER NOT NULL DEFAULT 0,
  total_car_wash_slots INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_properties_totals
    CHECK (total_slots = total_normal_slots + total_ev_slots + total_car_wash_slots),
  CONSTRAINT chk_properties_prices_nonnegative
    CHECK (price_per_hour >= 0 AND price_per_day >= 0)
);

CREATE TABLE parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  slot_number TEXT NOT NULL,
  slot_type "SlotType" NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_parking_slot_property_number UNIQUE (property_id, slot_number)
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL UNIQUE,
  type TEXT,
  model TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status "BookingStatus" NOT NULL DEFAULT 'PENDING',
  parking_type "SlotType" NOT NULL DEFAULT 'NORMAL',
  booking_type TEXT NOT NULL DEFAULT 'NORMAL',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_booking_time CHECK (end_time > start_time)
);

CREATE TABLE booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES parking_slots(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_booking_slot UNIQUE (booking_id, slot_id)
);

CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_summary (
  booking_id UUID PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  online_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  cash_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'LKR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_payment_summary_nonnegative
    CHECK (total_amount >= 0 AND online_paid >= 0 AND cash_paid >= 0),
  CONSTRAINT chk_payment_summary_balance
    CHECK (balance_due = total_amount - (online_paid + cash_paid))
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'LKR',
  method "PaymentMethod" NOT NULL,
  payment_status "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  gateway_status "GatewayStatus" NOT NULL DEFAULT 'PENDING',
  gateway_provider TEXT,
  transaction_id TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_card_exp_month_range
    CHECK (card_exp_month IS NULL OR (card_exp_month BETWEEN 1 AND 12))
);

CREATE TABLE wash_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_slot_id UUID NOT NULL UNIQUE REFERENCES booking_slots(id) ON DELETE CASCADE,
  washer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status "WashStatus" NOT NULL DEFAULT 'PENDING',
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE counter_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6) Indexes
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);

CREATE INDEX idx_parking_slots_property_id ON parking_slots(property_id);
CREATE INDEX idx_parking_slots_slot_type ON parking_slots(slot_type);

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_time_range ON bookings(start_time, end_time);
CREATE INDEX idx_bookings_created_by ON bookings(created_by);

CREATE INDEX idx_booking_slots_slot_id ON booking_slots(slot_id);

CREATE INDEX idx_booking_status_history_booking_changed_at ON booking_status_history(booking_id, changed_at);
CREATE INDEX idx_booking_status_history_changed_by ON booking_status_history(changed_by);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_booking_status ON payments(booking_id, payment_status);

CREATE INDEX idx_wash_jobs_status ON wash_jobs(status);
CREATE INDEX idx_wash_jobs_washer_status ON wash_jobs(washer_id, status);

CREATE INDEX idx_counter_transactions_counter_user_id ON counter_transactions(counter_user_id);
CREATE INDEX idx_counter_transactions_booking_id ON counter_transactions(booking_id);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- 7) Seed script
INSERT INTO roles(name) VALUES
  ('ADMIN'),
  ('CUSTOMER'),
  ('LANDOWNER'),
  ('WASHER'),
  ('COUNTER')
ON CONFLICT (name) DO NOTHING;

-- Replace with your real admin credentials/hash before production use.
-- Example hash placeholder only:
INSERT INTO users(full_name, email, password_hash, is_active)
VALUES ('System Admin', 'admin@easypark.local', '$2b$12$REPLACE_WITH_BCRYPT_HASH', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'admin@easypark.local'
ON CONFLICT (user_id, role_id) DO NOTHING;
