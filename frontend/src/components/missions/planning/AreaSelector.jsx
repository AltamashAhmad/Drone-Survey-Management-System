import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

// Fix for the missing marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AreaSelector = ({ onAreaSelected, selectedArea }) => {
  const [map, setMap] = useState(null);
  const featureGroupRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  const onCreated = (e) => {
    const layer = e.layer;
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
    onAreaSelected(layer.toGeoJSON());
  };

  const onEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      onAreaSelected(layer.toGeoJSON());
    });
  };

  const onDeleted = () => {
    onAreaSelected(null);
  };

  // Initialize map and load existing survey area
  useEffect(() => {
    if (map && featureGroupRef.current && selectedArea && !initialized) {
      try {
        // Clear any existing layers
        featureGroupRef.current.clearLayers();
        
        // Create a GeoJSON layer and add it to the feature group
        const geoJSONLayer = L.geoJSON(selectedArea);
        
        // Add each feature to the feature group
        geoJSONLayer.eachLayer((layer) => {
          featureGroupRef.current.addLayer(layer);
        });
        
        // Fit map to the bounds of the area
        if (geoJSONLayer.getBounds().isValid()) {
          map.fitBounds(geoJSONLayer.getBounds());
        }
        
        setInitialized(true);
      } catch (error) {
        // Handle error
      }
    }
  }, [map, selectedArea, initialized]);

  // Make sure the map refreshes when resized
  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [map]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Draw Survey Area
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Use the drawing tools to define the survey area. You can draw a polygon around the area you want to survey.
      </Typography>
      
      <Paper sx={{ height: '500px', width: '100%', overflow: 'hidden' }}>
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={onCreated}
              onEdited={onEdited}
              onDeleted={onDeleted}
              draw={{
                rectangle: true,
                polygon: true,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
              edit={{
                edit: true,
                remove: true,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Tips:
        </Typography>
        <ul>
          <li>Click the polygon or rectangle tool to start drawing</li>
          <li>Click points to create the area boundary</li>
          <li>Double-click to finish drawing</li>
          <li>Use the edit tool to modify the area</li>
          <li>Use the delete tool to remove the area and start over</li>
        </ul>
      </Box>
    </Box>
  );
};

export default AreaSelector; 