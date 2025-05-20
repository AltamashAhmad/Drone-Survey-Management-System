const express = require('express');
const router = express.Router();
const waypointController = require('../controllers/waypointController');

// Get all waypoints for a mission
router.get('/mission/:missionId', waypointController.getMissionWaypoints);

// Get a specific waypoint
router.get('/:id', waypointController.getWaypoint);

// Create a new waypoint
router.post('/', waypointController.createWaypoint);

// Create multiple waypoints in a batch
router.post('/batch', waypointController.createBatchWaypoints);

// Update a waypoint
router.put('/:id', waypointController.updateWaypoint);

// Delete a waypoint
router.delete('/:id', waypointController.deleteWaypoint);

// Delete all waypoints for a mission
router.delete('/mission/:missionId', waypointController.deleteMissionWaypoints);

module.exports = router;
