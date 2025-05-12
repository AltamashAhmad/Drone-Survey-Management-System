import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const MissionParameters = ({ parameters, onParametersUpdate }) => {
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    onParametersUpdate({ [field]: value });
  };

  const handleSliderChange = (field) => (_, value) => {
    onParametersUpdate({ [field]: value });
  };

  const handleSwitchChange = (field) => (event) => {
    const value = event.target.checked;
    onParametersUpdate({ [field]: value });
  };

  // Set advanced sensor options based on selected sensor type
  const getSensorSpecificOptions = () => {
    switch(parameters.sensorType) {
      case 'rgb':
        return (
          <>
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel>Resolution</InputLabel>
              <Select
                value={parameters.resolution || "4k"}
                onChange={handleChange('resolution')}
                label="Resolution"
              >
                <MenuItem value="hd">HD (1080p)</MenuItem>
                <MenuItem value="2k">2K</MenuItem>
                <MenuItem value="4k">4K</MenuItem>
                <MenuItem value="8k">8K</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={parameters.hdr || false}
                  onChange={handleSwitchChange('hdr')}
                />
              }
              label="HDR Imaging"
              sx={{ mt: 2 }}
            />
          </>
        );
      case 'multispectral':
        return (
          <>
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel>Bands</InputLabel>
              <Select
                value={parameters.bands || "rgnir"}
                onChange={handleChange('bands')}
                label="Bands"
              >
                <MenuItem value="rgnir">RGB + NIR</MenuItem>
                <MenuItem value="rededge">RedEdge (5-band)</MenuItem>
                <MenuItem value="full">Full Spectrum (10-band)</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Radiometric Calibration</Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={parameters.radiometricCalibration || false}
                    onChange={handleSwitchChange('radiometricCalibration')}
                  />
                }
                label="Enabled"
              />
            </Box>
          </>
        );
      case 'thermal':
        return (
          <>
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel>Temperature Range</InputLabel>
              <Select
                value={parameters.temperatureRange || "standard"}
                onChange={handleChange('temperatureRange')}
                label="Temperature Range"
              >
                <MenuItem value="standard">Standard (-20°C to 120°C)</MenuItem>
                <MenuItem value="extended">Extended (-40°C to 550°C)</MenuItem>
                <MenuItem value="high">High Precision (0°C to 150°C)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={parameters.dualMode || false}
                  onChange={handleSwitchChange('dualMode')}
                />
              }
              label="Dual Mode (Thermal + Visual)"
              sx={{ mt: 2 }}
            />
          </>
        );
      case 'lidar':
        return (
          <>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Point Density (points/m²)</Typography>
              <Slider
                value={parameters.pointDensity || 50}
                onChange={handleSliderChange('pointDensity')}
                min={10}
                max={200}
                step={10}
                marks={[
                  { value: 10, label: '10' },
                  { value: 200, label: '200' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <InputLabel>Scan Pattern</InputLabel>
              <Select
                value={parameters.scanPattern || "linear"}
                onChange={handleChange('scanPattern')}
                label="Scan Pattern"
              >
                <MenuItem value="linear">Linear</MenuItem>
                <MenuItem value="rotating">Rotating</MenuItem>
                <MenuItem value="solid-state">Solid State</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 'hyperspectral':
        return (
          <>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Spectral Range (nm)</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Min"
                  size="small"
                  type="number"
                  value={parameters.spectralRangeMin || 400}
                  onChange={handleChange('spectralRangeMin')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">nm</InputAdornment>,
                  }}
                />
                <TextField
                  label="Max"
                  size="small"
                  type="number"
                  value={parameters.spectralRangeMax || 1000}
                  onChange={handleChange('spectralRangeMax')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">nm</InputAdornment>,
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Spectral Resolution</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={parameters.spectralResolution || 10}
                onChange={handleChange('spectralResolution')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">nm</InputAdornment>,
                }}
              />
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Mission Parameters
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Flight Parameters
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Flight Altitude</Typography>
              <Slider
                value={parameters.altitude}
                onChange={handleSliderChange('altitude')}
                min={10}
                max={400}
                step={5}
                marks={[
                  { value: 10, label: '10m' },
                  { value: 400, label: '400m' },
                ]}
                valueLabelDisplay="auto"
              />
              <TextField
                value={parameters.altitude}
                onChange={handleChange('altitude')}
                type="number"
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                }}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Flight Speed</Typography>
              <Slider
                value={parameters.speed}
                onChange={handleSliderChange('speed')}
                min={5}
                max={30}
                step={1}
                marks={[
                  { value: 5, label: '5m/s' },
                  { value: 30, label: '30m/s' },
                ]}
                valueLabelDisplay="auto"
              />
              <TextField
                value={parameters.speed}
                onChange={handleChange('speed')}
                type="number"
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">m/s</InputAdornment>,
                }}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Return to Home Altitude</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={parameters.returnAltitude || parameters.altitude + 20}
                onChange={handleChange('returnAltitude')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Recommended to be higher than survey altitude
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Data Collection Parameters
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sensor Type</InputLabel>
                <Select
                  value={parameters.sensorType}
                  onChange={handleChange('sensorType')}
                  label="Sensor Type"
                >
                  <MenuItem value="rgb">RGB Camera</MenuItem>
                  <MenuItem value="multispectral">Multispectral</MenuItem>
                  <MenuItem value="thermal">Thermal</MenuItem>
                  <MenuItem value="lidar">LiDAR</MenuItem>
                  <MenuItem value="hyperspectral">Hyperspectral</MenuItem>
                </Select>
              </FormControl>
              
              {/* Advanced Sensor Settings */}
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Advanced Sensor Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {getSensorSpecificOptions()}
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Image Overlap (%)</Typography>
              <Slider
                value={parameters.overlap}
                onChange={handleSliderChange('overlap')}
                min={30}
                max={90}
                step={5}
                marks={[
                  { value: 30, label: '30%' },
                  { value: 90, label: '90%' },
                ]}
                valueLabelDisplay="auto"
              />
              <TextField
                value={parameters.overlap}
                onChange={handleChange('overlap')}
                type="number"
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Collection Frequency</Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={parameters.collectionFrequency}
                onChange={handleChange('collectionFrequency')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={parameters.geoTagging || true}
                    onChange={handleSwitchChange('geoTagging')}
                  />
                }
                label="Geo-Tagging"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={parameters.realTimeTransmission || false}
                    onChange={handleSwitchChange('realTimeTransmission')}
                  />
                }
                label="Real-Time Data Transmission"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Note: These parameters will affect the mission duration, battery consumption, and data quality.
        Make sure to consider:
        <ul>
          <li>Higher altitude = Wider coverage but lower resolution</li>
          <li>Higher speed = Shorter mission time but might affect data quality</li>
          <li>Higher overlap = Better data quality but longer mission time</li>
          <li>Collection frequency should match your speed and coverage requirements</li>
          <li>Advanced sensor settings will impact battery usage and data storage requirements</li>
        </ul>
      </Typography>
    </Box>
  );
};

export default MissionParameters; 