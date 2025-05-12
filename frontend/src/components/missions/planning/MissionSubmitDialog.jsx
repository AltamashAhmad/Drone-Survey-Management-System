import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { createMission, updateMission, validateMissionData } from '../../../services/missionService';
import { getDrones } from '../../../services/droneService';

const MissionSubmitDialog = ({ open, onClose, missionData, isEditing, onSuccess, preselectedDroneId }) => {
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    droneId: '',
  });
  const [availableDrones, setAvailableDrones] = useState([]);
  const [allDrones, setAllDrones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadingDrones, setLoadingDrones] = useState(false);
  const [saveMissionOnly, setSaveMissionOnly] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Separate function to handle form input changes
  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchAvailableDrones = useCallback(async () => {
    // Avoid refetching if we already have drones
    if (allDrones.length > 0 && !open) return;
    
    try {
      setLoadingDrones(true);
      const drones = await getDrones();
      
      // Save all drones for reference
      setAllDrones(drones);
      
      // Filter to only show available (idle) drones
      const idleDrones = drones.filter(drone => drone.status === 'idle');
      setAvailableDrones(idleDrones);
      
      // If we have a preselected drone ID, check if it's available
      if (preselectedDroneId) {
        const preselectedDrone = drones.find(d => d.id === preselectedDroneId);
        if (preselectedDrone && preselectedDrone.status === 'idle') {
          handleInputChange('droneId', preselectedDroneId);
        } else if (preselectedDrone) {
          // The preselected drone exists but is not available
          setError(`The selected drone "${preselectedDrone.name}" is currently ${preselectedDrone.status}. Please select another drone or save the mission for later.`);
        }
      }
      // If we're editing and the mission already has a drone, use that if available
      else if (isEditing && missionData.droneId) {
        const missionDrone = drones.find(d => d.id === missionData.droneId);
        if (missionDrone && missionDrone.status === 'idle') {
          handleInputChange('droneId', missionData.droneId);
        }
      }
      // Otherwise if we have idle drones, select the first one by default
      else if (idleDrones.length > 0 && !formState.droneId) {
        handleInputChange('droneId', idleDrones[0].id);
      }
    } catch (error) {
      console.error('Error fetching available drones:', error);
      setError('Failed to load available drones. Please try again.');
    } finally {
      setLoadingDrones(false);
    }
  }, [preselectedDroneId, isEditing, missionData, formState.droneId, allDrones.length, open]);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && missionData && !initialDataLoaded) {
      setFormState({
        name: missionData.name || '',
        description: missionData.description || '',
        droneId: missionData.droneId || preselectedDroneId || ''
      });
      setSaveMissionOnly(false);
      fetchAvailableDrones();
      setInitialDataLoaded(true);
    } else if (!open) {
      // Reset initialDataLoaded when dialog closes
      setInitialDataLoaded(false);
    }
  }, [open, missionData, preselectedDroneId, fetchAvailableDrones, initialDataLoaded]);

  const handleSubmit = async () => {
    const fullMissionData = {
      ...missionData,
      name: formState.name,
      description: formState.description,
      droneId: formState.droneId
    };

    // Validate mission data - only for new missions
    if (!isEditing) {
      const validationErrors = validateMissionData(fullMissionData);
      if (validationErrors) {
        setError(Object.values(validationErrors).join(', '));
        return;
      }
    } else if (!formState.name.trim()) {
      setError('Mission name is required');
      return;
    }

    // If we're not just saving the mission, validate drone selection
    if (!saveMissionOnly && !formState.droneId) {
      setError('Please select a drone for this mission or choose "Save Mission Only"');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Format waypoints if needed
      let formattedWaypoints = missionData.waypoints;
      
      // If waypoints are still in the old array format, convert them
      if (missionData.waypoints.length > 0 && Array.isArray(missionData.waypoints[0])) {
        formattedWaypoints = missionData.waypoints.map(wp => ({
          latitude: wp[1],
          longitude: wp[0],
          altitude: missionData.parameters.altitude
        }));
      } else if (missionData.waypoints.length > 0) {
        // Make sure all waypoints have altitude set
        formattedWaypoints = missionData.waypoints.map(wp => ({
          ...wp,
          altitude: wp.altitude || missionData.parameters.altitude
        }));
      }
      
      if (isEditing) {
        await updateMission(missionData.id, {
          name: formState.name,
          description: formState.description,
          drone_id: saveMissionOnly ? null : formState.droneId,
          flight_altitude: missionData.parameters.altitude,
          flight_speed: missionData.parameters.speed,
          sensor_type: missionData.parameters.sensorType,
          survey_pattern: missionData.flightPattern,
          overlap_percentage: missionData.parameters.overlap,
          data_collection_frequency: missionData.parameters.collectionFrequency,
          survey_area: missionData.surveyArea,
          waypoints: formattedWaypoints,
          status: saveMissionOnly ? 'planned' : 'ready' // Mark as ready if a drone is assigned
        });
      } else {
        // Add drone_id to the mission data
        await createMission({
          ...fullMissionData,
          drone_id: saveMissionOnly ? null : formState.droneId,
          status: saveMissionOnly ? 'planned' : 'ready', // Mark as ready if a drone is assigned
          waypoints: formattedWaypoints
        });
      }
      onSuccess();
    } catch (err) {
      console.error("Error during mission submit:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimates = () => {
    const { speed } = missionData.parameters;
    const waypoints = missionData.waypoints;
    
    if (!waypoints || waypoints.length === 0) {
      return { distance: 0, duration: 0, waypoints: 0 };
    }
    
    // Calculate total distance (very rough estimation)
    let totalDistance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const current = waypoints[i];
      const previous = waypoints[i-1];
      
      // Get coordinates based on format (array or object)
      const currentLng = Array.isArray(current) ? current[0] : current.longitude;
      const currentLat = Array.isArray(current) ? current[1] : current.latitude;
      const prevLng = Array.isArray(previous) ? previous[0] : previous.longitude;
      const prevLat = Array.isArray(previous) ? previous[1] : previous.latitude;
      
      // Calculate distance
      const dx = currentLng - prevLng;
      const dy = currentLat - prevLat;
      totalDistance += Math.sqrt(dx * dx + dy * dy) * 111000; // Convert to meters (rough)
    }

    // Estimate duration
    const speedInMetersPerSecond = speed || 15;
    const durationMinutes = Math.ceil(totalDistance / (speedInMetersPerSecond * 60));
    
    return {
      distance: Math.ceil(totalDistance),
      duration: durationMinutes,
      waypoints: waypoints.length
    };
  };

  const estimates = calculateEstimates();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Update Mission' : 'Create Mission'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Mission Name"
          fullWidth
          value={formState.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={formState.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
          <InputLabel>Assign Drone</InputLabel>
          <Select
            value={formState.droneId}
            onChange={(e) => handleInputChange('droneId', e.target.value)}
            label="Assign Drone"
            disabled={loadingDrones || isSubmitting || saveMissionOnly}
          >
            {availableDrones.map((drone) => (
              <MenuItem key={drone.id} value={drone.id}>
                {drone.name} ({drone.model}) - Battery: {drone.battery_level}%
              </MenuItem>
            ))}
            {availableDrones.length === 0 && (
              <MenuItem disabled value="">
                No available drones at the moment
              </MenuItem>
            )}
          </Select>
        </FormControl>

        {allDrones.length > 0 && availableDrones.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            All drones are currently busy. You can save this mission and assign a drone later when one becomes available.
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button 
            variant={saveMissionOnly ? "contained" : "outlined"}
            color={saveMissionOnly ? "primary" : "secondary"}
            onClick={() => setSaveMissionOnly(!saveMissionOnly)}
            disabled={isSubmitting}
          >
            {saveMissionOnly ? "Mission Only (No Drone)" : "Save Mission Only"}
          </Button>
          {saveMissionOnly && (
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
              Mission will be saved without assigning a drone. You can assign one later.
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Mission Summary
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Survey Area Pattern: <strong>{missionData.flightPattern}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Flight Altitude: <strong>{missionData.parameters.altitude}m</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Flight Speed: <strong>{missionData.parameters.speed}m/s</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Sensor Type: <strong>{missionData.parameters.sensorType}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Image Overlap: <strong>{missionData.parameters.overlap}%</strong>
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Estimated Mission Stats
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Total Distance: <strong>{(estimates.distance / 1000).toFixed(2)}km</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Estimated Duration: <strong>{estimates.duration} minutes</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            Number of Waypoints: <strong>{estimates.waypoints}</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formState.name.trim() || isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : (isEditing ? 'Update Mission' : 'Create Mission')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MissionSubmitDialog; 