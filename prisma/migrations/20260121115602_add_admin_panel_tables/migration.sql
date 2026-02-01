-- CreateEnum
CREATE TYPE "AdminPropertyStatus" AS ENUM ('ACTIVATED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "AdminSlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'DISABLED');

-- CreateEnum
CREATE TYPE "AdminBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "admin_properties" (
    "id" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "pricePerHour" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "status" "AdminPropertyStatus" NOT NULL DEFAULT 'ACTIVATED',
    "totalSlots" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_parking_slots" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "slotNumber" TEXT NOT NULL,
    "status" "AdminSlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_bookings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "AdminBookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "registeredDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_parking_slots_propertyId_slotNumber_key" ON "admin_parking_slots"("propertyId", "slotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admin_customers_email_key" ON "admin_customers"("email");

-- AddForeignKey
ALTER TABLE "admin_parking_slots" ADD CONSTRAINT "admin_parking_slots_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "admin_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bookings" ADD CONSTRAINT "admin_bookings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "admin_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bookings" ADD CONSTRAINT "admin_bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "admin_parking_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bookings" ADD CONSTRAINT "admin_bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "admin_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
