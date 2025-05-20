const db = require('../config/database');
const { validateLocation } = require('../utils/validation');
const { handleControllerError, handleNotFound } = require('../utils/errorHandler');

const locationController = {
  // Get all locations
  async getAllLocations(req, res, next) {
    try {
      const result = await db.query('SELECT * FROM locations');
      res.json(result.rows);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Get a specific location
  async getLocation(req, res, next) {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM locations WHERE id = $1', [id]);
      
      const notFound = handleNotFound(result, res, 'Location');
      if (notFound) return;
      
      res.json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Create a new location
  async createLocation(req, res, next) {
    try {
      const { name, description, latitude, longitude, altitude, address } = req.body;
      
      // Validate location data
      const validationError = validateLocation(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      
      const result = await db.query(
        'INSERT INTO locations (name, description, latitude, longitude, altitude, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, latitude, longitude, altitude, address]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Update a location
  async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, latitude, longitude, altitude, address } = req.body;
      
      // Validate location data
      const validationError = validateLocation(req.body, true);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      
      const result = await db.query(
        `UPDATE locations 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             latitude = COALESCE($3, latitude),
             longitude = COALESCE($4, longitude),
             altitude = COALESCE($5, altitude),
             address = COALESCE($6, address)
         WHERE id = $7
         RETURNING *`,
        [name, description, latitude, longitude, altitude, address, id]
      );
      
      const notFound = handleNotFound(result, res, 'Location');
      if (notFound) return;
      
      res.json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Delete a location
  async deleteLocation(req, res, next) {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM locations WHERE id = $1 RETURNING *', [id]);
      
      const notFound = handleNotFound(result, res, 'Location');
      if (notFound) return;
      
      res.json({ message: 'Location deleted successfully' });
    } catch (err) {
      handleControllerError(err, res, next);
    }
  },

  // Get all missions for a specific location
  async getLocationMissions(req, res, next) {
    try {
      const { id } = req.params;
      const result = await db.query(`
        SELECT m.*, d.name as drone_name 
        FROM missions m
        LEFT JOIN drones d ON m.drone_id = d.id
        WHERE m.location_id = $1
        ORDER BY m.created_at DESC
      `, [id]);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // Get statistics for a specific location
  async getLocationStatistics(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get mission counts by status
      const missionStats = await db.query(`
        SELECT 
          COUNT(*) as total_missions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_missions,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_missions,
          COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned_missions,
          COUNT(CASE WHEN status = 'aborted' THEN 1 END) as aborted_missions
        FROM missions
        WHERE location_id = $1
      `, [id]);
      
      // Get total area covered from reports
      const areaStats = await db.query(`
        SELECT 
          SUM(sr.area_covered) as total_area_covered,
          AVG(sr.flight_duration) as avg_flight_duration,
          SUM(sr.data_collected) as total_data_collected
        FROM survey_reports sr
        WHERE sr.location_id = $1
      `, [id]);
      
      // Get last mission date
      const lastMission = await db.query(`
        SELECT 
          MAX(end_time) as last_completed_date
        FROM missions
        WHERE location_id = $1 AND status = 'completed'
      `, [id]);
      
      res.json({
        mission_stats: missionStats.rows[0],
        area_stats: areaStats.rows[0],
        last_completed: lastMission.rows[0]?.last_completed_date
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = locationController; 