import * as turf from '@turf/turf';

const generateGridPath = (bbox, spacing) => {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const lines = [];
  let isEastward = true;
  
  for (let lat = minLat; lat <= maxLat; lat += spacing) {
    const line = isEastward
      ? [[minLng, lat], [maxLng, lat]]
      : [[maxLng, lat], [minLng, lat]];
    lines.push(line);
    isEastward = !isEastward;
  }
  
  return lines;
};

const generateCrosshatchPath = (bbox, spacing) => {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const lines = [];
  
  // Horizontal lines
  for (let lat = minLat; lat <= maxLat; lat += spacing) {
    lines.push([[minLng, lat], [maxLng, lat]]);
  }
  
  // Vertical lines
  for (let lng = minLng; lng <= maxLng; lng += spacing) {
    lines.push([[lng, minLat], [lng, maxLat]]);
  }
  
  return lines;
};

const generatePerimeterPath = (coordinates) => {
  // For perimeter, we just return the boundary coordinates
  return [coordinates[0]];
};

export const calculateFlightPath = (surveyArea, pattern) => {
  if (!surveyArea || !surveyArea.geometry) return [];

  const bbox = turf.bbox(surveyArea);
  const area = turf.area(surveyArea);
  const spacing = Math.sqrt(area) / 1000; // Dynamic spacing based on area size

  switch (pattern) {
    case 'grid':
      return generateGridPath(bbox, spacing * 0.0001);
    case 'crosshatch':
      return generateCrosshatchPath(bbox, spacing * 0.0001);
    case 'perimeter':
      return generatePerimeterPath(surveyArea.geometry.coordinates);
    default:
      return [];
  }
};

export const generateWaypoints = (flightPath) => {
  if (!flightPath || flightPath.length === 0) return [];
  
  const waypoints = [];
  flightPath.forEach(path => {
    path.forEach(point => {
      // Create properly formatted waypoint objects with latitude and longitude properties
      // Note: GeoJSON uses [longitude, latitude] order, but our database needs latitude, longitude
      waypoints.push({
        longitude: point[0],
        latitude: point[1],
        altitude: null // Altitude will be set from the mission flight_altitude
      });
    });
  });
  
  return waypoints;
}; 