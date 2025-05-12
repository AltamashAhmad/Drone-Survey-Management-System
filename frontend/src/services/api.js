import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Drone APIs
export const droneApi = {
  getAllDrones: () => api.get('/drones'),
  getDrone: (id) => api.get(`/drones/${id}`),
  createDrone: (data) => api.post('/drones', data),
  updateDrone: (id, data) => api.put(`/drones/${id}`, data),
  deleteDrone: (id) => api.delete(`/drones/${id}`),
};

// Mission APIs
export const missionApi = {
  getAllMissions: () => api.get('/missions'),
  getMission: (id) => api.get(`/missions/${id}`),
  createMission: (data) => api.post('/missions', data),
  updateMission: (id, data) => api.put(`/missions/${id}`, data),
  deleteMission: (id) => api.delete(`/missions/${id}`),
  startMission: (id) => api.post(`/missions/${id}/start`),
  pauseMission: (id) => api.post(`/missions/${id}/pause`),
  resumeMission: (id) => api.post(`/missions/${id}/resume`),
  abortMission: (id) => api.post(`/missions/${id}/abort`),
};

// Report APIs
export const reportApi = {
  getAllReports: () => api.get('/reports'),
  getReport: (id) => api.get(`/reports/${id}`),
  getMissionReports: (missionId) => api.get(`/reports/mission/${missionId}`),
  getLocationReports: (locationId) => api.get(`/reports/location/${locationId}`),
  getOrgStatistics: () => api.get('/reports/statistics'),
  createReport: (data) => api.post('/reports', data),
};

export default api; 