import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  FlightTakeoff,
  CheckCircle,
  Error,
  Pause
} from '@mui/icons-material';
import { missionApi } from '../../services/api';
import { normalizeMissionStatus, getStatusLabel, getStatusColor } from '../../utils/statusUtils';

const getStatusIcon = (status) => {
  const normalizedStatus = normalizeMissionStatus(status);
  switch (normalizedStatus) {
    case 'completed':
      return <CheckCircle color="success" />;
    case 'in-progress':
      return <FlightTakeoff color="primary" />;
    case 'paused':
      return <Pause color="warning" />;
    case 'aborted':
      return <Error color="error" />;
    default:
      return <FlightTakeoff />;
  }
};

const RecentMissionsList = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentMissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await missionApi.getAllMissions();
        
        if (!response || !Array.isArray(response.data)) {
          setMissions([]);
          return;
        }
        
        // Sort by date and take latest 5
        const sortedMissions = response.data
          .filter(mission => mission !== null && mission !== undefined) // Filter out null/undefined missions
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 5);
          
        setMissions(sortedMissions);
      } catch (error) {
        console.error('Error fetching recent missions:', error);
        setError('Failed to load recent missions');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMissions();
    
    // Set up polling for updates
    const interval = setInterval(fetchRecentMissions, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && missions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {missions.map((mission) => (
        <ListItem
          key={mission.id}
          alignItems="flex-start"
          sx={{
            borderBottom: '1px solid #eee',
            '&:last-child': { borderBottom: 'none' }
          }}
        >
          <ListItemIcon>
            {getStatusIcon(mission.status)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                  {mission.name || 'Unnamed Mission'}
                </Typography>
                <Chip
                  label={getStatusLabel(mission.status)}
                  size="small"
                  color={getStatusColor(mission.status)}
                />
              </Box>
            }
            secondary={
              <>
                <Typography component="span" variant="body2" color="text.primary">
                  Altitude: {mission.flight_altitude ? `${mission.flight_altitude}m` : 'N/A'}
                </Typography>
                {' — '}
                {mission.created_at ? new Date(mission.created_at).toLocaleDateString() : 'Unknown date'}
              </>
            }
          />
        </ListItem>
      ))}
      {missions.length === 0 && (
        <ListItem>
          <ListItemText
            primary="No recent missions"
            secondary="Start a new mission to see it here"
          />
        </ListItem>
      )}
    </List>
  );
};

export default RecentMissionsList; 