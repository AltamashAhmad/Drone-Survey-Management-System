const db = require('../config/database');

const reportController = {
  // Get all survey reports
  async getAllReports(req, res, next) {
    try {
      const result = await db.query(
        `SELECT sr.*, m.name as mission_name, l.name as location_name 
         FROM survey_reports sr
         LEFT JOIN missions m ON sr.mission_id = m.id
         LEFT JOIN locations l ON sr.location_id = l.id
         ORDER BY sr.created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // Get a specific survey report
  async getReport(req, res, next) {
    try {
      const { id } = req.params;
      const result = await db.query(
        `SELECT sr.*, m.name as mission_name, l.name as location_name 
         FROM survey_reports sr
         LEFT JOIN missions m ON sr.mission_id = m.id
         LEFT JOIN locations l ON sr.location_id = l.id
         WHERE sr.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Report not found'
        });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // Get reports for a specific mission
  async getMissionReports(req, res, next) {
    try {
      const { missionId } = req.params;
      const result = await db.query(
        `SELECT sr.*, m.name as mission_name, l.name as location_name 
         FROM survey_reports sr
         LEFT JOIN missions m ON sr.mission_id = m.id
         LEFT JOIN locations l ON sr.location_id = l.id
         WHERE sr.mission_id = $1
         ORDER BY sr.created_at DESC`,
        [missionId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // Get reports for a specific location
  async getLocationReports(req, res, next) {
    try {
      const { locationId } = req.params;
      const result = await db.query(
        `SELECT sr.*, m.name as mission_name, l.name as location_name 
         FROM survey_reports sr
         LEFT JOIN missions m ON sr.mission_id = m.id
         LEFT JOIN locations l ON sr.location_id = l.id
         WHERE sr.location_id = $1
         ORDER BY sr.created_at DESC`,
        [locationId]
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // Create a new survey report
  async createReport(req, res, next) {
    try {
      const {
        mission_id,
        flight_duration,
        distance_flown,
        area_covered,
        waypoints_completed,
        data_collected,
        sensor_type,
        battery_consumed,
        image_count,
        location_id,
        report_data
      } = req.body;

      // Validate required fields
      if (!mission_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Mission ID is required'
        });
      }

      const result = await db.query(
        `INSERT INTO survey_reports (
          mission_id, flight_duration, distance_flown, area_covered,
          waypoints_completed, data_collected, sensor_type,
          battery_consumed, image_count, location_id, report_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          mission_id,
          flight_duration || 0,
          distance_flown || 0,
          area_covered || 0,
          waypoints_completed || 0,
          data_collected || 0,
          sensor_type || 'rgb',
          battery_consumed || 0,
          image_count || 0,
          location_id,
          report_data ? JSON.stringify(report_data) : '{}'
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating report:', err);
      next(err);
    }
  },

  // Get organization-wide statistics
  async getOrgStatistics(req, res, next) {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(DISTINCT sr.id) as total_surveys,
          COUNT(DISTINCT sr.mission_id) as total_missions,
          COUNT(DISTINCT sr.location_id) as total_locations,
          SUM(sr.flight_duration) as total_flight_time,
          SUM(sr.distance_flown) as total_distance,
          SUM(sr.area_covered) as total_area_covered,
          SUM(sr.image_count) as total_images,
          AVG(sr.battery_consumed) as avg_battery_consumption
        FROM survey_reports sr
      `);

      res.json(stats.rows[0]);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController; 