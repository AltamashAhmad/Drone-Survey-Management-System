const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Get all locations
router.get('/', locationController.getAllLocations);

// Get a specific location
router.get('/:id', locationController.getLocation);

// Create a new location
router.post('/', locationController.createLocation);

// Update a location
router.put('/:id', locationController.updateLocation);

// Delete a location
router.delete('/:id', locationController.deleteLocation);

// Get all missions for a specific location
router.get('/:id/missions', locationController.getLocationMissions);

// Get statistics for a specific location
router.get('/:id/statistics', locationController.getLocationStatistics);

module.exports = router; 