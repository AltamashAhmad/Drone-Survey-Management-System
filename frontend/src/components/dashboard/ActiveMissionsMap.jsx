import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const dummyDrone = {
  name: 'Dummy Drone 1',
  status: 'in-progress',
  battery_level: 75,
  altitude: 120,
  location_lat: 28.6139,   // Example: New Delhi, India
  location_lng: 77.2090
};

const ActiveMissionsMap = () => (
  <MapContainer
    center={[dummyDrone.location_lat, dummyDrone.location_lng]}
    zoom={5}
    style={{ height: '300px', width: '100%' }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    <Marker position={[dummyDrone.location_lat, dummyDrone.location_lng]}>
      <Popup>
        <div>
          <h3>{dummyDrone.name}</h3>
          <p>Status: {dummyDrone.status}</p>
          <p>Battery: {dummyDrone.battery_level}%</p>
          <p>Altitude: {dummyDrone.altitude}m</p>
        </div>
      </Popup>
    </Marker>
  </MapContainer>
);

export default ActiveMissionsMap; 