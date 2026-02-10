-- Add address column and unique constraint for contact number (PostgreSQL)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_contactNo_key" ON "users" ("contactNo");
