const db = require('../config/database');
const { validateWaypoint } = require('../utils/validation');
const { handleControllerError, handleNotFound } = require('../utils/errorHandler');

const waypointController = {
  // Get all waypoints for a mission
  async getMissionWaypoints(req, res, next) {
    try {
      const { missionId } = req.params;
      const result = await db.query(
        'SELECT * FROM waypoints WHERE mission_id = $1 ORDER BY sequence_number',
        [missionId]
      );
      res.json(result.rows);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Get a specific waypoint
  async getWaypoint(req, res, next) {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM waypoints WHERE id = $1', [id]);
      
      const notFound = handleNotFound(result, res, 'Waypoint');
      if (notFound) return;
      
      res.json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Create a new waypoint
  async createWaypoint(req, res, next) {
    try {
      const { mission_id, sequence_number, latitude, longitude, altitude } = req.body;
      
      // Validate waypoint data
      const validationError = validateWaypoint(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      
      const result = await db.query(
        'INSERT INTO waypoints (mission_id, sequence_number, latitude, longitude, altitude) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [mission_id, sequence_number, latitude, longitude, altitude]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Create multiple waypoints in a batch
  async createBatchWaypoints(req, res, next) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      const { waypoints } = req.body;
      const createdWaypoints = [];
      
      for (const waypoint of waypoints) {
        // Validate each waypoint
        const validationError = validateWaypoint(waypoint);
        if (validationError) {
          throw new Error(`Invalid waypoint: ${JSON.stringify(validationError)}`);
        }
        
        const { mission_id, sequence_number, lat, lng, altitude, action } = waypoint;
        
        const result = await client.query(
          `INSERT INTO waypoints 
            (mission_id, sequence_number, lat, lng, altitude, action) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [mission_id, sequence_number, lat, lng, altitude, action || 'capture']
        );
        
        createdWaypoints.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json(createdWaypoints);
    } catch (err) {
      await client.query('ROLLBACK');
      handleControllerError(err, res, next);
    } finally {
      client.release();
    }
  },

  // Update a waypoint
  async updateWaypoint(req, res, next) {
    try {
      const { id } = req.params;
      const { sequence_number, latitude, longitude, altitude } = req.body;
      
      // Validate waypoint data
      const validationError = validateWaypoint(req.body, true);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      
      const result = await db.query(
        `UPDATE waypoints 
         SET sequence_number = COALESCE($1, sequence_number),
             latitude = COALESCE($2, latitude),
             longitude = COALESCE($3, longitude),
             altitude = COALESCE($4, altitude)
         WHERE id = $5
         RETURNING *`,
        [sequence_number, latitude, longitude, altitude, id]
      );
      
      const notFound = handleNotFound(result, res, 'Waypoint');
      if (notFound) return;
      
      res.json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Delete a waypoint
  async deleteWaypoint(req, res, next) {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM waypoints WHERE id = $1 RETURNING *', [id]);
      
      const notFound = handleNotFound(result, res, 'Waypoint');
      if (notFound) return;
      
      res.json({ message: 'Waypoint deleted successfully' });
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Delete all waypoints for a mission
  async deleteMissionWaypoints(req, res, next) {
    try {
      const { missionId } = req.params;
      await db.query('DELETE FROM waypoints WHERE mission_id = $1', [missionId]);
      
      res.json({ message: 'All waypoints for the mission deleted successfully' });
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Create multiple waypoints
  async createWaypoints(req, res, next) {
    try {
      const { mission_id, waypoints } = req.body;
      
      if (!Array.isArray(waypoints) || waypoints.length === 0) {
        return res.status(400).json({ error: 'Waypoints must be a non-empty array' });
      }
      
      // Start transaction
      await db.query('BEGIN');
      
      try {
        const createdWaypoints = [];
        
        for (let i = 0; i < waypoints.length; i++) {
          const waypoint = waypoints[i];
          
          // Add sequence number if not provided
          waypoint.sequence_number = waypoint.sequence_number || i + 1;
          
          // Validate waypoint data
          const validationError = validateWaypoint(waypoint);
          if (validationError) {
            throw new Error(`Invalid waypoint at index ${i}: ${validationError}`);
          }
          
          const result = await db.query(
            'INSERT INTO waypoints (mission_id, sequence_number, latitude, longitude, altitude) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [mission_id, waypoint.sequence_number, waypoint.latitude, waypoint.longitude, waypoint.altitude]
          );
          
          createdWaypoints.push(result.rows[0]);
        }
        
        await db.query('COMMIT');
        res.status(201).json(createdWaypoints);
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (err) {
      handleControllerError(err, res, next);
    }
  }
};

module.exports = waypointController; 