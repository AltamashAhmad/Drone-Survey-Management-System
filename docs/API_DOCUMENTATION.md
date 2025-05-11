# Drone Survey Management System - API Documentation

This document provides detailed information about the API endpoints available in the Drone Survey Management System.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:5001/api
```

For production environments, replace with your production API URL.

## Authentication

Authentication is required for all API endpoints except for the health check. Use JWT (JSON Web Token) authentication by including the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Common Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 500  | Server Error |

## Health Check

### Get API Health Status

```
GET /health
```

Check if the API and database are operational.

**Response Example:**
```json
{
  "status": "healthy",
  "time": "2023-05-12T12:00:00.000Z"
}
```

## Drones API

### Get All Drones

```
GET /drones
```

Retrieve a list of all drones in the system.

**Query Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| status    | string | Filter drones by status (idle, in_mission, maintenance, offline) |
| model     | string | Filter drones by model |

**Response Example:**
```json
[
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
  },
  {
    "id": 2,
    "name": "Mapper-2",
    "model": "DJI Mavic 3",
    "status": "in_mission",
    "battery_level": 85,
    "location_lat": "37.78490000",
    "location_lng": "-122.40940000",
    "altitude": "50.00",
    "created_at": "2023-05-12T12:30:00.000Z"
  }
]
```

### Get a Specific Drone

```
GET /drones/:id
```

Retrieve details for a specific drone.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Drone ID |

**Response Example:**
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

### Create a New Drone

```
POST /drones
```

Create a new drone in the system.

**Request Body:**
```json
{
  "name": "Surveyor-3",
  "model": "DJI Phantom 4 Pro",
  "status": "idle",
  "battery_level": 100,
  "location_lat": 37.7749,
  "location_lng": -122.4194,
  "altitude": 0
}
```

**Required Fields:**
- name
- model

**Response Example:**
```json
{
  "id": 3,
  "name": "Surveyor-3",
  "model": "DJI Phantom 4 Pro",
  "status": "idle",
  "battery_level": 100,
  "location_lat": "37.77490000",
  "location_lng": "-122.41940000",
  "altitude": "0.00",
  "created_at": "2023-05-12T13:00:00.000Z"
}
```

### Update a Drone

```
PUT /drones/:id
```

Update an existing drone.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Drone ID |

**Request Body:**
```json
{
  "status": "maintenance",
  "battery_level": 20
}
```

**Response Example:**
```json
{
  "id": 1,
  "name": "Surveyor-1",
  "model": "DJI Phantom 4 Pro",
  "status": "maintenance",
  "battery_level": 20,
  "location_lat": "37.77490000",
  "location_lng": "-122.41940000",
  "altitude": "0.00",
  "created_at": "2023-05-12T12:00:00.000Z"
}
```

### Delete a Drone

```
DELETE /drones/:id
```

Delete a drone from the system.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Drone ID |

**Response Example:**
```json
{
  "message": "Drone deleted successfully"
}
```

### Get Current Mission for a Drone

```
GET /drones/:id/mission
```

Get the current mission assigned to a drone.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Drone ID |

**Response Example:**
```json
{
  "id": 5,
  "name": "Site Survey Alpha",
  "description": "Comprehensive survey of construction site",
  "drone_id": 1,
  "location_id": 3,
  "status": "in_progress",
  "start_time": "2023-05-12T14:00:00.000Z",
  "end_time": null,
  "flight_altitude": "50.00",
  "flight_speed": "15.00",
  "overlap_percentage": 60,
  "data_collection_frequency": 5,
  "survey_pattern": "grid",
  "sensor_type": "rgb",
  "created_at": "2023-05-12T13:45:00.000Z"
}
```

## Missions API

### Get All Missions

```
GET /missions
```

Retrieve a list of all missions.

**Query Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| status    | string | Filter missions by status (planned, in_progress, completed, aborted, paused) |
| drone_id  | integer | Filter missions by drone ID |
| location_id | integer | Filter missions by location ID |

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Site Survey Alpha",
    "description": "Comprehensive survey of construction site",
    "drone_id": 1,
    "location_id": 3,
    "status": "completed",
    "start_time": "2023-05-10T10:00:00.000Z",
    "end_time": "2023-05-10T10:45:00.000Z",
    "flight_altitude": "50.00",
    "flight_speed": "15.00",
    "overlap_percentage": 60,
    "data_collection_frequency": 5,
    "survey_pattern": "grid",
    "sensor_type": "rgb",
    "created_at": "2023-05-10T09:45:00.000Z"
  },
  {
    "id": 2,
    "name": "Perimeter Inspection",
    "description": "Security perimeter inspection",
    "drone_id": 2,
    "location_id": 1,
    "status": "in_progress",
    "start_time": "2023-05-12T14:00:00.000Z",
    "end_time": null,
    "flight_altitude": "30.00",
    "flight_speed": "10.00",
    "overlap_percentage": 40,
    "data_collection_frequency": 3,
    "survey_pattern": "perimeter",
    "sensor_type": "thermal",
    "created_at": "2023-05-12T13:45:00.000Z"
  }
]
```

