import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const getDrones = async () => {
  try {
    const response = await axios.get(`${API_URL}/drones`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drones:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch drones');
  }
};

export const getDrone = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/drones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drone:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch drone');
  }
};

export const createDrone = async (droneData) => {
  try {
    // Process data if needed
    const processedData = {
      ...droneData,
      // Add any default values or transformations here
    };
    
    const response = await axios.post(`${API_URL}/drones`, processedData);
    return response.data;
  } catch (error) {
    console.error('Error creating drone:', error);
    throw error;
  }
};

export const updateDrone = async (id, droneData) => {
  try {
    // Process data if needed
    const processedData = {
      ...droneData,
      // Add any transformations here
    };
    
    const response = await axios.put(`${API_URL}/drones/${id}`, processedData);
    return response.data;
  } catch (error) {
    console.error('Error updating drone:', error);
    throw error;
  }
};

export const deleteDrone = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/drones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting drone:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to delete drone');
  }
};

export const getDroneMission = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/drones/${id}/mission`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drone mission:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch drone mission');
  }
}; 