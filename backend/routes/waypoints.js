const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Get all waypoints for a mission
router.get('/mission/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;
    const result = await pool.query(
      'SELECT * FROM waypoints WHERE mission_id = $1 ORDER BY sequence_number',
      [missionId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific waypoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM waypoints WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new waypoint
router.post('/', async (req, res) => {
  try {
    const { mission_id, sequence_number, lat, lng, altitude, action } = req.body;
    
    const result = await pool.query(
      `INSERT INTO waypoints 
        (mission_id, sequence_number, lat, lng, altitude, action) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [mission_id, sequence_number, lat, lng, altitude, action || 'capture']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create multiple waypoints in a batch
router.post('/batch', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const { waypoints } = req.body;
    const createdWaypoints = [];
    
    for (const waypoint of waypoints) {
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
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Update a waypoint
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sequence_number, lat, lng, altitude, action } = req.body;
    
    const result = await pool.query(
      `UPDATE waypoints 
       SET sequence_number = COALESCE($1, sequence_number),
           lat = COALESCE($2, lat),
           lng = COALESCE($3, lng),
           altitude = COALESCE($4, altitude),
           action = COALESCE($5, action)
       WHERE id = $6
       RETURNING *`,
      [sequence_number, lat, lng, altitude, action, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a waypoint
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM waypoints WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' });
    }
    
    res.json({ message: 'Waypoint deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all waypoints for a mission
router.delete('/mission/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;
    await pool.query('DELETE FROM waypoints WHERE mission_id = $1', [missionId]);
    
    res.json({ message: 'All waypoints for the mission deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
