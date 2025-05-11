const db = require('../config/database');
const { validateDrone } = require('../utils/validation');

const droneController = {
  // Get all drones
  async getAllDrones(req, res, next) {
    try {
      const result = await db.query(
        'SELECT * FROM drones ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // Get a specific drone
  async getDrone(req, res, next) {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT * FROM drones WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Drone not found'
        });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // Create a new drone
  async createDrone(req, res, next) {
    try {
      const { name, model, status, battery_level, location_lat, location_lng, altitude } = req.body;
      
      // Validate drone data
      const validationError = validateDrone(req.body);
      if (validationError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationError
        });
      }

      // Convert inputs to appropriate types
      const processedBatteryLevel = battery_level !== null && battery_level !== undefined ? Number(battery_level) : 100;
      const processedLat = location_lat !== null && location_lat !== undefined && location_lat !== '' ? Number(location_lat) : null;
      const processedLng = location_lng !== null && location_lng !== undefined && location_lng !== '' ? Number(location_lng) : null;
      const processedAltitude = altitude !== null && altitude !== undefined && altitude !== '' ? Number(altitude) : null;

      const result = await db.query(
        `INSERT INTO drones (name, model, status, battery_level, location_lat, location_lng, altitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, model, status || 'idle', processedBatteryLevel, processedLat, processedLng, processedAltitude]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Database error creating drone:', err);
      
      // Provide more specific error messages based on PostgreSQL error codes
      if (err.code === '22003') {
        return res.status(400).json({
          status: 'error',
          message: 'Number value out of range. Check latitude, longitude, or altitude values.'
        });
      }
      
      next(err);
    }
  },

  // Update a drone
  async updateDrone(req, res, next) {
    try {
      const { id } = req.params;
      const { name, model, status, battery_level, location_lat, location_lng, altitude } = req.body;

      // Validate drone data
      const validationError = validateDrone(req.body, true);
      if (validationError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationError
        });
      }

      // Convert inputs to appropriate types
      const processedBatteryLevel = battery_level !== null && battery_level !== undefined ? Number(battery_level) : null;
      const processedLat = location_lat !== null && location_lat !== undefined && location_lat !== '' ? Number(location_lat) : null;
      const processedLng = location_lng !== null && location_lng !== undefined && location_lng !== '' ? Number(location_lng) : null;
      const processedAltitude = altitude !== null && altitude !== undefined && altitude !== '' ? Number(altitude) : null;

      const result = await db.query(
        `UPDATE drones 
         SET name = COALESCE($1, name),
             model = COALESCE($2, model),
             status = COALESCE($3, status),
             battery_level = COALESCE($4, battery_level),
             location_lat = COALESCE($5, location_lat),
             location_lng = COALESCE($6, location_lng),
             altitude = COALESCE($7, altitude),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
        [name, model, status, processedBatteryLevel, processedLat, processedLng, processedAltitude, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Drone not found'
        });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Database error updating drone:', err);
      
      // Provide more specific error messages based on PostgreSQL error codes
      if (err.code === '22003') {
        return res.status(400).json({
          status: 'error',
          message: 'Number value out of range. Check latitude, longitude, or altitude values.'
        });
      }
      
      next(err);
    }
  },

  // Delete a drone
  async deleteDrone(req, res, next) {
    try {
      const { id } = req.params;

      // Check if drone is currently assigned to any mission
      const missionCheck = await db.query(
        'SELECT id FROM missions WHERE drone_id = $1 AND status NOT IN ($2, $3)',
        [id, 'completed', 'aborted']
      );

      // If drone is in active missions, log a warning
      if (missionCheck.rows.length > 0) {
        console.warn(`Warning: Deleting drone ${id} that is assigned to active missions. Mission IDs: ${missionCheck.rows.map(m => m.id).join(', ')}`);
        
        // Update all active missions to be aborted
        await db.query(
          `UPDATE missions 
           SET status = 'aborted', 
               end_time = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE drone_id = $1 AND status NOT IN ($2, $3)`,
          [id, 'completed', 'aborted']
        );
      }

      const result = await db.query(
        'DELETE FROM drones WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Drone not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Drone deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting drone:', err);
      next(err);
    }
  },

  // Get drone's current mission
  async getDroneMission(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        `SELECT m.* FROM missions m
         JOIN drones d ON d.id = m.drone_id
         WHERE d.id = $1 AND m.status NOT IN ($2, $3)
         ORDER BY m.created_at DESC
         LIMIT 1`,
        [id, 'completed', 'aborted']
      );

      if (result.rows.length === 0) {
        return res.json(null);
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = droneController; 