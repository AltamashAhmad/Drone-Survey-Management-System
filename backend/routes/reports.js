const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Get all reports
router.get('/', reportController.getAllReports);

// Get organization-wide statistics
router.get('/statistics', reportController.getOrgStatistics);

// Get a specific report
router.get('/:id', reportController.getReport);

// Get reports for a specific mission
router.get('/mission/:missionId', reportController.getMissionReports);

// Get reports for a specific location
router.get('/location/:locationId', reportController.getLocationReports);

// Create a new report
router.post('/', reportController.createReport);

module.exports = router;
