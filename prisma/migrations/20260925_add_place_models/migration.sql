-- CreateTable
CREATE TABLE IF NOT EXISTS "Place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "destination" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DestinationPlace" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Place_destination_idx" ON "Place"("destination");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Place_status_idx" ON "Place"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DestinationPlace_destinationId_placeId_key" ON "DestinationPlace"("destinationId", "placeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DestinationPlace_destinationId_displayOrder_idx" ON "DestinationPlace"("destinationId", "displayOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DestinationPlace_placeId_idx" ON "DestinationPlace"("placeId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DestinationPlace_destinationId_fkey'
    ) THEN
        ALTER TABLE "DestinationPlace" ADD CONSTRAINT "DestinationPlace_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "SeoLandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DestinationPlace_placeId_fkey'
    ) THEN
        ALTER TABLE "DestinationPlace" ADD CONSTRAINT "DestinationPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
