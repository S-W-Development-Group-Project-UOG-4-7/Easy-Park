-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminSlotType') THEN
        CREATE TYPE "AdminSlotType" AS ENUM ('NORMAL', 'EV', 'CAR_WASH');
    END IF;
END $$;

-- AlterTable
ALTER TABLE "admin_parking_slots"
ADD COLUMN IF NOT EXISTS "type" "AdminSlotType" NOT NULL DEFAULT 'NORMAL';

-- Backfill existing rows based on slot naming convention
UPDATE "admin_parking_slots"
SET "type" = CASE
    WHEN UPPER("slotNumber") LIKE 'EV%' THEN 'EV'::"AdminSlotType"
    WHEN UPPER("slotNumber") LIKE 'CW%' THEN 'CAR_WASH'::"AdminSlotType"
    ELSE 'NORMAL'::"AdminSlotType"
END;
