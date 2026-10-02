-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PropertyType') THEN
        CREATE TYPE "PropertyType" AS ENUM ('HOTEL', 'RESORT', 'HOMESTAY', 'HOUSEBOAT');
    END IF;
END $$;

-- AlterTable
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Property' AND column_name = 'propertyType'
    ) THEN
        ALTER TABLE "Property" ADD COLUMN "propertyType" "PropertyType" NOT NULL DEFAULT 'HOTEL';
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Property_propertyType_idx" ON "Property"("propertyType");
