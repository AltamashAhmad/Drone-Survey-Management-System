import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const createMission = async (missionData) => {
  try {
    // Format the mission data to match the backend requirements
    const formattedData = {
      name: missionData.name,
      description: missionData.description,
      drone_id: missionData.drone_id,
      flight_altitude: missionData.parameters.altitude,
      flight_speed: missionData.parameters.speed,
      sensor_type: missionData.parameters.sensorType,
      survey_pattern: missionData.flightPattern,
      data_collection_frequency: missionData.parameters.collectionFrequency,
      overlap_percentage: missionData.parameters.overlap,
      survey_area: missionData.surveyArea,
      // Handle waypoints properly whether they're already in object format or array format
      waypoints: missionData.waypoints.map(wp => {
        // Check if waypoint is already in object format with latitude/longitude properties
        if (wp && typeof wp === 'object' && 'latitude' in wp && 'longitude' in wp) {
          return {
            ...wp,
            // Ensure altitude is set from mission parameters if not already specified
            altitude: wp.altitude || missionData.parameters.altitude
          };
        } 
        // If waypoint is in array format [longitude, latitude]
        else if (Array.isArray(wp) && wp.length >= 2) {
          return {
            longitude: wp[0],
            latitude: wp[1],
            altitude: missionData.parameters.altitude
          };
        }
        // Default case - this should not happen but handle it just in case
        else {
          console.error('Invalid waypoint format:', wp);
          throw new Error('Invalid waypoint format');
        }
      })
    };

    const response = await axios.post(`${API_URL}/missions`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating mission:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to create mission');
  }
};

export const getMissions = async () => {
  try {
    const response = await axios.get(`${API_URL}/missions`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch missions');
  }
};

export const getMission = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/missions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch mission');
  }
};

export const updateMission = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/missions/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating mission:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to update mission');
  }
};

export const deleteMission = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/missions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete mission');
  }
};

export const validateMissionData = (missionData) => {
  const errors = {};

  if (!missionData.name?.trim()) {
    errors.name = 'Mission name is required';
  }

  if (!missionData.surveyArea) {
    errors.surveyArea = 'Survey area must be defined';
  }

  if (!missionData.waypoints || missionData.waypoints.length < 2) {
    errors.waypoints = 'At least 2 waypoints are required';
  }

  if (!missionData.parameters.altitude) {
    errors.altitude = 'Flight altitude is required';
  }

  if (!missionData.parameters.speed) {
    errors.speed = 'Flight speed is required';
  }

  if (!missionData.parameters.sensorType) {
    errors.sensorType = 'Sensor type must be selected';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}; 