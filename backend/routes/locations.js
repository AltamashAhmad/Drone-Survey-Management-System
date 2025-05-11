const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Get all locations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM locations
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific location by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM locations WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new location
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      type,
      latitude, 
      longitude,
      address,
      notes,
      created_by
    } = req.body;
    
    // Validate required fields
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO locations 
        (name, description, type, latitude, longitude, address, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, description, type || 'survey_site', latitude, longitude, address, notes, created_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a location
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      type,
      latitude, 
      longitude,
      address,
      notes
    } = req.body;
    
    // Validate required fields
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required' });
    }
    
    const result = await pool.query(
      `UPDATE locations 
       SET name = $1, 
           description = $2, 
           type = $3, 
           latitude = $4, 
           longitude = $5, 
           address = $6, 
           notes = $7
       WHERE id = $8 
       RETURNING *`,
      [name, description, type || 'survey_site', latitude, longitude, address, notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a location
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the location is used in any missions
    const missionCheck = await pool.query(
      `SELECT id FROM missions WHERE location_id = $1 LIMIT 1`,
      [id]
    );
    
    if (missionCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete location that is used in missions' 
      });
    }
    
    const result = await pool.query(
      `DELETE FROM locations WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all missions for a specific location
router.get('/:id/missions', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT m.*, d.name as drone_name 
      FROM missions m
      LEFT JOIN drones d ON m.drone_id = d.id
      WHERE m.location_id = $1
      ORDER BY m.created_at DESC
    `, [id]);
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get statistics for a specific location
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get mission counts by status
    const missionStats = await pool.query(`
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
    const areaStats = await pool.query(`
      SELECT 
        SUM(sr.area_covered) as total_area_covered,
        AVG(sr.flight_duration) as avg_flight_duration,
        SUM(sr.data_collected) as total_data_collected
      FROM survey_reports sr
      WHERE sr.location_id = $1
    `, [id]);
    
    // Get last mission date
    const lastMission = await pool.query(`
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 