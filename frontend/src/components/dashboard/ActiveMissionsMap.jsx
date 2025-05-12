import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStatusLabel } from '../../utils/statusUtils';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Try to create a custom drone icon, but fall back to default if image isn't found
let droneIcon;
try {
  droneIcon = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + '/drone-icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
} catch (error) {
  console.warn('Failed to load custom drone icon, using default', error);
  droneIcon = new L.Icon.Default();
}

const ActiveMissionsMap = ({ drones }) => {
  const mapRef = useRef(null);

  // Filter out drones with invalid coordinates to prevent errors
  const dronesWithValidCoordinates = drones.filter(
    drone => drone && 
    drone.location_lat !== null && 
    drone.location_lng !== null &&
    !isNaN(parseFloat(drone.location_lat)) &&
    !isNaN(parseFloat(drone.location_lng))
  );

  useEffect(() => {
    if (mapRef.current && dronesWithValidCoordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(
          dronesWithValidCoordinates.map(drone => [
            parseFloat(drone.location_lat), 
            parseFloat(drone.location_lng)
          ])
        );
        
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds);
        } else {
          // Default to a view of the whole world if bounds are invalid
          mapRef.current.setView([0, 0], 2);
        }
      } catch (error) {
        console.error('Error setting map bounds:', error);
        // Set to default view on error
        if (mapRef.current) {
          mapRef.current.setView([0, 0], 2);
        }
      }
    }
  }, [dronesWithValidCoordinates]);

  return (
    <MapContainer
      ref={mapRef}
      center={[0, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%', minHeight: '300px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {dronesWithValidCoordinates.map((drone) => (
        <Marker
          key={drone.id}
          position={[parseFloat(drone.location_lat), parseFloat(drone.location_lng)]}
          icon={droneIcon}
        >
          <Popup>
            <div>
              <h3>{drone.name}</h3>
              <p>Status: {getStatusLabel(drone.status)}</p>
              <p>Battery: {drone.battery_level}%</p>
              <p>Altitude: {drone.altitude ? `${drone.altitude}m` : 'N/A'}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {dronesWithValidCoordinates.length === 0 && drones.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          zIndex: 1000, 
          bottom: 10, 
          left: 10, 
          backgroundColor: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          boxShadow: '0 1px 5px rgba(0,0,0,0.4)'
        }}>
          Drone coordinates unavailable
        </div>
      )}
    </MapContainer>
  );
};

export default ActiveMissionsMap; 