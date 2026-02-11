-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingType') THEN
        CREATE TYPE "BookingType" AS ENUM ('NORMAL', 'EV_SLOT', 'CAR_WASHING');
    END IF;
END $$;

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentCollectionStatus') THEN
        CREATE TYPE "PaymentCollectionStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID');
    END IF;
END $$;

-- Alter bookings with extensible booking/payment metadata
ALTER TABLE "bookings"
ADD COLUMN IF NOT EXISTS "bookingType" "BookingType" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN IF NOT EXISTS "extrasCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "extrasJson" JSONB,
ADD COLUMN IF NOT EXISTS "checkInTime" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "checkOutTime" TIMESTAMP(3);

-- Alter payments with richer payment summary fields
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'LKR',
ADD COLUMN IF NOT EXISTS "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "onlinePaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentCollectionStatus" NOT NULL DEFAULT 'UNPAID';

-- Backfill totals from existing booking/payment values
UPDATE "payments" p
SET
  "totalAmount" = COALESCE(b."totalAmount", p."amount", 0),
  "onlinePaid" = COALESCE(NULLIF(p."onlinePaid", 0), p."amount", 0)
FROM "bookings" b
WHERE b."id" = p."bookingId";

UPDATE "payments"
SET "paymentStatus" = CASE
  WHEN "onlinePaid" >= "totalAmount" AND "totalAmount" > 0 THEN 'PAID'::"PaymentCollectionStatus"
  WHEN "onlinePaid" > 0 AND "onlinePaid" < "totalAmount" THEN 'PARTIAL'::"PaymentCollectionStatus"
  ELSE 'UNPAID'::"PaymentCollectionStatus"
END;
