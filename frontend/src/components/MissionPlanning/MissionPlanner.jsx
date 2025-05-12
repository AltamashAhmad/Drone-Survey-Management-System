import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import axios from 'axios';

// Fix Leaflet icon issues
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MissionPlanner = () => {
  const [mission, setMission] = useState({
    name: '',
    description: '',
    drone_id: '',
    flight_altitude: 50,
    overlap_percentage: 20,
    data_collection_frequency: 5,
    pattern: 'grid'
  });
  const [drones, setDrones] = useState([]);
  const [drawnItems, setDrawnItems] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/drones');
        setDrones(response.data);
        if (response.data.length > 0) {
          setMission(prev => ({ ...prev, drone_id: response.data[0].id }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching drones:', error);
        setLoading(false);
      }
    };

    fetchDrones();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMission(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!drawnItems || drawnItems.getLayers().length === 0) {
      alert('Please draw a survey area on the map');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/missions', mission);
      setMessage('Mission created successfully!');
        setMission({
          name: '',
          description: '',
          drone_id: drones.length > 0 ? drones[0].id : '',
          flight_altitude: 50,
          overlap_percentage: 20,
          data_collection_frequency: 5,
          pattern: 'grid'
        });
        drawnItems.clearLayers();
        setWaypoints([]);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
        console.error('Error creating mission:', error);
      setMessage('Failed to create mission. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreated = (e) => {
    const layer = e.layer;
    
    // Generate waypoints based on the drawn shape
    if (layer instanceof L.Polygon) {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      const width = L.CRS.EPSG3857.distance(
        L.latLng(center.lat, sw.lng),
        L.latLng(center.lat, ne.lng)
      );
      const height = L.CRS.EPSG3857.distance(
        L.latLng(sw.lat, center.lng),
        L.latLng(ne.lat, center.lng)
      );
      
      // Generate grid waypoints
      const newWaypoints = [];
      const spacing = 10; // meters between waypoints
      
      if (mission.pattern === 'grid') {
        for (let x = 0; x <= width; x += spacing) {
          for (let y = 0; y <= height; y += spacing) {
            const point = L.GeometryUtil.destination(
              L.latLng(sw.lat, sw.lng),
              x < width / 2 ? 90 : 270,
              x % (2 * spacing) < spacing ? y : height - y
            );
            
            if (layer.contains(point)) {
              newWaypoints.push({
                lat: point.lat,
                lng: point.lng
              });
            }
          }
        }
      } else if (mission.pattern === 'crosshatch') {
        // Horizontal lines
        for (let y = 0; y <= height; y += spacing * 2) {
          for (let x = 0; x <= width; x += spacing / 5) {
            const point = L.GeometryUtil.destination(
              L.latLng(sw.lat, sw.lng),
              90,
              x
            );
            point.lat += y * (ne.lat - sw.lat) / height;
            
            if (layer.contains(point)) {
              newWaypoints.push({
                lat: point.lat,
                lng: point.lng
              });
            }
          }
        }
        
        // Vertical lines
        for (let x = 0; x <= width; x += spacing * 2) {
          for (let y = 0; y <= height; y += spacing / 5) {
            const point = L.GeometryUtil.destination(
              L.latLng(sw.lat, sw.lng),
              0,
              y
            );
            point.lng += x * (ne.lng - sw.lng) / width;
            
            if (layer.contains(point)) {
              newWaypoints.push({
                lat: point.lat,
                lng: point.lng
              });
            }
          }
        }
      } else if (mission.pattern === 'perimeter') {
        if (layer.getLatLngs()[0]) {
          const vertices = layer.getLatLngs()[0];
          for (let i = 0; i < vertices.length; i++) {
            const start = vertices[i];
            const end = vertices[(i + 1) % vertices.length];
            
            const distance = start.distanceTo(end);
            const segments = Math.max(1, Math.floor(distance / spacing));
            
            for (let j = 0; j <= segments; j++) {
              const point = L.GeometryUtil.interpolateOnLine(
                null,
                [start, end],
                j / segments
              );
              
              if (point && point.latLng) {
                newWaypoints.push({
                  lat: point.latLng.lat,
                  lng: point.latLng.lng
                });
              }
            }
          }
        }
      }
      
      setWaypoints(newWaypoints);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mission Planner
      </Typography>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da', 
          color: message.includes('success') ? '#155724' : '#721c24',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mission Details
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Mission Name"
                name="name"
                value={mission.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={mission.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={2}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Drone</InputLabel>
                <Select
                  name="drone_id"
                  value={mission.drone_id}
                  onChange={handleInputChange}
                  label="Drone"
                >
                  {drones.map(drone => (
                    <MenuItem key={drone.id} value={drone.id}>
                      {drone.name} ({drone.model}) - {drone.status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Flight Altitude (meters)"
                name="flight_altitude"
                type="number"
                value={mission.flight_altitude}
                onChange={handleInputChange}
                margin="normal"
                required
                inputProps={{ min: 10, max: 500 }}
              />
              <TextField
                fullWidth
                label="Overlap Percentage"
                name="overlap_percentage"
                type="number"
                value={mission.overlap_percentage}
                onChange={handleInputChange}
                margin="normal"
                inputProps={{ min: 0, max: 90 }}
              />
              <TextField
                fullWidth
                label="Data Collection Frequency (seconds)"
                name="data_collection_frequency"
                type="number"
                value={mission.data_collection_frequency}
                onChange={handleInputChange}
                margin="normal"
                inputProps={{ min: 1, max: 60 }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Flight Pattern</InputLabel>
                <Select
                  name="pattern"
                  value={mission.pattern}
                  onChange={handleInputChange}
                  label="Flight Pattern"
                >
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="crosshatch">Crosshatch</MenuItem>
                  <MenuItem value="perimeter">Perimeter</MenuItem>
                </Select>
              </FormControl>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }}
              >
                Create Mission
              </Button>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '600px' }}>
            <Typography variant="h6" gutterBottom>
              Survey Area
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Draw a polygon on the map to define the survey area.
            </Typography>
            <Box sx={{ height: '500px' }}>
              <MapContainer
                center={[28.6139, 77.2090]} // Delhi coordinates
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FeatureGroup
                  ref={(featureGroupRef) => {
                    if (featureGroupRef) {
                      setDrawnItems(featureGroupRef);
                    }
                  }}
                >
                  <EditControl
                    position="topright"
                    draw={{
                      rectangle: true,
                      polygon: true,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                      polyline: false,
                    }}
                    onCreated={handleCreated}
                  />
                </FeatureGroup>
              </MapContainer>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {waypoints.length > 0 ? `Generated ${waypoints.length} waypoints` : 'No waypoints generated yet'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MissionPlanner;
