-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drones table
CREATE TABLE drones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'idle',
    battery_level INTEGER NOT NULL DEFAULT 100,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    altitude DECIMAL(10, 2),
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Missions table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    drone_id UUID REFERENCES drones(id),
    created_by UUID REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    flight_altitude DECIMAL(10, 2) NOT NULL,
    -- Store survey area as a JSON array of coordinates
    survey_area_coordinates JSONB,
    data_collection_frequency INTEGER NOT NULL, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Waypoints table
CREATE TABLE waypoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(10, 2) NOT NULL,
    action VARCHAR(50), -- e.g., 'take_photo', 'hover', etc.
    wait_time INTEGER DEFAULT 0, -- time to wait at waypoint in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mission Reports table
CREATE TABLE mission_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    flight_duration INTEGER NOT NULL, -- in seconds
    distance_covered DECIMAL(10, 2) NOT NULL, -- in meters
    battery_consumed INTEGER NOT NULL, -- percentage
    waypoints_completed INTEGER NOT NULL,
    total_waypoints INTEGER NOT NULL,
    average_altitude DECIMAL(10, 2) NOT NULL,
    mission_success BOOLEAN NOT NULL DEFAULT true,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mission Events table (for real-time tracking)
CREATE TABLE mission_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- e.g., 'started', 'paused', 'resumed', 'completed', 'aborted'
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);

-- Indexes
CREATE INDEX idx_drones_status ON drones(status);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_drone_id ON missions(drone_id);
CREATE INDEX idx_waypoints_mission_id ON waypoints(mission_id);
CREATE INDEX idx_mission_reports_mission_id ON mission_reports(mission_id);
CREATE INDEX idx_mission_events_mission_id ON mission_events(mission_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drones_updated_at
    BEFORE UPDATE ON drones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 