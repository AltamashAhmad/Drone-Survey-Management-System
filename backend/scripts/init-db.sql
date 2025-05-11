-- Create database
CREATE DATABASE drone_survey_db;

\c drone_survey_db;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create drones table
CREATE TABLE drones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'idle',
    battery_level INTEGER DEFAULT 100,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    altitude DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create missions table
CREATE TABLE missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    drone_id INTEGER REFERENCES drones(id),
    status VARCHAR(50) DEFAULT 'planned',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    flight_altitude DECIMAL(10, 2),
    survey_pattern VARCHAR(50),
    overlap_percentage INTEGER,
    data_collection_frequency INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create waypoints table
CREATE TABLE waypoints (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mission_data table
CREATE TABLE mission_data (
    id SERIAL PRIMARY KEY,
    mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash)
VALUES ('admin', 'admin@example.com', '$2b$10$rM7ZUj5c1v4zB4kA7zq3E.9Z1Z4Q4Y4Q4Y4Q4Y4Q4Y4Q4Y4Q4Y');

-- Insert default drone
INSERT INTO drones (name, model, status)
VALUES ('Drone 1', 'DJI Mavic 2 Pro', 'idle'); 