### Get a Specific Mission

```
GET /missions/:id
```

Retrieve details for a specific mission.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Mission ID |

**Response Example:**
```json
{
  "id": 1,
  "name": "Site Survey Alpha",
  "description": "Comprehensive survey of construction site",
  "drone_id": 1,
  "location_id": 3,
  "status": "completed",
  "start_time": "2023-05-10T10:00:00.000Z",
  "end_time": "2023-05-10T10:45:00.000Z",
  "flight_altitude": "50.00",
  "flight_speed": "15.00",
  "overlap_percentage": 60,
  "data_collection_frequency": 5,
  "survey_pattern": "grid",
  "sensor_type": "rgb",
  "created_at": "2023-05-10T09:45:00.000Z",
  "waypoints": [
    {
      "id": 1,
      "mission_id": 1,
      "sequence_number": 1,
      "latitude": "37.77500000",
      "longitude": "-122.41950000",
      "altitude": "50.00",
      "action": "capture"
    },
    {
      "id": 2,
      "mission_id": 1,
      "sequence_number": 2,
      "latitude": "37.77550000",
      "longitude": "-122.41950000",
      "altitude": "50.00",
      "action": "capture"
    }
  ]
}
```

### Create a New Mission

```
POST /missions
```

Create a new mission.

**Request Body:**
```json
{
  "name": "Environmental Survey",
  "description": "Survey of wetland area",
  "drone_id": 3,
  "location_id": 4,
  "flight_altitude": 40,
  "flight_speed": 12,
  "overlap_percentage": 70,
  "data_collection_frequency": 2,
  "survey_pattern": "crosshatch",
  "sensor_type": "multispectral",
  "survey_area": {
    "type": "Polygon",
    "coordinates": [
      [
        [-122.42, 37.78],
        [-122.41, 37.78],
        [-122.41, 37.77],
        [-122.42, 37.77],
        [-122.42, 37.78]
      ]
    ]
  }
}
```

**Required Fields:**
- name
- drone_id
- location_id
- flight_altitude

**Response Example:**
```json
{
  "id": 3,
  "name": "Environmental Survey",
  "description": "Survey of wetland area",
  "drone_id": 3,
  "location_id": 4,
  "status": "planned",
  "start_time": null,
  "end_time": null,
  "flight_altitude": "40.00",
  "flight_speed": "12.00",
  "overlap_percentage": 70,
  "data_collection_frequency": 2,
  "survey_pattern": "crosshatch",
  "sensor_type": "multispectral",
  "survey_area": {
    "type": "Polygon",
    "coordinates": [
      [
        [-122.42, 37.78],
        [-122.41, 37.78],
        [-122.41, 37.77],
        [-122.42, 37.77],
        [-122.42, 37.78]
      ]
    ]
  },
  "created_at": "2023-05-12T15:00:00.000Z"
}
```

### Update a Mission

```
PUT /missions/:id
```

Update an existing mission.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Mission ID |

**Request Body:**
```json
{
  "description": "Updated description",
  "flight_altitude": 45
}
```

**Response Example:**
```json
{
  "id": 3,
  "name": "Environmental Survey",
  "description": "Updated description",
  "drone_id": 3,
  "location_id": 4,
  "status": "planned",
  "start_time": null,
  "end_time": null,
  "flight_altitude": "45.00",
  "flight_speed": "12.00",
  "overlap_percentage": 70,
  "data_collection_frequency": 2,
  "survey_pattern": "crosshatch",
  "sensor_type": "multispectral",
  "created_at": "2023-05-12T15:00:00.000Z"
}
```

### Delete a Mission

```
DELETE /missions/:id
```

Delete a mission from the system.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Mission ID |

**Response Example:**
```json
{
  "message": "Mission deleted successfully"
}
```

### Start a Mission

```
POST /missions/:id/start
```

Start a planned mission.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Mission ID |

**Response Example:**
```json
{
  "id": 3,
  "status": "in_progress",
  "start_time": "2023-05-12T16:00:00.000Z",
  "message": "Mission started successfully"
}
```

### Pause a Mission

```
POST /missions/:id/pause
```

Pause an in-progress mission.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Mission ID |

