-- CreateTable
CREATE TABLE IF NOT EXISTS "TourTravelGuide" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourTravelGuide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TourTravelGuide_tourId_guideId_key" ON "TourTravelGuide"("tourId", "guideId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TourTravelGuide_tourId_displayOrder_idx" ON "TourTravelGuide"("tourId", "displayOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TourTravelGuide_guideId_idx" ON "TourTravelGuide"("guideId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelGuide_tourId_fkey'
    ) THEN
        ALTER TABLE "TourTravelGuide" ADD CONSTRAINT "TourTravelGuide_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelGuide_guideId_fkey'
    ) THEN
        ALTER TABLE "TourTravelGuide" ADD CONSTRAINT "TourTravelGuide_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "SeoLandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
