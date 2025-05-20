const db = require('../config/database');
const { validateMission, validateWaypoint } = require('../utils/validation');
const { handleControllerError, handleNotFound } = require('../utils/errorHandler');

const missionController = {
  // Get all missions
  async getAllMissions(req, res, next) {
    try {
      const result = await db.query('SELECT * FROM missions');
      res.json(result.rows);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Get a specific mission
  async getMission(req, res, next) {
    try {
      const { id } = req.params;
      const missionResult = await db.query('SELECT * FROM missions WHERE id = $1', [id]);
      
      const notFound = handleNotFound(missionResult, res, 'Mission');
      if (notFound) return;
      
      // Get waypoints for this mission
      const waypointsResult = await db.query('SELECT * FROM waypoints WHERE mission_id = $1 ORDER BY sequence_number', [id]);
      
      // Add waypoints to mission object
      const mission = missionResult.rows[0];
      mission.waypoints = waypointsResult.rows;
      
      res.json(mission);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Create a new mission
  async createMission(req, res, next) {
    try {
      const { 
        name, 
        description, 
        flight_altitude, 
        flight_speed,
        sensor_type,
        survey_pattern, 
        data_collection_frequency,
        overlap_percentage,
        waypoints,
        survey_area,
        drone_id
      } = req.body;
      
      // Validate mission data
      const validationError = validateMission(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Get the drone if ID is provided, otherwise get the first drone as default
      let droneId = drone_id;
      if (!droneId) {
        const droneResult = await db.query('SELECT id FROM drones LIMIT 1');
        if (droneResult.rows.length === 0) {
          return res.status(400).json({ error: 'No drones found in the system' });
        }
        droneId = droneResult.rows[0].id;
      }
      
      // Get the first user as default (since we don't have authentication yet)
      const userResult = await db.query('SELECT id FROM users LIMIT 1');
      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: 'No users found in the system' });
      }
      const userId = userResult.rows[0].id;
      
      // Start a transaction
      await db.query('BEGIN');

      try {
        // Insert the mission
        const missionResult = await db.query(
          `INSERT INTO missions (
            name, description, drone_id, status, flight_altitude, flight_speed,
            survey_pattern, data_collection_frequency, overlap_percentage, sensor_type,
            survey_area, created_at, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12) RETURNING *`,
          [
            name, 
            description, 
            droneId, 
            'planned', 
            flight_altitude,
            flight_speed || 15,
            survey_pattern || 'grid', 
            data_collection_frequency || 5, 
            overlap_percentage || 60,
            sensor_type || 'rgb',
            survey_area ? JSON.stringify(survey_area) : null, 
            userId
          ]
        );

        const missionId = missionResult.rows[0].id;

        // Insert waypoints if provided
        if (waypoints && waypoints.length > 0) {
          for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i];
            
            // Add sequence number if not provided
            waypoint.sequence_number = i + 1;
            
            // Validate waypoint data
            const waypointError = validateWaypoint(waypoint);
            if (waypointError) {
              throw new Error(`Invalid waypoint at index ${i}: ${JSON.stringify(waypointError)}`);
            }
            
            // Use flight_altitude as the default altitude if waypoint altitude is not set
            const waypointAltitude = waypoint.altitude !== null && waypoint.altitude !== undefined 
              ? waypoint.altitude 
              : flight_altitude;
            
            await db.query(
              `INSERT INTO waypoints (
                mission_id, sequence_number, latitude, longitude, altitude
              ) VALUES ($1, $2, $3, $4, $5)`,
              [missionId, waypoint.sequence_number, waypoint.latitude, waypoint.longitude, waypointAltitude]
            );
          }
        }

        // Commit the transaction
        await db.query('COMMIT');
        
        // Get the complete mission with waypoints
        const completeMission = {
          ...missionResult.rows[0],
          waypoints: waypoints || []
        };
        
        res.status(201).json(completeMission);
      } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Update a mission
  async updateMission(req, res, next) {
    try {
      const { id } = req.params;
      
      const { 
        name, 
        description, 
        status,
        drone_id,
        start_time,
        end_time,
        flight_altitude, 
        flight_speed,
        overlap_percentage, 
        data_collection_frequency,
        survey_pattern,
        sensor_type,
        survey_area,
        waypoints
      } = req.body;
      
      // Validate mission data
      const validationError = validateMission(req.body, true);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      
      // Start transaction
      await db.query('BEGIN');
      
      try {
        // Update mission
        const result = await db.query(
          `UPDATE missions 
           SET name = COALESCE($1, name),
               description = COALESCE($2, description),
               status = COALESCE($3, status),
               drone_id = COALESCE($4, drone_id),
               start_time = COALESCE($5, start_time),
               end_time = COALESCE($6, end_time),
               flight_altitude = COALESCE($7, flight_altitude),
               flight_speed = COALESCE($8, flight_speed),
               overlap_percentage = COALESCE($9, overlap_percentage),
               data_collection_frequency = COALESCE($10, data_collection_frequency),
               survey_pattern = COALESCE($11, survey_pattern),
               sensor_type = COALESCE($12, sensor_type),
               survey_area = COALESCE($13, survey_area)
           WHERE id = $14
           RETURNING *`,
          [name, description, status, drone_id, start_time, end_time, flight_altitude, 
           flight_speed, overlap_percentage, data_collection_frequency, survey_pattern,
           sensor_type, survey_area ? JSON.stringify(survey_area) : null, id]
        );

        const notFound = handleNotFound(result, res, 'Mission');
        if (notFound) {
          await db.query('ROLLBACK');
          return;
        }
        
        const mission = result.rows[0];
        
        // If status or drone ID has changed, update the drone status
        if (status || drone_id) {
          // Get the current drone ID if not provided in the update
          const currentDroneId = drone_id || mission.drone_id;
          
          if (currentDroneId) {
            // Set appropriate drone status based on mission status
            let droneStatus = 'idle'; // default
            
            if (status === 'in_progress') {
              droneStatus = 'in_mission';
            } else if (status === 'paused') {
              droneStatus = 'in_mission'; // Drone still considered in mission even if paused
            } else if (status === 'planned' || status === 'ready') {
              droneStatus = 'idle'; // Planned missions don't change drone status
            }
            
            // Only update drone status if we're changing to in_progress, completed, or aborted
            if (['in_progress', 'completed', 'aborted'].includes(status)) {
              await db.query(
                `UPDATE drones
                 SET status = $1,
                     updated_at = NOW()
                 WHERE id = $2`,
                [droneStatus, currentDroneId]
              );
            }
          }
        }

        // Update waypoints if provided
        if (waypoints && waypoints.length > 0) {
          // Delete existing waypoints
          await db.query('DELETE FROM waypoints WHERE mission_id = $1', [id]);
          
          // Insert new waypoints
          for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i];
            
            // Validate waypoint data
            const waypointError = validateWaypoint(waypoint);
            if (waypointError) {
              throw new Error(`Invalid waypoint at index ${i}: ${JSON.stringify(waypointError)}`);
            }
            
            await db.query(
              `INSERT INTO waypoints (
                mission_id, sequence_number, latitude, longitude, altitude
              ) VALUES ($1, $2, $3, $4, $5)`,
              [id, i + 1, waypoint.latitude, waypoint.longitude, waypoint.altitude]
            );
          }
        }

        // Commit transaction
        await db.query('COMMIT');
        
        // Get updated mission with waypoints
        const updatedMission = await db.query(
          `SELECT m.*, 
                  json_agg(w.* ORDER BY w.sequence_number) as waypoints
           FROM missions m
           LEFT JOIN waypoints w ON m.id = w.mission_id
           WHERE m.id = $1
           GROUP BY m.id`,
          [id]
        );
        
        res.json(updatedMission.rows[0]);
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Delete a mission
  async deleteMission(req, res, next) {
    try {
      const { id } = req.params;
      
      // Start transaction
      await db.query('BEGIN');
      
      try {
        // Delete waypoints first (due to foreign key constraint)
        await db.query('DELETE FROM waypoints WHERE mission_id = $1', [id]);
        
        // Delete the mission
        const result = await db.query('DELETE FROM missions WHERE id = $1 RETURNING *', [id]);
        
        const notFound = handleNotFound(result, res, 'Mission');
        if (notFound) {
          await db.query('ROLLBACK');
          return;
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({ message: 'Mission deleted successfully' });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (err) {
      handleControllerError(err, res, next);
    }
  }
};

module.exports = missionController; 