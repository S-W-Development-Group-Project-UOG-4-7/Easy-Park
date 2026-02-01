-- CreateEnum
CREATE TYPE "ParkingLocationStatus" AS ENUM ('ACTIVATED', 'NOT_ACTIVATED');

-- CreateEnum
CREATE TYPE "WasherBookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "parking_locations" ADD COLUMN     "pricePerDay" DOUBLE PRECISION NOT NULL DEFAULT 2000,
ADD COLUMN     "pricePerHour" DOUBLE PRECISION NOT NULL DEFAULT 300,
ADD COLUMN     "status" "ParkingLocationStatus" NOT NULL DEFAULT 'NOT_ACTIVATED';

-- CreateTable
CREATE TABLE "washer_customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleDetails" TEXT NOT NULL,
    "otherRelevantInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "washer_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "washer_bookings" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "slotTime" TIMESTAMP(3) NOT NULL,
    "vehicle" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "status" "WasherBookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "washer_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "washer_notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "bookingId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "washer_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "washer_customers_email_key" ON "washer_customers"("email");

-- AddForeignKey
ALTER TABLE "washer_bookings" ADD CONSTRAINT "washer_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "washer_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
