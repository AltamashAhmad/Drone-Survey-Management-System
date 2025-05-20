const db = require('../config/database');
const { validateReport } = require('../utils/validation');
const { handleControllerError, handleNotFound } = require('../utils/errorHandler');

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
      handleControllerError(err, res, next);
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

      const notFound = handleNotFound(result, res, 'Report');
      if (notFound) return;

      res.json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
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
      handleControllerError(err, res, next);
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
      handleControllerError(err, res, next);
    }
  },

  // Create a new survey report
  async createReport(req, res, next) {
    try {
      const {
        mission_id,
        location_id,
        flight_duration,
        distance_flown,
        area_covered,
        image_count,
        battery_consumed,
        weather_conditions,
        notes
      } = req.body;

      // Validate report data
      const validationError = validateReport(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const result = await db.query(
        `INSERT INTO survey_reports (
          mission_id, location_id, flight_duration, distance_flown,
          area_covered, image_count, battery_consumed, weather_conditions, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          mission_id, location_id, flight_duration, distance_flown,
          area_covered, image_count, battery_consumed, weather_conditions, notes
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      handleControllerError(err, res, next);
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
      handleControllerError(err, res, next);
    }
  }
};

module.exports = reportController; 