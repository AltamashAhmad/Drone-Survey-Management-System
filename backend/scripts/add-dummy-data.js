const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addDummyData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Adding dummy data to database...');
    console.log('Database:', process.env.DB_NAME);
    
    // 1. Add users
    console.log('Adding users...');
    const usersResult = await client.query(`
      INSERT INTO users (username, email, password_hash)
      VALUES 
        ('admin', 'admin@dronesurvey.com', '$2b$10$1JlHU4OuYnoVlJf.z7mKW.MEuoUnz7Rj7EgIQpNn5dkPYnxJ3fSVy'),
        ('operator1', 'operator1@dronesurvey.com', '$2b$10$1JlHU4OuYnoVlJf.z7mKW.MEuoUnz7Rj7EgIQpNn5dkPYnxJ3fSVy'),
        ('pilot1', 'pilot1@dronesurvey.com', '$2b$10$1JlHU4OuYnoVlJf.z7mKW.MEuoUnz7Rj7EgIQpNn5dkPYnxJ3fSVy'),
        ('analyst1', 'analyst1@dronesurvey.com', '$2b$10$1JlHU4OuYnoVlJf.z7mKW.MEuoUnz7Rj7EgIQpNn5dkPYnxJ3fSVy')
      RETURNING id
    `);
    const adminId = usersResult.rows[0].id;
    const operatorId = usersResult.rows[1].id;
    
    // 2. Add locations
    console.log('Adding locations...');
    const locationsResult = await client.query(`
      INSERT INTO locations (name, description, type, latitude, longitude, address, notes, created_by)
      VALUES 
        ('Construction Site Alpha', 'Main construction site for the new office building', 'construction', 37.7749, -122.4194, '123 Main St, San Francisco, CA', 'Access from north entrance', ${adminId}),
        ('Solar Farm Beta', 'Solar panel installation site', 'survey_site', 37.3352, -121.8811, '456 Energy Way, San Jose, CA', 'Restricted access, call ahead', ${operatorId}),
        ('Green Valley Park', 'Environmental monitoring site', 'environmental', 37.4419, -122.1430, '789 Park Ave, Palo Alto, CA', 'Public park, fly during off-hours', ${adminId}),
        ('Industrial Complex Delta', 'Factory roof inspection site', 'industrial', 37.8044, -122.2712, '101 Factory Rd, Oakland, CA', 'Permission required from security', ${operatorId})
      RETURNING id
    `);
    
    const locationIds = locationsResult.rows.map(row => row.id);
    
    // 3. Add drones
    console.log('Adding drones...');
    const dronesResult = await client.query(`
      INSERT INTO drones (name, model, status, battery_level, location_lat, location_lng, altitude)
      VALUES 
        ('Surveyor-1', 'DJI Phantom 4 RTK', 'idle', 100, 37.7749, -122.4194, 0),
        ('Mapper-2', 'DJI Matrice 300 RTK', 'idle', 95, 37.3352, -121.8811, 0),
        ('Inspector-3', 'Autel EVO II Pro', 'maintenance', 80, 37.4419, -122.1430, 0),
        ('Falcon-4', 'Skydio 2+', 'idle', 90, 37.8044, -122.2712, 0),
        ('Eagle-5', 'Parrot Anafi Thermal', 'offline', 60, null, null, 0)
      RETURNING id
    `);
    
    const droneIds = dronesResult.rows.map(row => row.id);
    
    // 4. Add missions
    console.log('Adding missions...');
    const missionsResult = await client.query(`
      INSERT INTO missions (
        name, description, drone_id, location_id, status, 
        start_time, end_time, flight_altitude, flight_speed, 
        overlap_percentage, data_collection_frequency, survey_pattern, 
        sensor_type, survey_area, created_by, advanced_parameters
      )
      VALUES 
        (
          'Initial Site Survey', 
          'Baseline survey of construction site', 
          ${droneIds[0]}, 
          ${locationIds[0]}, 
          'completed', 
          NOW() - INTERVAL '7 days', 
          NOW() - INTERVAL '7 days' + INTERVAL '2 hours', 
          50, 
          12.5, 
          70, 
          3, 
          'grid', 
          'rgb', 
          '{"type":"Polygon","coordinates":[[[-122.4200,37.7745],[-122.4190,37.7745],[-122.4190,37.7755],[-122.4200,37.7755],[-122.4200,37.7745]]]}', 
          ${adminId}, 
          '{"camera_settings":{"iso":100,"shutter":1000,"aperture":2.8}}'
        ),
        (
          'Solar Panel Inspection', 
          'Thermal inspection of solar farm', 
          ${droneIds[1]}, 
          ${locationIds[1]}, 
          'in_progress', 
          NOW() - INTERVAL '1 hour', 
          null, 
          30, 
          8.0, 
          80, 
          2, 
          'crosshatch', 
          'thermal', 
          '{"type":"Polygon","coordinates":[[[-121.8815,37.3350],[-121.8805,37.3350],[-121.8805,37.3360],[-121.8815,37.3360],[-121.8815,37.3350]]]}', 
          ${operatorId}, 
          '{"camera_settings":{"thermal_palette":"iron","temperature_range":{"min":10,"max":80}}}'
        ),
        (
          'Environmental Assessment', 
          'Vegetation health monitoring', 
          ${droneIds[2]}, 
          ${locationIds[2]}, 
          'planned', 
          NOW() + INTERVAL '1 day', 
          null, 
          60, 
          15.0, 
          65, 
          5, 
          'grid', 
          'multispectral', 
          '{"type":"Polygon","coordinates":[[[-122.1435,37.4415],[-122.1425,37.4415],[-122.1425,37.4425],[-122.1435,37.4425],[-122.1435,37.4415]]]}', 
          ${adminId}, 
          '{"bands":["red","green","blue","nir","red_edge"]}'
        ),
        (
          'Roof Inspection', 
          'Industrial complex roof assessment', 
          ${droneIds[3]}, 
          ${locationIds[3]}, 
          'completed', 
          NOW() - INTERVAL '3 days', 
          NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 
          25, 
          10.0, 
          60, 
          1, 
          'perimeter', 
          'rgb', 
          '{"type":"Polygon","coordinates":[[[-122.2717,37.8040],[-122.2707,37.8040],[-122.2707,37.8050],[-122.2717,37.8050],[-122.2717,37.8040]]]}', 
          ${operatorId}, 
          '{"camera_settings":{"iso":200,"shutter":500,"aperture":4.0}}'
        )
      RETURNING id
    `);
    
    const missionIds = missionsResult.rows.map(row => row.id);
    
    // 5. Add waypoints
    console.log('Adding waypoints...');
    await client.query(`
      INSERT INTO waypoints (mission_id, sequence_number, latitude, longitude, altitude, action)
      VALUES 
        (${missionIds[0]}, 1, 37.7746, -122.4199, 50, 'takeoff'),
        (${missionIds[0]}, 2, 37.7747, -122.4198, 50, 'capture'),
        (${missionIds[0]}, 3, 37.7748, -122.4197, 50, 'capture'),
        (${missionIds[0]}, 4, 37.7749, -122.4196, 50, 'capture'),
        (${missionIds[0]}, 5, 37.7750, -122.4195, 50, 'capture'),
        (${missionIds[0]}, 6, 37.7749, -122.4194, 10, 'land'),
        
        (${missionIds[1]}, 1, 37.3351, -121.8814, 30, 'takeoff'),
        (${missionIds[1]}, 2, 37.3352, -121.8813, 30, 'capture'),
        (${missionIds[1]}, 3, 37.3353, -121.8812, 30, 'capture'),
        (${missionIds[1]}, 4, 37.3354, -121.8811, 30, 'capture'),
        (${missionIds[1]}, 5, 37.3355, -121.8810, 30, 'capture'),
        
        (${missionIds[2]}, 1, 37.4418, -122.1434, 60, 'takeoff'),
        (${missionIds[2]}, 2, 37.4419, -122.1433, 60, 'capture'),
        (${missionIds[2]}, 3, 37.4420, -122.1432, 60, 'capture'),
        (${missionIds[2]}, 4, 37.4421, -122.1431, 60, 'capture'),
        (${missionIds[2]}, 5, 37.4422, -122.1430, 60, 'capture'),
        (${missionIds[2]}, 6, 37.4419, -122.1430, 10, 'land'),
        
        (${missionIds[3]}, 1, 37.8043, -122.2715, 25, 'takeoff'),
        (${missionIds[3]}, 2, 37.8044, -122.2714, 25, 'capture'),
        (${missionIds[3]}, 3, 37.8045, -122.2713, 25, 'capture'),
        (${missionIds[3]}, 4, 37.8046, -122.2712, 25, 'capture'),
        (${missionIds[3]}, 5, 37.8044, -122.2712, 10, 'land')
    `);
    
    // 6. Add mission logs
    console.log('Adding mission logs...');
    await client.query(`
      INSERT INTO mission_logs (mission_id, drone_id, event_type, event_time, details)
      VALUES 
        (${missionIds[0]}, ${droneIds[0]}, 'start', NOW() - INTERVAL '7 days', '{"message":"Mission started successfully"}'),
        (${missionIds[0]}, ${droneIds[0]}, 'waypoint_reached', NOW() - INTERVAL '7 days' + INTERVAL '10 minutes', '{"waypoint":1,"battery":95}'),
        (${missionIds[0]}, ${droneIds[0]}, 'waypoint_reached', NOW() - INTERVAL '7 days' + INTERVAL '20 minutes', '{"waypoint":2,"battery":90}'),
        (${missionIds[0]}, ${droneIds[0]}, 'waypoint_reached', NOW() - INTERVAL '7 days' + INTERVAL '30 minutes', '{"waypoint":3,"battery":85}'),
        (${missionIds[0]}, ${droneIds[0]}, 'waypoint_reached', NOW() - INTERVAL '7 days' + INTERVAL '40 minutes', '{"waypoint":4,"battery":80}'),
        (${missionIds[0]}, ${droneIds[0]}, 'waypoint_reached', NOW() - INTERVAL '7 days' + INTERVAL '50 minutes', '{"waypoint":5,"battery":75}'),
        (${missionIds[0]}, ${droneIds[0]}, 'complete', NOW() - INTERVAL '7 days' + INTERVAL '2 hours', '{"message":"Mission completed successfully","battery":70}'),
        
        (${missionIds[1]}, ${droneIds[1]}, 'start', NOW() - INTERVAL '1 hour', '{"message":"Mission started successfully"}'),
        (${missionIds[1]}, ${droneIds[1]}, 'waypoint_reached', NOW() - INTERVAL '50 minutes', '{"waypoint":1,"battery":90}'),
        (${missionIds[1]}, ${droneIds[1]}, 'waypoint_reached', NOW() - INTERVAL '40 minutes', '{"waypoint":2,"battery":85}'),
        (${missionIds[1]}, ${droneIds[1]}, 'battery_warning', NOW() - INTERVAL '30 minutes', '{"battery":20,"message":"Low battery warning"}'),
        
        (${missionIds[3]}, ${droneIds[3]}, 'start', NOW() - INTERVAL '3 days', '{"message":"Mission started successfully"}'),
        (${missionIds[3]}, ${droneIds[3]}, 'waypoint_reached', NOW() - INTERVAL '3 days' + INTERVAL '10 minutes', '{"waypoint":1,"battery":95}'),
        (${missionIds[3]}, ${droneIds[3]}, 'waypoint_reached', NOW() - INTERVAL '3 days' + INTERVAL '20 minutes', '{"waypoint":2,"battery":90}'),
        (${missionIds[3]}, ${droneIds[3]}, 'waypoint_reached', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes', '{"waypoint":3,"battery":85}'),
        (${missionIds[3]}, ${droneIds[3]}, 'waypoint_reached', NOW() - INTERVAL '3 days' + INTERVAL '40 minutes', '{"waypoint":4,"battery":80}'),
        (${missionIds[3]}, ${droneIds[3]}, 'complete', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', '{"message":"Mission completed successfully","battery":75}')
    `);
    
    // 7. Add survey reports
    console.log('Adding survey reports...');
    await client.query(`
      INSERT INTO survey_reports (
        mission_id, flight_duration, distance_flown, area_covered, 
        waypoints_completed, data_collected, sensor_type, 
        battery_consumed, image_count, location_id, report_data
      )
      VALUES 
        (
          ${missionIds[0]}, 
          7200, 
          1250.5, 
          15000.0, 
          5, 
          128.5, 
          'rgb', 
          30, 
          85, 
          ${locationIds[0]}, 
          '{"quality":"high","coverage":"complete","anomalies":["crack_detected","water_pooling"]}'
        ),
        (
          ${missionIds[3]}, 
          3600, 
          850.2, 
          5000.0, 
          4, 
          75.3, 
          'rgb', 
          20, 
          42, 
          ${locationIds[3]}, 
          '{"quality":"medium","coverage":"partial","anomalies":["structural_damage"]}'
        )
    `);
    
    // 8. Add collected data
    console.log('Adding collected data...');
    await client.query(`
      INSERT INTO collected_data (mission_id, waypoint_id, data_type, file_path, metadata)
      VALUES 
        (${missionIds[0]}, 2, 'image', '/data/missions/${missionIds[0]}/images/img001.jpg', '{"timestamp":"2023-05-10T10:15:00Z","position":{"lat":37.7747,"lng":-122.4198,"alt":50},"camera":{"model":"Sony A7R IV","settings":{"iso":100,"shutter":"1/1000","aperture":"f/2.8"}}}'),
        (${missionIds[0]}, 3, 'image', '/data/missions/${missionIds[0]}/images/img002.jpg', '{"timestamp":"2023-05-10T10:16:00Z","position":{"lat":37.7748,"lng":-122.4197,"alt":50},"camera":{"model":"Sony A7R IV","settings":{"iso":100,"shutter":"1/1000","aperture":"f/2.8"}}}'),
        (${missionIds[0]}, 4, 'image', '/data/missions/${missionIds[0]}/images/img003.jpg', '{"timestamp":"2023-05-10T10:17:00Z","position":{"lat":37.7749,"lng":-122.4196,"alt":50},"camera":{"model":"Sony A7R IV","settings":{"iso":100,"shutter":"1/1000","aperture":"f/2.8"}}}'),
        (${missionIds[0]}, 5, 'image', '/data/missions/${missionIds[0]}/images/img004.jpg', '{"timestamp":"2023-05-10T10:18:00Z","position":{"lat":37.7750,"lng":-122.4195,"alt":50},"camera":{"model":"Sony A7R IV","settings":{"iso":100,"shutter":"1/1000","aperture":"f/2.8"}}}'),
        
        (${missionIds[3]}, 2, 'image', '/data/missions/${missionIds[3]}/images/img001.jpg', '{"timestamp":"2023-05-14T14:15:00Z","position":{"lat":37.8044,"lng":-122.2714,"alt":25},"camera":{"model":"Sony A7R IV","settings":{"iso":200,"shutter":"1/500","aperture":"f/4.0"}}}'),
        (${missionIds[3]}, 3, 'image', '/data/missions/${missionIds[3]}/images/img002.jpg', '{"timestamp":"2023-05-14T14:16:00Z","position":{"lat":37.8045,"lng":-122.2713,"alt":25},"camera":{"model":"Sony A7R IV","settings":{"iso":200,"shutter":"1/500","aperture":"f/4.0"}}}'),
        (${missionIds[3]}, 4, 'image', '/data/missions/${missionIds[3]}/images/img003.jpg', '{"timestamp":"2023-05-14T14:17:00Z","position":{"lat":37.8046,"lng":-122.2712,"alt":25},"camera":{"model":"Sony A7R IV","settings":{"iso":200,"shutter":"1/500","aperture":"f/4.0"}}}'),
        
        (${missionIds[1]}, 2, 'sensor_reading', '/data/missions/${missionIds[1]}/readings/thermal001.dat', '{"timestamp":"2023-05-17T09:15:00Z","position":{"lat":37.3352,"lng":-121.8813,"alt":30},"sensor":{"type":"thermal","temperature_range":{"min":15,"max":75}}}'),
        (${missionIds[1]}, 3, 'sensor_reading', '/data/missions/${missionIds[1]}/readings/thermal002.dat', '{"timestamp":"2023-05-17T09:16:00Z","position":{"lat":37.3353,"lng":-121.8812,"alt":30},"sensor":{"type":"thermal","temperature_range":{"min":15,"max":75}}}')
    `);
    
    await client.query('COMMIT');
    console.log('Dummy data added successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding dummy data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

addDummyData(); 