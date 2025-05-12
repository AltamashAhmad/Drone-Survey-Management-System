/**
 * Utility functions for handling status formatting across the application
 */

/**
 * Normalizes mission status for consistent display
 * This helps handle both 'in_progress' and 'in-progress' formats
 * 
 * @param {string} status - The mission status 
 * @returns {string} - Normalized status
 */
export const normalizeMissionStatus = (status) => {
  // Handle different formats of 'in progress' status
  if (status === 'in_progress') {
    return 'in-progress';
  }
  return status;
};

/**
 * Standardizes drone status for consistent display
 * This helps handle both 'in_mission' and 'in-mission' formats
 * 
 * @param {string} status - The drone status 
 * @returns {string} - Normalized status
 */
export const normalizeDroneStatus = (status) => {
  // Handle different formats of 'in mission' status
  if (status === 'in_mission') {
    return 'in-mission';
  }
  return status;
};

/**
 * Converts status to human-readable label
 * 
 * @param {string} status - The status to format
 * @returns {string} - Human-readable status label
 */
export const getStatusLabel = (status) => {
  const normalized = status.includes('progress') ? 
    normalizeMissionStatus(status) : 
    normalizeDroneStatus(status);
    
  switch (normalized) {
    case 'in-progress':
      return 'In Progress';
    case 'in-mission':
      return 'In Mission';
    case 'completed':
      return 'Completed';
    case 'paused':
      return 'Paused';
    case 'aborted':
      return 'Aborted';
    case 'planned':
      return 'Planned';
    case 'idle':
      return 'Idle';
    case 'maintenance':
      return 'Maintenance';
    case 'offline':
      return 'Offline';
    default:
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
};

/**
 * Maps status to Material UI color
 * 
 * @param {string} status - The status
 * @returns {string} - Material UI color name
 */
export const getStatusColor = (status) => {
  const normalized = status.includes('progress') ? 
    normalizeMissionStatus(status) : 
    normalizeDroneStatus(status);
    
  switch (normalized) {
    case 'completed':
      return 'success';
    case 'in-progress':
    case 'in-mission':
      return 'primary';
    case 'paused':
    case 'maintenance':
      return 'warning';
    case 'aborted':
    case 'offline':
      return 'error';
    case 'idle':
      return 'success';
    default:
      return 'default';
  }
}; 