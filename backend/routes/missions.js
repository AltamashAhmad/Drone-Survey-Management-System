const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');

// Get all missions
router.get('/', missionController.getAllMissions);

// Get a specific mission
router.get('/:id', missionController.getMission);

// Create a new mission
router.post('/', missionController.createMission);

// Update a mission
router.put('/:id', missionController.updateMission);

// Delete a mission
router.delete('/:id', missionController.deleteMission);

module.exports = router;
