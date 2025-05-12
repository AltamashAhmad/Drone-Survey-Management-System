# Drone Survey Management System - Technical Documentation

This technical documentation provides detailed information about the architecture, components, and implementation of the Drone Survey Management System.

## System Architecture

### Overview

The Drone Survey Management System follows a client-server architecture with:
- React.js frontend for user interface
- Node.js/Express backend for API services
- PostgreSQL database for data storage
- Socket.io for real-time communication

### Architecture Diagram

![Drone Survey Management System Architecture](../screenshots/Architecture%20Diagram.png)

The system architecture consists of:
- **React Frontend**: Provides the user interface for interacting with the system
- **Express Backend**: Handles API requests, business logic, and data processing
- **PostgreSQL Database**: Stores all persistent data (drones, missions, locations, etc.)
- **Socket.io Client/Server**: Enables real-time bidirectional communication between frontend and backend

## Database Schema

### Entity Relationship Diagram

The system uses the following database tables:

1. **users**: System users with different roles
2. **drones**: UAV devices used for surveys
3. **missions**: Planned and executed survey missions
4. **locations**: Survey sites and areas of interest
5. **waypoints**: Flight path points for missions
6. **mission_logs**: Events and status updates during missions
7. **survey_reports**: Results and analytics from completed missions
8. **collected_data**: Raw and processed data from surveys

### Table Definitions

#### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### drones
```sql
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
```

#### missions
```sql
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
```

#### locations
```sql
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
```

For complete schema definitions, refer to the `db/schema.sql` file.

## Backend API

### Endpoints

#### Drones API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/drones | Get all drones |
| GET    | /api/drones/:id | Get a specific drone |
| POST   | /api/drones | Create a new drone |
| PUT    | /api/drones/:id | Update a drone |
| DELETE | /api/drones/:id | Delete a drone |
| GET    | /api/drones/:id/mission | Get the current mission for a drone |

#### Missions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/missions | Get all missions |
| GET    | /api/missions/:id | Get a specific mission |
| POST   | /api/missions | Create a new mission |
| PUT    | /api/missions/:id | Update a mission |
| DELETE | /api/missions/:id | Delete a mission |
| POST   | /api/missions/:id/start | Start a mission |
| POST   | /api/missions/:id/pause | Pause a mission |
| POST   | /api/missions/:id/resume | Resume a paused mission |
| POST   | /api/missions/:id/abort | Abort a mission |

#### Locations API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/locations | Get all locations |
| GET    | /api/locations/:id | Get a specific location |
| POST   | /api/locations | Create a new location |
| PUT    | /api/locations/:id | Update a location |
| DELETE | /api/locations/:id | Delete a location |

#### Reports API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/reports | Get all reports |
| GET    | /api/reports/:id | Get a specific report |
| GET    | /api/reports/mission/:missionId | Get reports for a specific mission |
| GET    | /api/reports/location/:locationId | Get reports for a specific location |
| GET    | /api/reports/statistics | Get organization-wide statistics |
| POST   | /api/reports | Create a new report |

### API Request/Response Examples

#### Create a new drone

Request:
```json
POST /api/drones
Content-Type: application/json

{
  "name": "Surveyor-1",
  "model": "DJI Phantom 4 Pro",
  "status": "idle",
  "battery_level": 100,
  "location_lat": 37.7749,
  "location_lng": -122.4194,
  "altitude": 0
}
```

Response:
```json
{
  "id": 1,
  "name": "Surveyor-1",
  "model": "DJI Phantom 4 Pro",
  "status": "idle",
  "battery_level": 100,
  "location_lat": "37.77490000",
  "location_lng": "-122.41940000",
  "altitude": "0.00",
  "created_at": "2023-05-12T12:00:00.000Z"
}
```

## Frontend Components

### Component Structure

```
src/
├── components/
│   ├── dashboard/
│   │   └── Dashboard.js
│   ├── fleet/
│   │   ├── DroneFormDialog.jsx
│   │   └── FleetManagement.jsx
│   ├── layout/
│   │   └── Header.jsx
│   ├── locations/
│   │   └── LocationManager.jsx
│   ├── missions/
│   │   ├── MissionMonitor.jsx
│   │   ├── MissionPlanner.jsx
│   │   └── Missions.jsx
│   ├── reports/
│   │   └── index.js
│   └── MissionPlanning/
│       └── MissionPlanner.jsx
├── services/
│   ├── api.js
│   ├── droneService.js
│   ├── missionService.js
│   └── reportService.js
└── App.js
```

### Key Components

#### Fleet Management

The `FleetManagement.jsx` component provides an interface for managing drones:
- Displays a list of all drones with their status
- Allows adding new drones via the `DroneFormDialog.jsx` component
- Enables editing and deleting drones
- Shows fleet statistics (total drones, available drones, etc.)

#### Mission Planning

The `MissionPlanner.jsx` component enables users to:
- Define survey areas using map drawing tools
- Configure mission parameters (altitude, speed, etc.)
- Select survey patterns (grid, crosshatch, perimeter)
- Generate and customize waypoints
- Save and start missions

#### Mission Monitoring

The `MissionMonitor.jsx` component provides:
- Real-time tracking of drone position on a map
- Mission progress indicators
- Telemetry data visualization
- Mission control actions (start, pause, resume, abort)

#### Reports

The `reports/index.js` component offers:
- Survey report visualization
- Statistical analysis of mission data
- Charts and graphs for data interpretation
- Export functionality for reports

## Real-time Communication

### Socket.io Events

The system uses Socket.io for real-time updates:

#### Client Events (Emitted by frontend)

| Event | Data | Description |
|-------|------|-------------|
| drone:update | { id, location_lat, location_lng, altitude, battery_level, status } | Update drone position and status |

#### Server Events (Emitted by backend)

| Event | Data | Description |
|-------|------|-------------|
| drone:updated | { id, location_lat, location_lng, altitude, battery_level, status } | Broadcast drone updates to all clients |

## Extending the System

### Adding a New Feature

To add a new feature to the system:

1. **Backend**:
   - Create or modify controller functions in the appropriate controller file
   - Add new routes in the corresponding routes file
   - Update database schema if necessary

2. **Frontend**:
   - Add new service functions in the appropriate service file
   - Create new components or modify existing ones
   - Update the UI to incorporate the new feature

### Adding a New Survey Pattern

To add a new survey pattern:

1. Update the `MissionPlanner.jsx` component to include the new pattern option
2. Implement the waypoint generation algorithm for the new pattern
3. Update the database schema to include the new pattern type
4. Update the mission controller to handle the new pattern

## Deployment

### Production Setup

For production deployment:

1. **Backend**:
   - Set appropriate environment variables
   - Use a process manager like PM2
   - Set up a reverse proxy with Nginx or Apache

2. **Frontend**:
   - Build the React application with `npm run build`
   - Serve the static files via a web server

### Environment Variables

**Backend (.env)**:
```
NODE_ENV=production
PORT=5001
DB_HOST=production-db-host
DB_PORT=5432
DB_USER=production-user
DB_PASSWORD=secure-password
DB_NAME=drone_survey_system
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend (.env)**:
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

## Testing

### Backend Testing

Run backend tests:
```bash
cd backend
npm test
```

### Frontend Testing

Run frontend tests:
```bash
cd frontend
npm test
```

### End-to-End Testing

Run the complete test suite:
```bash
./test-all.sh
``` 