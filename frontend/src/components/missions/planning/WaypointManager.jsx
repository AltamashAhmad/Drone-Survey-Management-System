import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';

// Custom marker component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        altitude: null // Will be set from mission parameters
      });
    },
  });
  return null;
};

// Helper function to get coordinates for display
const getCoordinates = (waypoint) => {
  if (waypoint) {
    // If waypoint is in object format
    if (typeof waypoint === 'object' && !Array.isArray(waypoint)) {
      return {
        lat: waypoint.latitude,
        lng: waypoint.longitude
      };
    }
    // If waypoint is in array format [lng, lat]
    else if (Array.isArray(waypoint)) {
      return {
        lat: waypoint[1],
        lng: waypoint[0]
      };
    }
  }
  return { lat: 0, lng: 0 };
};

const WaypointManager = ({ surveyArea, pattern, waypoints, onWaypointsUpdate }) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);

  const handleWaypointClick = (index) => {
    setSelectedWaypoint(index);
  };

  const handleMapClick = useCallback((coords) => {
    const newWaypoints = [...waypoints, coords];
    onWaypointsUpdate(newWaypoints);
  }, [waypoints, onWaypointsUpdate]);

  const handleMoveWaypoint = (index, direction) => {
    if (index + direction < 0 || index + direction >= waypoints.length) return;
    
    const newWaypoints = [...waypoints];
    const temp = newWaypoints[index];
    newWaypoints[index] = newWaypoints[index + direction];
    newWaypoints[index + direction] = temp;
    onWaypointsUpdate(newWaypoints);
  };

  const handleDeleteWaypoint = (index) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    onWaypointsUpdate(newWaypoints);
    if (selectedWaypoint === index) {
      setSelectedWaypoint(null);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Manage Waypoints
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Waypoint List
            </Typography>
            <List>
              {waypoints.map((waypoint, index) => {
                const coords = getCoordinates(waypoint);
                return (
                  <ListItem
                    key={index}
                    selected={selectedWaypoint === index}
                    onClick={() => handleWaypointClick(index)}
                    secondaryAction={
                      <Box>
                        {index > 0 && (
                          <IconButton
                            edge="end"
                            aria-label="move up"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWaypoint(index, -1);
                            }}
                          >
                            <ArrowUpIcon />
                          </IconButton>
                        )}
                        {index < waypoints.length - 1 && (
                          <IconButton
                            edge="end"
                            aria-label="move down"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveWaypoint(index, 1);
                            }}
                          >
                            <ArrowDownIcon />
                          </IconButton>
                        )}
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWaypoint(index);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`Waypoint ${index + 1}`}
                      secondary={`Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '400px', width: '100%', overflow: 'hidden' }}>
            {surveyArea ? (
              <MapContainer
                center={[
                  surveyArea.geometry.coordinates[0][0][1],
                  surveyArea.geometry.coordinates[0][0][0],
                ]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {waypoints.map((waypoint, index) => {
                  const coords = getCoordinates(waypoint);
                  return (
                    <Marker
                      key={index}
                      position={[coords.lat, coords.lng]}
                    />
                  );
                })}
                {waypoints.length > 1 && (
                  <Polyline
                    positions={waypoints.map(wp => {
                      const coords = getCoordinates(wp);
                      return [coords.lat, coords.lng];
                    })}
                    color="#1976d2"
                    weight={2}
                  />
                )}
              </MapContainer>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  Please select a survey area first
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Tips:
        </Typography>
        <ul>
          <li>Click on the map to add new waypoints</li>
          <li>Click on a waypoint to select it</li>
          <li>Use the arrows to reorder waypoints</li>
          <li>Delete unwanted waypoints using the trash icon</li>
          <li>The flight path will automatically update based on waypoint order</li>
        </ul>
      </Box>
    </Box>
  );
};

export default WaypointManager; 