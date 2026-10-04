-- CreateIndex
CREATE INDEX IF NOT EXISTS "Tour_isLive_createdAt_idx" ON "Tour"("isLive", "createdAt");