**Response Example:**
```json
{
  "id": 3,
  "status": "paused",
  "message": "Mission paused successfully"
}
```

### Resume a Mission

```
POST /missions/:id/resume
```

Resume a paused mission.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Mission ID |

**Response Example:**
```json
{
  "id": 3,
  "status": "in_progress",
  "message": "Mission resumed successfully"
}
```

### Abort a Mission

```
POST /missions/:id/abort
```

Abort an in-progress or paused mission.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Mission ID |

**Response Example:**
```json
{
  "id": 3,
  "status": "aborted",
  "end_time": "2023-05-12T16:30:00.000Z",
  "message": "Mission aborted successfully"
}
```

## Locations API

### Get All Locations

```
GET /locations
```

Retrieve a list of all locations.

**Query Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| type      | string | Filter locations by type (survey_site, construction, environmental, industrial) |

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Headquarters",
    "description": "Main company headquarters",
    "type": "industrial",
    "latitude": "37.78490000",
    "longitude": "-122.40940000",
    "address": "123 Main St, San Francisco, CA",
    "created_at": "2023-05-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Construction Site Alpha",
    "description": "New office building construction",
    "type": "construction",
    "latitude": "37.77490000",
    "longitude": "-122.41940000",
    "address": "456 Market St, San Francisco, CA",
    "created_at": "2023-05-02T11:00:00.000Z"
  }
]
```

### Get a Specific Location

```
GET /locations/:id
```

Retrieve details for a specific location.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Location ID |

**Response Example:**
```json
{
  "id": 1,
  "name": "Headquarters",
  "description": "Main company headquarters",
  "type": "industrial",
  "latitude": "37.78490000",
  "longitude": "-122.40940000",
  "address": "123 Main St, San Francisco, CA",
  "notes": "Access through main gate",
  "created_at": "2023-05-01T10:00:00.000Z"
}
```

### Create a New Location

```
POST /locations
```

Create a new location.

**Request Body:**
```json
{
  "name": "Solar Farm",
  "description": "Solar panel installation",
  "type": "industrial",
  "latitude": 37.7649,
  "longitude": -122.4194,
  "address": "789 Solar Rd, San Francisco, CA",
  "notes": "Restricted access area"
}
```

**Required Fields:**
- name
- latitude
- longitude

**Response Example:**
```json
{
  "id": 3,
  "name": "Solar Farm",
  "description": "Solar panel installation",
  "type": "industrial",
  "latitude": "37.76490000",
  "longitude": "-122.41940000",
  "address": "789 Solar Rd, San Francisco, CA",
  "notes": "Restricted access area",
  "created_at": "2023-05-12T17:00:00.000Z"
}
```

### Update a Location

```
PUT /locations/:id
```

Update an existing location.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Location ID |

**Request Body:**
```json
{
  "description": "Updated description",
  "notes": "Updated access information"
}
```

**Response Example:**
```json
{
  "id": 3,
  "name": "Solar Farm",
  "description": "Updated description",
  "type": "industrial",
  "latitude": "37.76490000",
  "longitude": "-122.41940000",
  "address": "789 Solar Rd, San Francisco, CA",
  "notes": "Updated access information",
  "created_at": "2023-05-12T17:00:00.000Z"
}
```

### Delete a Location

```
DELETE /locations/:id
```

Delete a location from the system.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Location ID |

**Response Example:**
```json
{
  "message": "Location deleted successfully"
}
```

## Reports API

### Get All Reports

```
GET /reports
```

Retrieve a list of all survey reports.

**Query Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| mission_id | integer | Filter reports by mission ID |
| location_id | integer | Filter reports by location ID |

**Response Example:**
```json
[
  {
    "id": 1,
    "mission_id": 1,
    "mission_name": "Site Survey Alpha",
    "location_id": 3,
    "location_name": "Construction Site Alpha",
    "flight_duration": 2700,
    "distance_flown": 1500.5,
    "area_covered": 10000.0,
    "waypoints_completed": 15,
    "data_collected": 256.7,
    "sensor_type": "rgb",
    "battery_consumed": 35,
    "image_count": 120,
    "created_at": "2023-05-10T11:00:00.000Z"
  },
  {
    "id": 2,
    "mission_id": 2,
    "mission_name": "Perimeter Inspection",
    "location_id": 1,
    "location_name": "Headquarters",
    "flight_duration": 1800,
    "distance_flown": 1200.0,
    "area_covered": 8000.0,
    "waypoints_completed": 12,
    "data_collected": 150.3,
    "sensor_type": "thermal",
    "battery_consumed": 25,
    "image_count": 80,
    "created_at": "2023-05-12T15:00:00.000Z"
  }
]
```

### Get a Specific Report

```
GET /reports/:id
```

Retrieve details for a specific report.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | integer | Report ID |

**Response Example:**
```json
{
  "id": 1,
  "mission_id": 1,
  "mission_name": "Site Survey Alpha",
  "location_id": 3,
  "location_name": "Construction Site Alpha",
  "flight_duration": 2700,
  "distance_flown": 1500.5,
  "area_covered": 10000.0,
  "waypoints_completed": 15,
  "data_collected": 256.7,
  "sensor_type": "rgb",
  "battery_consumed": 35,
  "image_count": 120,
  "created_at": "2023-05-10T11:00:00.000Z",
  "report_data": {
    "quality": "high",
    "coverage": "complete",
    "anomalies": ["vegetation_stress", "erosion"]
  }
}
```

### Get Reports for a Specific Mission

```
GET /reports/mission/:missionId
```

Retrieve all reports for a specific mission.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| missionId | integer | Mission ID |

**Response Example:**
```json
[
  {
    "id": 1,
    "mission_id": 1,
    "mission_name": "Site Survey Alpha",
    "location_id": 3,
    "location_name": "Construction Site Alpha",
    "flight_duration": 2700,
    "distance_flown": 1500.5,
    "area_covered": 10000.0,
    "waypoints_completed": 15,
    "data_collected": 256.7,
    "sensor_type": "rgb",
    "battery_consumed": 35,
    "image_count": 120,
    "created_at": "2023-05-10T11:00:00.000Z"
  }
]
```

### Get Reports for a Specific Location

```
GET /reports/location/:locationId
```

Retrieve all reports for a specific location.

**Path Parameters:**

| Parameter | Type   | Description |
|-----------|--------|-------------|
| locationId | integer | Location ID |

**Response Example:**
```json
[
  {
    "id": 2,
    "mission_id": 2,
    "mission_name": "Perimeter Inspection",
    "location_id": 1,
    "location_name": "Headquarters",
    "flight_duration": 1800,
    "distance_flown": 1200.0,
    "area_covered": 8000.0,
    "waypoints_completed": 12,
    "data_collected": 150.3,
    "sensor_type": "thermal",
    "battery_consumed": 25,
    "image_count": 80,
    "created_at": "2023-05-12T15:00:00.000Z"
  }
]
```

### Get Organization-wide Statistics

```
GET /reports/statistics
```

Retrieve organization-wide survey statistics.

**Response Example:**
```json
{
  "total_surveys": 10,
  "total_missions": 8,
  "total_locations": 5,
  "total_flight_time": 25000,
  "total_distance": 15000.5,
  "total_area_covered": 95000.0,
  "total_images": 1200,
  "avg_battery_consumption": 32.5
}
```

### Create a New Report

```
POST /reports
```

Create a new survey report.

**Request Body:**
```json
{
  "mission_id": 3,
  "flight_duration": 1800,
  "distance_flown": 1500.0,
  "area_covered": 9000.0,
  "waypoints_completed": 14,
  "data_collected": 200.5,
  "sensor_type": "multispectral",
  "battery_consumed": 30,
  "image_count": 100,
  "location_id": 4,
  "report_data": {
    "quality": "high",
    "coverage": "complete",
    "anomalies": ["vegetation_stress"]
  }
}
```

**Required Fields:**
- mission_id

**Response Example:**
```json
{
  "id": 3,
  "mission_id": 3,
  "flight_duration": 1800,
  "distance_flown": 1500.0,
  "area_covered": 9000.0,
  "waypoints_completed": 14,
  "data_collected": 200.5,
  "sensor_type": "multispectral",
  "battery_consumed": 30,
  "image_count": 100,
  "location_id": 4,
  "report_data": {
    "quality": "high",
    "coverage": "complete",
    "anomalies": ["vegetation_stress"]
  },
  "created_at": "2023-05-12T18:00:00.000Z"
}
```

## Websocket Events

The API also provides real-time updates via WebSocket connections.

### Connection

Connect to the WebSocket server:

```javascript
const socket = io('http://localhost:5001');
```

### Events

#### Drone Updates

Listen for drone position and status updates:

```javascript
socket.on('drone:updated', (data) => {
  console.log('Drone updated:', data);
  // data = { id, location_lat, location_lng, altitude, battery_level, status }
});
```

Send drone position and status updates:

```javascript
socket.emit('drone:update', {
  id: 1,
  location_lat: 37.7749,
  location_lng: -122.4194,
  altitude: 50,
  battery_level: 85,
  status: 'in_mission'
});
``` 