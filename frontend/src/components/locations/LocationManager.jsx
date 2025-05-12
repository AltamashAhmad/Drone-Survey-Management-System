import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MyLocation as CurrentLocationIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom location marker
const locationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

// Component to handle map click events and current location
const LocationMarker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    }
  });
  
  return null;
};

const LocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default center (can be changed)
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    type: 'survey_site',
    latitude: null,
    longitude: null,
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call to get locations from the backend
      // For now, we'll use a mock API response
      setTimeout(() => {
        const mockLocations = [
          {
            id: 1,
            name: 'Farm Alpha',
            description: 'Agricultural survey site',
            type: 'survey_site',
            latitude: 51.505,
            longitude: -0.09,
            address: '123 Farm Road, Countryside',
            notes: 'Good access point from eastern gate',
            created_at: '2023-11-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Construction Site Beta',
            description: 'Building progress monitoring',
            type: 'construction',
            latitude: 51.51,
            longitude: -0.1,
            address: '456 Development Ave, City Center',
            notes: 'Contact site manager before flying',
            created_at: '2023-11-20T14:15:00Z'
          },
          {
            id: 3,
            name: 'National Park Survey',
            description: 'Environmental monitoring',
            type: 'environmental',
            latitude: 51.52,
            longitude: -0.12,
            address: 'North Ridge, National Park',
            notes: 'Special permit required. Wildlife protection zone.',
            created_at: '2023-12-01T09:45:00Z'
          }
        ];
        setLocations(mockLocations);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to fetch locations. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAddLocation = () => {
    setNewLocation({
      name: '',
      description: '',
      type: 'survey_site',
      latitude: null,
      longitude: null,
      address: '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditLocation = (location) => {
    setNewLocation({
      ...location
    });
    setSelectedLocation(location);
    setIsDialogOpen(true);
  };

  const handleLocationSelect = (latlng) => {
    if (isDialogOpen) {
      setNewLocation({
        ...newLocation,
        latitude: latlng.lat,
        longitude: latlng.lng
      });
      
      // Attempt to get address from coordinates using reverse geocoding
      fetchAddressFromCoordinates(latlng.lat, latlng.lng);
    }
  };
  
  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      // In a real app, this would call a geocoding service like Google Maps or Nominatim
      // For this demo, we'll just set a placeholder address
      setNewLocation(prev => ({
        ...prev,
        address: `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }));
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation({
      ...newLocation,
      [name]: value
    });
  };

  const handleSaveLocation = async () => {
    try {
      setIsLoading(true);
      // Validate form
      if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
        setError('Name and location coordinates are required');
        setIsLoading(false);
        return;
      }
      
      // In a real app, this would be an API call to save the location
      // For now, we'll simulate a successful save
      setTimeout(() => {
        if (selectedLocation) {
          // Update existing location
          const updatedLocations = locations.map(loc => 
            loc.id === selectedLocation.id ? { ...newLocation, id: loc.id } : loc
          );
          setLocations(updatedLocations);
        } else {
          // Add new location
          const newId = Math.max(...locations.map(l => l.id), 0) + 1;
          setLocations([
            ...locations, 
            { 
              ...newLocation, 
              id: newId,
              created_at: new Date().toISOString()
            }
          ]);
        }
        
        setIsDialogOpen(false);
        setSelectedLocation(null);
        setIsLoading(false);
        setError(null);
      }, 1000);
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Failed to save location. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to delete the location
      // For now, we'll simulate a successful delete
      setTimeout(() => {
        setLocations(locations.filter(loc => loc.id !== locationId));
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error deleting location:', err);
      setError('Failed to delete location. Please try again.');
      setIsLoading(false);
    }
  };

  const getLocationTypeColor = (type) => {
    switch (type) {
      case 'survey_site':
        return 'primary';
      case 'construction':
        return 'warning';
      case 'environmental':
        return 'success';
      case 'industrial':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLocationTypeLabel = (type) => {
    switch (type) {
      case 'survey_site':
        return 'Survey Site';
      case 'construction':
        return 'Construction';
      case 'environmental':
        return 'Environmental';
      case 'industrial':
        return 'Industrial';
      default:
        return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Location Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLocation}
        >
          Add Location
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Map View */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '500px' }}>
            <CardContent sx={{ height: '100%', p: 0 }}>
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Render all saved locations */}
                {locations.map(location => (
                  <Marker 
                    key={location.id}
                    position={[location.latitude, location.longitude]}
                    icon={locationIcon}
                  >
                    <Popup>
                      <Typography variant="subtitle2">{location.name}</Typography>
                      <Typography variant="body2">{location.description}</Typography>
                      <Chip 
                        size="small" 
                        label={getLocationTypeLabel(location.type)} 
                        color={getLocationTypeColor(location.type)}
                        sx={{ mt: 1 }}
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleEditLocation(location)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Handle map clicks to set location */}
                <LocationMarker onLocationSelect={handleLocationSelect} />
              </MapContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Location List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '500px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Saved Locations ({locations.length})
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : locations.length === 0 ? (
              <Alert severity="info">
                No locations added yet. Click "Add Location" to create one.
              </Alert>
            ) : (
              <List>
                {locations.map((location, index) => (
                  <React.Fragment key={location.id}>
                    {index > 0 && <Divider />}
                    <ListItem button onClick={() => setMapCenter([location.latitude, location.longitude])}>
                      <ListItemText 
                        primary={location.name}
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span">
                              {location.description}
                            </Typography>
                            <br />
                            <Chip 
                              size="small" 
                              label={getLocationTypeLabel(location.type)} 
                              color={getLocationTypeColor(location.type)}
                              sx={{ mt: 0.5 }}
                            />
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Edit Location">
                          <IconButton edge="end" onClick={() => handleEditLocation(location)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Location">
                          <IconButton edge="end" onClick={() => handleDeleteLocation(location.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Location Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Location Statistics
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Recent Missions</TableCell>
                      <TableCell align="right">Last Survey</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label="Survey Site" 
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {locations.filter(l => l.type === 'survey_site').length}
                      </TableCell>
                      <TableCell align="right">5</TableCell>
                      <TableCell align="right">3 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label="Construction" 
                          color="warning"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {locations.filter(l => l.type === 'construction').length}
                      </TableCell>
                      <TableCell align="right">2</TableCell>
                      <TableCell align="right">1 week ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label="Environmental" 
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {locations.filter(l => l.type === 'environmental').length}
                      </TableCell>
                      <TableCell align="right">3</TableCell>
                      <TableCell align="right">2 days ago</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label="Industrial" 
                          color="error"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {locations.filter(l => l.type === 'industrial').length}
                      </TableCell>
                      <TableCell align="right">0</TableCell>
                      <TableCell align="right">Never</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Location Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLocation ? 'Edit Location' : 'Add New Location'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location Name"
                  name="name"
                  value={newLocation.name}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newLocation.description}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  select
                  label="Location Type"
                  name="type"
                  value={newLocation.type}
                  onChange={handleInputChange}
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="survey_site">Survey Site</option>
                  <option value="construction">Construction</option>
                  <option value="environmental">Environmental</option>
                  <option value="industrial">Industrial</option>
                </TextField>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={newLocation.address}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={newLocation.notes}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Click on the map to set location coordinates
                </Typography>
                <Box sx={{ height: '300px', mb: 2 }}>
                  <MapContainer 
                    center={mapCenter} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    key={`dialog-map-${isDialogOpen}`}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Show marker for the currently selected position */}
                    {newLocation.latitude && newLocation.longitude && (
                      <Marker 
                        position={[newLocation.latitude, newLocation.longitude]}
                      >
                        <Popup>
                          Selected Location
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Handle map clicks to set location */}
                    <LocationMarker onLocationSelect={handleLocationSelect} />
                  </MapContainer>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      name="latitude"
                      value={newLocation.latitude || ''}
                      onChange={handleInputChange}
                      type="number"
                      margin="normal"
                      required
                      InputProps={{
                        inputProps: { 
                          min: -90, 
                          max: 90,
                          step: 0.000001
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      name="longitude"
                      value={newLocation.longitude || ''}
                      onChange={handleInputChange}
                      type="number"
                      margin="normal"
                      required
                      InputProps={{
                        inputProps: { 
                          min: -180, 
                          max: 180,
                          step: 0.000001
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="outlined"
                  startIcon={<CurrentLocationIcon />}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => {
                    // In a real app, this would use the browser's geolocation API
                    // For the demo, we'll just set some random coordinates near the map center
                    const lat = mapCenter[0] + (Math.random() * 0.01);
                    const lng = mapCenter[1] + (Math.random() * 0.01);
                    setNewLocation({
                      ...newLocation,
                      latitude: lat,
                      longitude: lng
                    });
                    fetchAddressFromCoordinates(lat, lng);
                  }}
                >
                  Use Current Location
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveLocation} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationManager; 