-- Add flight_speed column to missions table
ALTER TABLE missions ADD COLUMN IF NOT EXISTS flight_speed DECIMAL(10, 2) DEFAULT 5.0;

-- Comment on the new column
COMMENT ON COLUMN missions.flight_speed IS 'Flight speed in meters per second'; 