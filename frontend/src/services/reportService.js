import { reportApi } from './api';

/**
 * Get all survey reports
 * @returns {Promise} Promise object representing the reports data
 */
export const getReports = async () => {
  try {
    const response = await reportApi.getAllReports();
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get a specific report by ID
 * @param {string} id - Report ID
 * @returns {Promise} Promise object representing the report data
 */
export const getReport = async (id) => {
  try {
    const response = await reportApi.getReport(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
};

/**
 * Get reports for a specific mission
 * @param {string} missionId - Mission ID
 * @returns {Promise} Promise object representing the mission reports
 */
export const getMissionReports = async (missionId) => {
  try {
    const response = await reportApi.getMissionReports(missionId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reports for mission ${missionId}:`, error);
    throw error;
  }
};

/**
 * Get reports for a specific location
 * @param {string} locationId - Location ID
 * @returns {Promise} Promise object representing the location reports
 */
export const getLocationReports = async (locationId) => {
  try {
    const response = await reportApi.getLocationReports(locationId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reports for location ${locationId}:`, error);
    throw error;
  }
};

/**
 * Get organization-wide statistics
 * @returns {Promise} Promise object representing the organization statistics
 */
export const getOrgStatistics = async () => {
  try {
    const response = await reportApi.getOrgStatistics();
    return response.data;
  } catch (error) {
    console.error('Error fetching organization statistics:', error);
    throw error;
  }
};

/**
 * Create a new survey report
 * @param {Object} reportData - Report data
 * @returns {Promise} Promise object representing the created report
 */
export const createReport = async (reportData) => {
  try {
    const response = await reportApi.createReport(reportData);
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}; 