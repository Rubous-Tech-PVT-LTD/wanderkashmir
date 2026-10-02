-- ==============================================================================
-- CORRECTIVE MIGRATION: 20261002_v2_schema_repair
-- Purpose: Safely and idempotently create missing V2 schema objects in the
--          shared production Neon database without affecting existing V1 data.
-- Non-destructive: Uses IF NOT EXISTS for all types, columns, tables, and constraints.
-- ==============================================================================

-- 1. PropertyType Enum & Property.propertyType column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PropertyType') THEN
        CREATE TYPE "PropertyType" AS ENUM ('HOTEL', 'RESORT', 'HOMESTAY', 'HOUSEBOAT');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Property' AND column_name = 'propertyType'
    ) THEN
        ALTER TABLE "Property" ADD COLUMN "propertyType" "PropertyType" NOT NULL DEFAULT 'HOTEL';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Property_propertyType_idx" ON "Property"("propertyType");

-- 2. Place Table
CREATE TABLE IF NOT EXISTS "Place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "destination" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Place_slug_key" ON "Place"("slug");
CREATE INDEX IF NOT EXISTS "Place_destination_idx" ON "Place"("destination");
CREATE INDEX IF NOT EXISTS "Place_status_idx" ON "Place"("status");

-- 3. DestinationPlace Table
CREATE TABLE IF NOT EXISTS "DestinationPlace" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DestinationPlace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DestinationPlace_destinationId_placeId_key" ON "DestinationPlace"("destinationId", "placeId");
CREATE INDEX IF NOT EXISTS "DestinationPlace_destinationId_displayOrder_idx" ON "DestinationPlace"("destinationId", "displayOrder");
CREATE INDEX IF NOT EXISTS "DestinationPlace_placeId_idx" ON "DestinationPlace"("placeId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DestinationPlace_destinationId_fkey'
    ) THEN
        ALTER TABLE "DestinationPlace" ADD CONSTRAINT "DestinationPlace_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "SeoLandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DestinationPlace_placeId_fkey'
    ) THEN
        ALTER TABLE "DestinationPlace" ADD CONSTRAINT "DestinationPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. TravelStyle Table
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

CREATE UNIQUE INDEX IF NOT EXISTS "TravelStyle_name_key" ON "TravelStyle"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "TravelStyle_slug_key" ON "TravelStyle"("slug");

-- 5. TourTravelStyle Table
CREATE TABLE IF NOT EXISTS "TourTravelStyle" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "travelStyleId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourTravelStyle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TourTravelStyle_tourId_travelStyleId_key" ON "TourTravelStyle"("tourId", "travelStyleId");
CREATE INDEX IF NOT EXISTS "TourTravelStyle_tourId_idx" ON "TourTravelStyle"("tourId");
CREATE INDEX IF NOT EXISTS "TourTravelStyle_travelStyleId_idx" ON "TourTravelStyle"("travelStyleId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelStyle_tourId_fkey'
    ) THEN
        ALTER TABLE "TourTravelStyle" ADD CONSTRAINT "TourTravelStyle_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelStyle_travelStyleId_fkey'
    ) THEN
        ALTER TABLE "TourTravelStyle" ADD CONSTRAINT "TourTravelStyle_travelStyleId_fkey" FOREIGN KEY ("travelStyleId") REFERENCES "TravelStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Experience Table
CREATE TABLE IF NOT EXISTS "Experience" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "destination" TEXT NOT NULL,
    "duration" TEXT,
    "basePrice" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Experience_slug_key" ON "Experience"("slug");

-- 7. TourExperience Table
CREATE TABLE IF NOT EXISTS "TourExperience" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "dayNumber" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourExperience_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TourExperience_tourId_experienceId_key" ON "TourExperience"("tourId", "experienceId");
CREATE INDEX IF NOT EXISTS "TourExperience_tourId_idx" ON "TourExperience"("tourId");
CREATE INDEX IF NOT EXISTS "TourExperience_experienceId_idx" ON "TourExperience"("experienceId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourExperience_tourId_fkey'
    ) THEN
        ALTER TABLE "TourExperience" ADD CONSTRAINT "TourExperience_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourExperience_experienceId_fkey'
    ) THEN
        ALTER TABLE "TourExperience" ADD CONSTRAINT "TourExperience_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 8. TourTransport Table
CREATE TABLE IF NOT EXISTS "TourTransport" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourTransport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TourTransport_tourId_idx" ON "TourTransport"("tourId");
CREATE INDEX IF NOT EXISTS "TourTransport_vehicleId_idx" ON "TourTransport"("vehicleId");
CREATE INDEX IF NOT EXISTS "TourTransport_driverId_idx" ON "TourTransport"("driverId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTransport_tourId_fkey'
    ) THEN
        ALTER TABLE "TourTransport" ADD CONSTRAINT "TourTransport_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTransport_vehicleId_fkey'
    ) THEN
        ALTER TABLE "TourTransport" ADD CONSTRAINT "TourTransport_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTransport_driverId_fkey'
    ) THEN
        ALTER TABLE "TourTransport" ADD CONSTRAINT "TourTransport_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 9. TourTravelGuide Table
CREATE TABLE IF NOT EXISTS "TourTravelGuide" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourTravelGuide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TourTravelGuide_tourId_guideId_key" ON "TourTravelGuide"("tourId", "guideId");
CREATE INDEX IF NOT EXISTS "TourTravelGuide_tourId_displayOrder_idx" ON "TourTravelGuide"("tourId", "displayOrder");
CREATE INDEX IF NOT EXISTS "TourTravelGuide_guideId_idx" ON "TourTravelGuide"("guideId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelGuide_tourId_fkey'
    ) THEN
        ALTER TABLE "TourTravelGuide" ADD CONSTRAINT "TourTravelGuide_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourTravelGuide_guideId_fkey'
    ) THEN
        ALTER TABLE "TourTravelGuide" ADD CONSTRAINT "TourTravelGuide_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "SeoLandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 10. TourStay Table
CREATE TABLE IF NOT EXISTS "TourStay" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "stayType" TEXT,
    "propertyId" TEXT,
    "nights" INTEGER NOT NULL DEFAULT 1,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourStay_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TourStay_tourId_displayOrder_idx" ON "TourStay"("tourId", "displayOrder");
CREATE INDEX IF NOT EXISTS "TourStay_propertyId_idx" ON "TourStay"("propertyId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourStay_tourId_fkey'
    ) THEN
        ALTER TABLE "TourStay" ADD CONSTRAINT "TourStay_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TourStay_propertyId_fkey'
    ) THEN
        ALTER TABLE "TourStay" ADD CONSTRAINT "TourStay_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
