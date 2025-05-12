import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Battery20 as Battery20Icon,
  Battery50 as Battery50Icon,
  BatteryFull as BatteryFullIcon,
  BatteryAlert as BatteryAlertIcon,
  FlightTakeoff as FlightTakeoffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDrones, deleteDrone } from '../../services/droneService';
import DroneFormDialog from './DroneFormDialog';

const FleetManagement = () => {
  const navigate = useNavigate();
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      setLoading(true);
      const data = await getDrones();
      setDrones(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch drones');
      console.error('Error fetching drones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (drone = null) => {
    setSelectedDrone(drone);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDrone(null);
  };

  const handleDeleteDrone = async (id, status) => {
    let confirmMessage = 'Are you sure you want to delete this drone?';
    
    if (status === 'in_mission') {
      confirmMessage = 'WARNING: This drone is currently in an active mission. Deleting it may cause mission failures or data loss. Are you absolutely sure you want to proceed?';
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteDrone(id);
        fetchDrones(); // Refresh the list
      } catch (err) {
        console.error('Error deleting drone:', err);
        alert(err.message);
      }
    }
  };

  const handleAssignToMission = (droneId) => {
    navigate(`/missions/new?drone=${droneId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle':
        return 'success';
      case 'in_mission':
        return 'primary';
      case 'maintenance':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBatteryIcon = (level) => {
    if (level < 20) {
      return <BatteryAlertIcon color="error" />;
    } else if (level < 50) {
      return <Battery20Icon color="warning" />;
    } else if (level < 80) {
      return <Battery50Icon color="info" />;
    } else {
      return <BatteryFullIcon color="success" />;
    }
  };

  // Calculate drone stats
  const droneStats = {
    total: drones.length,
    available: drones.filter(drone => drone.status === 'idle').length,
    inMission: drones.filter(drone => drone.status === 'in_mission').length,
    maintenance: drones.filter(drone => drone.status === 'maintenance').length,
    lowBattery: drones.filter(drone => drone.battery_level < 20).length
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Fleet Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Drone
        </Button>
      </Box>

      {/* Fleet Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Drones
              </Typography>
              <Typography variant="h3">{droneStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available
              </Typography>
              <Typography variant="h3" color="success.main">{droneStats.available}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Mission
              </Typography>
              <Typography variant="h3" color="primary.main">{droneStats.inMission}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Maintenance
              </Typography>
              <Typography variant="h3" color="warning.main">{droneStats.maintenance}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Battery
              </Typography>
              <Typography variant="h3" color="error.main">{droneStats.lowBattery}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drone List */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        ) : drones.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No drones available. Click "Add Drone" to add your first drone.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Battery</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drones.map((drone) => (
                  <TableRow key={drone.id}>
                    <TableCell>{drone.name}</TableCell>
                    <TableCell>{drone.model}</TableCell>
                    <TableCell>
                      <Chip
                        label={drone.status}
                        color={getStatusColor(drone.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getBatteryIcon(drone.battery_level)}
                        <Box sx={{ ml: 1, width: '100%', maxWidth: 100 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={drone.battery_level} 
                            color={
                              drone.battery_level < 20 ? "error" : 
                              drone.battery_level < 50 ? "warning" : "success"
                            }
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {drone.battery_level}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {drone.location_lat && drone.location_lng ? (
                        <Tooltip title={`${drone.location_lat}, ${drone.location_lng}`}>
                          <span>View on Map</span>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          No location data
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {drone.updated_at ? new Date(drone.updated_at).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog(drone)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {drone.status === 'idle' && (
                        <Tooltip title="Assign to Mission">
                          <IconButton 
                            onClick={() => handleAssignToMission(drone.id)} 
                            size="small" 
                            color="primary"
                          >
                            <FlightTakeoffIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDeleteDrone(drone.id, drone.status)} 
                          size="small" 
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Drone Form Dialog */}
      <DroneFormDialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        drone={selectedDrone}
        onSuccess={fetchDrones}
      />
    </Box>
  );
};

export default FleetManagement; 