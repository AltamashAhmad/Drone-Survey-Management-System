CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'survey_site', -- survey_site, construction, environmental, industrial
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'idle', -- idle, in_mission, maintenance, offline
  battery_level INTEGER DEFAULT 100,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  altitude DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE missions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  drone_id INTEGER REFERENCES drones(id),
  location_id INTEGER REFERENCES locations(id),
  status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, aborted, paused
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  flight_altitude DECIMAL(10, 2) NOT NULL,
  flight_speed DECIMAL(10, 2) DEFAULT 15.0,
  overlap_percentage INTEGER DEFAULT 60,
  data_collection_frequency INTEGER DEFAULT 5, -- seconds
  survey_pattern VARCHAR(50) DEFAULT 'grid', -- grid, crosshatch, perimeter
  sensor_type VARCHAR(50) DEFAULT 'rgb', -- rgb, multispectral, thermal, lidar, hyperspectral
  survey_area JSONB, -- GeoJSON data for the survey area
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  advanced_parameters JSONB -- Store sensor-specific and other advanced parameters
);

CREATE TABLE waypoints (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER REFERENCES missions(id),
  sequence_number INTEGER NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(10, 2),
  action VARCHAR(50) DEFAULT 'capture', -- capture, hover, land, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mission_logs (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER REFERENCES missions(id),
  drone_id INTEGER REFERENCES drones(id),
  event_type VARCHAR(50) NOT NULL, -- start, pause, resume, abort, complete, waypoint_reached, battery_warning
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSONB
);

CREATE TABLE survey_reports (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER REFERENCES missions(id),
  flight_duration INTEGER, -- seconds
  distance_flown DECIMAL(10, 2), -- meters
  area_covered DECIMAL(10, 2), -- square meters
  waypoints_completed INTEGER,
  data_collected DECIMAL(10, 2), -- MB
  sensor_type VARCHAR(50),
  battery_consumed INTEGER, -- percentage
  image_count INTEGER,
  location_id INTEGER REFERENCES locations(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  report_data JSONB -- For storing detailed report data
);

CREATE TABLE collected_data (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER REFERENCES missions(id),
  waypoint_id INTEGER REFERENCES waypoints(id),
  data_type VARCHAR(50) NOT NULL, -- image, sensor_reading, etc.
  file_path TEXT,
  metadata JSONB, -- position, timestamp, sensor info, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
