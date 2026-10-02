-- CreateTable
CREATE TABLE IF NOT EXISTS "TravelStyle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelStyle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TravelStyle_name_key" ON "TravelStyle"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "TravelStyle_slug_key" ON "TravelStyle"("slug");

-- CreateTable
CREATE TABLE IF NOT EXISTS "TourTravelStyle" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "travelStyleId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourTravelStyle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TourTravelStyle_tourId_travelStyleId_key" ON "TourTravelStyle"("tourId", "travelStyleId");
CREATE INDEX IF NOT EXISTS "TourTravelStyle_tourId_idx" ON "TourTravelStyle"("tourId");
CREATE INDEX IF NOT EXISTS "TourTravelStyle_travelStyleId_idx" ON "TourTravelStyle"("travelStyleId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelStyle_tourId_fkey'
    ) THEN
        ALTER TABLE "TourTravelStyle" ADD CONSTRAINT "TourTravelStyle_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelStyle_travelStyleId_fkey'
    ) THEN
        ALTER TABLE "TourTravelStyle" ADD CONSTRAINT "TourTravelStyle_travelStyleId_fkey" FOREIGN KEY ("travelStyleId") REFERENCES "TravelStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
