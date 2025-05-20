-- Add sensor_type column to missions table
ALTER TABLE missions ADD COLUMN IF NOT EXISTS sensor_type VARCHAR(50) DEFAULT 'rgb';

-- Comment on the new column
COMMENT ON COLUMN missions.sensor_type IS 'Type of sensor used for this mission (e.g., rgb, thermal, multispectral)'; 