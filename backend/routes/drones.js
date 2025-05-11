const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Get all drones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drones');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific drone
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM drones WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new drone
router.post('/', async (req, res) => {
  try {
    const { name, model, status, battery_level, location_lat, location_lng, altitude } = req.body;
    
    // Validate required fields
    if (!name || !model) {
      return res.status(400).json({ error: 'Name and model are required fields' });
    }
    
    // Validate coordinate ranges if provided
    if (location_lat !== null && location_lat !== undefined) {
      if (isNaN(Number(location_lat)) || Number(location_lat) < -90 || Number(location_lat) > 90) {
        return res.status(400).json({ error: 'Latitude must be a number between -90 and 90' });
      }
    }
    
    if (location_lng !== null && location_lng !== undefined) {
      if (isNaN(Number(location_lng)) || Number(location_lng) < -180 || Number(location_lng) > 180) {
        return res.status(400).json({ error: 'Longitude must be a number between -180 and 180' });
      }
    }
    
    // Convert string values to proper types
    const processedBatteryLevel = battery_level !== null && battery_level !== undefined ? Number(battery_level) : 100;
    const processedLat = location_lat !== null && location_lat !== undefined ? Number(location_lat) : null;
    const processedLng = location_lng !== null && location_lng !== undefined ? Number(location_lng) : null;
    const processedAltitude = altitude !== null && altitude !== undefined ? Number(altitude) : null;
    
    const result = await pool.query(
      'INSERT INTO drones (name, model, status, battery_level, location_lat, location_lng, altitude) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, model, status || 'idle', processedBatteryLevel, processedLat, processedLng, processedAltitude]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error creating drone:', err);
    
    // Provide more specific error messages based on PostgreSQL error codes
    if (err.code === '22003') {
      return res.status(400).json({ error: 'Number value out of range. Check latitude, longitude, or altitude values.' });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Update a drone
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, status, battery_level, location_lat, location_lng, altitude } = req.body;
    
    // Validate coordinate ranges if provided
    if (location_lat !== null && location_lat !== undefined) {
      if (isNaN(Number(location_lat)) || Number(location_lat) < -90 || Number(location_lat) > 90) {
        return res.status(400).json({ error: 'Latitude must be a number between -90 and 90' });
      }
    }
    
    if (location_lng !== null && location_lng !== undefined) {
      if (isNaN(Number(location_lng)) || Number(location_lng) < -180 || Number(location_lng) > 180) {
        return res.status(400).json({ error: 'Longitude must be a number between -180 and 180' });
      }
    }
    
    // Convert string values to proper types
    const processedBatteryLevel = battery_level !== null && battery_level !== undefined ? Number(battery_level) : null;
    const processedLat = location_lat !== null && location_lat !== undefined ? Number(location_lat) : null;
    const processedLng = location_lng !== null && location_lng !== undefined ? Number(location_lng) : null;
    const processedAltitude = altitude !== null && altitude !== undefined ? Number(altitude) : null;
    
    const result = await pool.query(
      `UPDATE drones 
       SET name = COALESCE($1, name),
           model = COALESCE($2, model),
           status = COALESCE($3, status),
           battery_level = COALESCE($4, battery_level),
           location_lat = COALESCE($5, location_lat),
           location_lng = COALESCE($6, location_lng),
           altitude = COALESCE($7, altitude)
       WHERE id = $8
       RETURNING *`,
      [name, model, status, processedBatteryLevel, processedLat, processedLng, processedAltitude, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error updating drone:', err);
    
    // Provide more specific error messages based on PostgreSQL error codes
    if (err.code === '22003') {
      return res.status(400).json({ error: 'Number value out of range. Check latitude, longitude, or altitude values.' });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Delete a drone
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM drones WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Drone not found' });
    }
    
    res.json({ message: 'Drone deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
