import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress,
  Alert,
  Slider,
  Typography,
  Box
} from '@mui/material';
import { createDrone, updateDrone } from '../../services/droneService';

const droneStatuses = [
  { value: 'idle', label: 'Idle (Available)' },
  { value: 'in_mission', label: 'In Mission' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'offline', label: 'Offline' }
];

const droneModels = [
  { value: 'DJI Mavic 3', label: 'DJI Mavic 3' },
  { value: 'DJI Phantom 4 Pro', label: 'DJI Phantom 4 Pro' },
  { value: 'Autel EVO II', label: 'Autel EVO II' },
  { value: 'Skydio 2', label: 'Skydio 2' },
  { value: 'DJI Matrice 300 RTK', label: 'DJI Matrice 300 RTK' }
];

const DroneFormDialog = ({ open, onClose, drone, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    status: 'idle',
    battery_level: 100,
    location_lat: '',
    location_lng: '',
    altitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-populate form when editing an existing drone
  useEffect(() => {
    if (drone) {
      setFormData({
        name: drone.name || '',
        model: drone.model || '',
        status: drone.status || 'idle',
        battery_level: drone.battery_level || 100,
        location_lat: drone.location_lat || '',
        location_lng: drone.location_lng || '',
        altitude: drone.altitude || ''
      });
    } else {
      // Reset form for new drone
      setFormData({
        name: '',
        model: '',
        status: 'idle',
        battery_level: 100,
        location_lat: '',
        location_lng: '',
        altitude: ''
      });
    }
  }, [drone, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBatteryChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, battery_level: newValue }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name.trim()) {
      setError('Drone name is required');
      return;
    }
    if (!formData.model.trim()) {
      setError('Drone model is required');
      return;
    }

    // Validate latitude and longitude if provided
    if (formData.location_lat !== '' && (isNaN(Number(formData.location_lat)) || Number(formData.location_lat) < -90 || Number(formData.location_lat) > 90)) {
      setError('Latitude must be a number between -90 and 90');
      return;
    }

    if (formData.location_lng !== '' && (isNaN(Number(formData.location_lng)) || Number(formData.location_lng) < -180 || Number(formData.location_lng) > 180)) {
      setError('Longitude must be a number between -180 and 180');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (drone) {
        // Update existing drone
        await updateDrone(drone.id, formData);
      } else {
        // Create new drone
        await createDrone(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err.message || 'An error occurred while saving the drone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{drone ? 'Edit Drone' : 'Add New Drone'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Drone Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Model</InputLabel>
              <Select
                name="model"
                value={formData.model}
                onChange={handleChange}
                label="Model"
                disabled={loading}
              >
                {droneModels.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
                disabled={loading}
              >
                {droneStatuses.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography gutterBottom>Battery Level: {formData.battery_level}%</Typography>
            <Slider
              value={formData.battery_level}
              onChange={handleBatteryChange}
              aria-labelledby="battery-level-slider"
              valueLabelDisplay="auto"
              step={1}
              min={0}
              max={100}
              disabled={loading}
              sx={{
                color: 
                  formData.battery_level < 20 ? 'error.main' : 
                  formData.battery_level < 50 ? 'warning.main' : 'success.main'
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Location (Optional)</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="location_lat"
                label="Latitude"
                type="number"
                fullWidth
                value={formData.location_lat}
                onChange={handleChange}
                disabled={loading}
                helperText="Range: -90 to 90"
                InputProps={{ 
                  inputProps: { 
                    step: 'any',
                    min: -90,
                    max: 90
                  },
                  placeholder: '' 
                }}
              />
              <TextField
                name="location_lng"
                label="Longitude"
                type="number"
                fullWidth
                value={formData.location_lng}
                onChange={handleChange}
                disabled={loading}
                helperText="Range: -180 to 180"
                InputProps={{ 
                  inputProps: { 
                    step: 'any',
                    min: -180,
                    max: 180
                  },
                  placeholder: ''
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="altitude"
              label="Altitude (meters)"
              type="number"
              fullWidth
              value={formData.altitude}
              onChange={handleChange}
              disabled={loading}
              InputProps={{ 
                inputProps: { step: 'any' },
                placeholder: ''
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {drone ? 'Update' : 'Add'} Drone
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DroneFormDialog; 