import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { FlightTakeoff, Battery90, Error, CheckCircle } from '@mui/icons-material';
import { droneApi, missionApi } from '../../services/api';
import DroneSummaryCard from './DroneSummaryCard';
import ActiveMissionsMap from './ActiveMissionsMap';
import RecentMissionsList from './RecentMissionsList';
import { normalizeMissionStatus, normalizeDroneStatus } from '../../utils/statusUtils';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrones: 0,
    activeMissions: 0,
    availableDrones: 0,
    lowBatteryDrones: 0
  });

  const [drones, setDrones] = useState([]);
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        
        // Fetch drone data
        const dronesData = await droneApi.getAllDrones();
        setDrones(Array.isArray(dronesData.data) ? dronesData.data : []);
        
        // Fetch mission data
        const missionsData = await missionApi.getAllMissions();
        setMissions(Array.isArray(missionsData.data) ? missionsData.data : []);
        
        // Calculate stats
        const dronesArray = Array.isArray(dronesData.data) ? dronesData.data : [];
        const missionsArray = Array.isArray(missionsData.data) ? missionsData.data : [];
        
        const available = dronesArray.filter(d => d && normalizeDroneStatus(d.status) === 'idle').length;
        const lowBattery = dronesArray.filter(d => d && d.battery_level < 20).length;
        
        // Count all missions where status is 'in_progress' or 'in-progress'
        const activeMissionCount = missionsArray.filter(m => 
          m && m.status && normalizeMissionStatus(m.status) === 'in-progress'
        ).length;

        setStats({
          totalDrones: dronesArray.length,
          activeMissions: activeMissionCount,
          availableDrones: available,
          lowBatteryDrones: lowBattery
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
      }
    };

    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get drones that are part of active missions
  const getActiveMissionDrones = () => {
    if (!Array.isArray(missions) || !Array.isArray(drones) || missions.length === 0 || drones.length === 0) {
      return [];
    }
    
    const activeMissions = missions.filter(m => 
      m && m.status && normalizeMissionStatus(m.status) === 'in-progress'
    );
    
    if (activeMissions.length === 0) {
      return [];
    }
    
    return drones.filter(d => 
      d && d.id && d.location_lat && d.location_lng && 
      activeMissions.some(m => m.drone_id === d.id)
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Summary Statistics */}
        <Grid item xs={12} md={3}>
          <DroneSummaryCard
            title="Total Drones"
            value={stats.totalDrones}
            icon={<FlightTakeoff />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DroneSummaryCard
            title="Active Missions"
            value={stats.activeMissions}
            icon={<CheckCircle />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DroneSummaryCard
            title="Available Drones"
            value={stats.availableDrones}
            icon={<Battery90 />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DroneSummaryCard
            title="Low Battery"
            value={stats.lowBatteryDrones}
            icon={<Error />}
            color="#f44336"
          />
        </Grid>

        {/* Map showing active missions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Active Missions Map
            </Typography>
            <ActiveMissionsMap drones={getActiveMissionDrones()} />
          </Paper>
        </Grid>

        {/* Recent missions list */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Recent Missions
            </Typography>
            <RecentMissionsList />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 