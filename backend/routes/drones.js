const express = require('express');
const router = express.Router();
const droneController = require('../controllers/droneController');

// Get all drones
router.get('/', droneController.getAllDrones);

// Get a specific drone
router.get('/:id', droneController.getDrone);

// Create a new drone
router.post('/', droneController.createDrone);

// Update a drone
router.put('/:id', droneController.updateDrone);

// Delete a drone
router.delete('/:id', droneController.deleteDrone);

module.exports = router;
