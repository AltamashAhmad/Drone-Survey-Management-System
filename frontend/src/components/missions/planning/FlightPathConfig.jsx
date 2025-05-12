import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { calculateFlightPath, generateWaypoints } from '../../../utils/flightPathCalculator';

const FlightPathConfig = ({ surveyArea, pattern, onPatternChange, onWaypointsUpdate }) => {
  // Calculate flight path based on pattern and area using useMemo
  const flightPath = useMemo(() => {
    return surveyArea ? calculateFlightPath(surveyArea, pattern) : [];
  }, [surveyArea, pattern]);

  // Update waypoints when flight path changes
  useEffect(() => {
    if (flightPath.length > 0 && onWaypointsUpdate) {
      const waypoints = generateWaypoints(flightPath);
      onWaypointsUpdate(waypoints);
    }
  }, [flightPath, onWaypointsUpdate]);

  const handlePatternChange = (event) => {
    onPatternChange(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Flight Path
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Flight Pattern</FormLabel>
              <RadioGroup value={pattern} onChange={handlePatternChange}>
                <FormControlLabel
                  value="grid"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Grid Pattern</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Systematic back-and-forth pattern for complete coverage
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="crosshatch"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Crosshatch Pattern</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Perpendicular passes for detailed scanning
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="perimeter"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Perimeter Pattern</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Follow the boundary of the area
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
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
                {flightPath.map((path, index) => (
                  <Polyline
                    key={index}
                    positions={path.map(point => [point[1], point[0]])}
                    color="#1976d2"
                    weight={2}
                    dashArray="5, 10"
                  />
                ))}
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

      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        The flight path will be automatically optimized based on the selected pattern and survey area.
        The drone will follow this path while maintaining the specified altitude and data collection parameters.
      </Typography>
    </Box>
  );
};

export default FlightPathConfig; 