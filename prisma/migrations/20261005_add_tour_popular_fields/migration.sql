-- AlterTable
ALTER TABLE "Tour" ADD COLUMN IF NOT EXISTS "isPopular" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tour" ADD COLUMN IF NOT EXISTS "popularOrder" INTEGER;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Tour_isLive_isPopular_popularOrder_idx" ON "Tour"("isLive", "isPopular", "popularOrder");
