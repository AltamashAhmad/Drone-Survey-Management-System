import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  IconButton,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  Stop as AbortIcon,
  FlightTakeoff as StartIcon,
  ArrowBack as BackIcon,
  Battery60 as BatteryIcon,
  Speed as SpeedIcon,
  MyLocation as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMission, updateMission } from '../../services/missionService';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom drone icon
const droneIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2168/2168282.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const MissionMonitor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dronePosition, setDronePosition] = useState(null);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [dataCollected, setDataCollected] = useState(0); // in MB
  const [distanceTraveled, setDistanceTraveled] = useState(0); // in meters
  const [currentWaypoint, setCurrentWaypoint] = useState(1);
  const [sensorStatus, setSensorStatus] = useState('active');
  const [telemetryData, setTelemetryData] = useState({
    altitude: 0,
    speed: 0,
    heading: 0,
    temperature: 25,
    wind: { speed: 0, direction: 'N' }
  });

  const fetchMission = useCallback(async () => {
    try {
      setLoading(true);
      const missionData = await getMission(id);

      // Convert waypoints to appropriate format for mapping
      if (missionData.waypoints) {
        missionData.waypointCoordinates = missionData.waypoints.map(wp => 
          [parseFloat(wp.latitude), parseFloat(wp.longitude)]
        );
        
        // Set initial drone position to first waypoint if mission is in progress
        if (missionData.status === 'in_progress' && missionData.waypointCoordinates.length > 0) {
          setDronePosition(missionData.waypointCoordinates[0]);
          setProgress(calculateRandomProgress());
          setRemainingTime(calculateRemainingTime(missionData));
        } else if (missionData.status === 'completed') {
          setProgress(100);
          setRemainingTime(0);
        } else {
          setProgress(0);
        }
      }
      
      setMission(missionData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch mission details');
      console.error('Error fetching mission:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const calculateRandomProgress = () => {
    return Math.floor(Math.random() * 100);
  };

  const calculateRemainingTime = (missionData) => {
    // In a real app, this would calculate based on drone speed, distance etc.
    // For now we'll use a simple random number
    const baseTime = 20; // minutes
    const randomFactor = Math.random() * 10;
    return Math.max(0, Math.floor(baseTime - randomFactor));
  };

  // Calculate distance between two points in meters (haversine formula)
  const calculateDistance = (point1, point2) => {
    if (!point1 || !point2) return 0;
    
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1[0] * Math.PI/180;
    const φ2 = point2[0] * Math.PI/180;
    const Δφ = (point2[0]-point1[0]) * Math.PI/180;
    const Δλ = (point2[1]-point1[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const handleUpdateStatus = useCallback(async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await updateMission(id, { status: newStatus });
      
      // Update local state
      setMission(prev => ({
        ...prev,
        status: newStatus
      }));
      
      // Update progress based on new status
      if (newStatus === 'completed') {
        setProgress(100);
        setRemainingTime(0);
      } else if (newStatus === 'in_progress') {
        setProgress(Math.max(5, progress)); // Ensure some progress is shown
      }
    } catch (err) {
      console.error('Error updating mission status:', err);
      setError('Failed to update mission status');
    } finally {
      setStatusUpdateLoading(false);
    }
  }, [id, progress]);

  const simulateProgress = useCallback(() => {
    if (!mission || !mission.waypointCoordinates || mission.waypointCoordinates.length < 2) {
      return;
    }
    
    // Simulate drone movement along the waypoints
    const totalWaypoints = mission.waypointCoordinates.length;
    const newProgress = Math.min(progress + Math.random() * 5, 100);
    setProgress(newProgress);
    
    // Calculate which waypoint segment the drone should be on
    const waypointIndex = Math.floor((newProgress / 100) * (totalWaypoints - 1));
    const nextWaypointIndex = Math.min(waypointIndex + 1, totalWaypoints - 1);
    
    // Update current waypoint
    setCurrentWaypoint(waypointIndex + 1);
    
    // Interpolate position between waypoints
    const start = mission.waypointCoordinates[waypointIndex];
    const end = mission.waypointCoordinates[nextWaypointIndex];
    const segmentProgress = (newProgress / 100 * (totalWaypoints - 1)) % 1;
    
    const newPosition = [
      start[0] + (end[0] - start[0]) * segmentProgress,
      start[1] + (end[1] - start[1]) * segmentProgress
    ];
    
    setDronePosition(newPosition);
    
    // Update remaining time
    const newRemainingTime = Math.max(0, Math.floor((100 - newProgress) / 100 * 20));
    setRemainingTime(newRemainingTime);
    
    // Simulate battery drain
    const newBatteryLevel = Math.max(0, batteryLevel - 0.2 - (Math.random() * 0.3));
    setBatteryLevel(newBatteryLevel);
    
    // Simulate data collection
    const newDataCollected = dataCollected + (Math.random() * 5);
    setDataCollected(newDataCollected);
    
    // Simulate distance traveled
    const lastPosition = dronePosition || start;
    const distance = calculateDistance(lastPosition, newPosition);
    setDistanceTraveled(distanceTraveled + distance);
    
    // Update telemetry data
    setTelemetryData({
      altitude: mission.parameters?.altitude || 100,
      speed: mission.parameters?.speed || 15,
      heading: Math.floor(Math.random() * 360),
      temperature: 25 + (Math.random() * 5),
      wind: { 
        speed: 5 + (Math.random() * 3), 
        direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)] 
      }
    });
    
    // Randomly change sensor status
    if (Math.random() < 0.05) {
      setSensorStatus(Math.random() < 0.8 ? 'active' : 'warning');
    }
    
    // Auto-complete mission if progress reaches 100%
    if (newProgress >= 100 && mission.status === 'in_progress') {
      handleUpdateStatus('completed');
    }
    
    // If battery gets critically low, trigger warning
    if (newBatteryLevel < 20 && batteryLevel >= 20) {
      setError('Warning: Battery level is below 20%. Consider landing soon.');
    }
  }, [mission, progress, batteryLevel, dataCollected, distanceTraveled, dronePosition, handleUpdateStatus]);

  useEffect(() => {
    fetchMission();
    
    // Simulate drone movement and mission progress in real-time
    const interval = setInterval(() => {
      if (mission && mission.status === 'in_progress') {
        simulateProgress();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id, mission, fetchMission, simulateProgress]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'aborted':
        return 'error';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionButtons = () => {
    switch (mission.status) {
      case 'planned':
        return (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<StartIcon />}
            onClick={() => handleUpdateStatus('in_progress')}
            disabled={statusUpdateLoading}
          >
            Start Mission
          </Button>
        );
      case 'in_progress':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="warning" 
              startIcon={<PauseIcon />}
              onClick={() => handleUpdateStatus('paused')}
              disabled={statusUpdateLoading}
            >
              Pause
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<AbortIcon />}
              onClick={() => handleUpdateStatus('aborted')}
              disabled={statusUpdateLoading}
            >
              Abort
            </Button>
          </Box>
        );
      case 'paused':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<ResumeIcon />}
              onClick={() => handleUpdateStatus('in_progress')}
              disabled={statusUpdateLoading}
            >
              Resume
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<AbortIcon />}
              onClick={() => handleUpdateStatus('aborted')}
              disabled={statusUpdateLoading}
            >
              Abort
            </Button>
          </Box>
        );
      case 'completed':
      case 'aborted':
        return (
          <Button 
            variant="outlined" 
            onClick={() => navigate('/missions')}
          >
            Back to Missions
          </Button>
        );
      default:
        return null;
    }
  };

  const getBatteryColor = (level) => {
    if (level > 70) return 'success';
    if (level > 30) return 'warning';
    return 'error';
  };

  const getSensorStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'warning') return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !mission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Mission not found'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />}
          onClick={() => navigate('/missions')}
        >
          Back to Missions
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/missions')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Mission Monitor</Typography>
        </Box>
        <Chip 
          label={mission.status} 
          color={getStatusColor(mission.status)} 
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Left Side - Map and Waypoints */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>Mission: {mission.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {mission.description || 'No description provided'}
            </Typography>
          </Paper>

          <Paper sx={{ height: '500px', mb: 3 }}>
            <MapContainer 
              center={mission.waypointCoordinates?.[0] || [20.5937, 78.9629]} 
              zoom={12} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Draw waypoint path */}
              {mission.waypointCoordinates && mission.waypointCoordinates.length > 1 && (
                <Polyline 
                  positions={mission.waypointCoordinates} 
                  color="blue" 
                  weight={3} 
                  opacity={0.7}
                />
              )}
              
              {/* Show all waypoints */}
              {mission.waypointCoordinates && mission.waypointCoordinates.map((position, index) => (
                <Marker 
                  key={index} 
                  position={position}
                >
                  <Popup>Waypoint {index + 1}</Popup>
                </Marker>
              ))}
              
              {/* Show drone position if mission is in progress */}
              {dronePosition && mission.status === 'in_progress' && (
                <Marker 
                  position={dronePosition} 
                  icon={droneIcon}
                >
                  <Popup>
                    <strong>{mission.name}</strong><br />
                    Status: {mission.status}<br />
                    Altitude: {mission.flight_altitude}m
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </Paper>
        </Grid>
        
        {/* Right Side - Mission Details and Controls */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mission Progress</Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Progress</Typography>
                  <Typography variant="body2">{progress.toFixed(0)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 10, borderRadius: 5 }} 
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Waypoint</Typography>
                <Typography variant="body2">
                  {currentWaypoint} / {mission.waypointCoordinates?.length || 0}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Battery</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BatteryIcon color={getBatteryColor(batteryLevel)} sx={{ mr: 1 }} />
                  <Typography variant="body2">{batteryLevel.toFixed(0)}%</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Data Collected</Typography>
                <Typography variant="body2">{dataCollected.toFixed(1)} MB</Typography>
              </Box>
              
              {mission.status === 'in_progress' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated time remaining: {remainingTime} minutes
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {getActionButtons()}
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Live Telemetry</Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><LocationIcon fontSize="small" /> Altitude</TableCell>
                      <TableCell align="right">{telemetryData.altitude} m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><SpeedIcon fontSize="small" /> Speed</TableCell>
                      <TableCell align="right">{telemetryData.speed} m/s</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Heading</TableCell>
                      <TableCell align="right">{telemetryData.heading}°</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Temperature</TableCell>
                      <TableCell align="right">{telemetryData.temperature.toFixed(1)}°C</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Wind</TableCell>
                      <TableCell align="right">{telemetryData.wind.speed.toFixed(1)} m/s {telemetryData.wind.direction}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Distance Traveled</TableCell>
                      <TableCell align="right">{distanceTraveled.toFixed(0)} m</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Sensor Status:</Typography>
                <Chip 
                  size="small"
                  label={sensorStatus.toUpperCase()} 
                  color={getSensorStatusColor(sensorStatus)}
                />
              </Box>
              
              {mission.parameters?.sensorType && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Sensor Type:</Typography>
                  <Typography variant="body2">
                    {mission.parameters.sensorType === 'rgb' && 'RGB Camera'}
                    {mission.parameters.sensorType === 'multispectral' && 'Multispectral'}
                    {mission.parameters.sensorType === 'thermal' && 'Thermal'}
                    {mission.parameters.sensorType === 'lidar' && 'LiDAR'}
                    {mission.parameters.sensorType === 'hyperspectral' && 'Hyperspectral'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MissionMonitor; 