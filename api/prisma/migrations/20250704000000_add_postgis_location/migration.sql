-- PostGIS geography column and index for places
-- This migration adds spatial support for efficient geo queries

-- Ensure PostGIS extension is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column for spatial queries
ALTER TABLE places ADD COLUMN location geography(Point, 4326);

-- Populate location from existing latitude/longitude
UPDATE places SET location = ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326);

-- Create GiST index for fast spatial queries
CREATE INDEX idx_places_location ON places USING GIST (location);

-- Make location NOT NULL after migration
ALTER TABLE places ALTER COLUMN location SET NOT NULL;
