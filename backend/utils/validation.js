// Drone validation
const validateDrone = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate) {
    // Required fields for new drone
    if (!data.name || !data.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!data.model || !data.model.trim()) {
      errors.model = 'Model is required';
    }
  }

  // Optional fields validation
  if (data.status && !['idle', 'in_mission', 'maintenance', 'offline'].includes(data.status)) {
    errors.status = 'Invalid status value';
  }

  if (data.battery_level !== undefined && data.battery_level !== null && data.battery_level !== '') {
    const battery = parseInt(data.battery_level);
    if (isNaN(battery) || battery < 0 || battery > 100) {
      errors.battery_level = 'Battery level must be between 0 and 100';
    }
  }

  // Only validate coordinates if they are provided and not empty strings
  if (data.location_lat !== undefined && data.location_lat !== null && data.location_lat !== '') {
    const lat = parseFloat(data.location_lat);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.location_lat = 'Latitude must be between -90 and 90';
    }
  }

  if (data.location_lng !== undefined && data.location_lng !== null && data.location_lng !== '') {
    const lng = parseFloat(data.location_lng);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.location_lng = 'Longitude must be between -180 and 180';
    }
  }

  if (data.altitude !== undefined && data.altitude !== null && data.altitude !== '') {
    const alt = parseFloat(data.altitude);
    if (isNaN(alt)) {
      errors.altitude = 'Invalid altitude value';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Mission validation
const validateMission = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate) {
    // Required fields for new mission
    if (!data.name) {
      errors.name = 'Name is required';
    }
    if (!data.flight_altitude) {
      errors.flight_altitude = 'Flight altitude is required';
    }
    if (!data.data_collection_frequency) {
      errors.data_collection_frequency = 'Data collection frequency is required';
    }
  }

  // Optional fields validation
  if (data.flight_altitude !== undefined) {
    const altitude = parseFloat(data.flight_altitude);
    if (isNaN(altitude) || altitude <= 0) {
      errors.flight_altitude = 'Invalid flight altitude value';
    }
  }

  if (data.data_collection_frequency !== undefined) {
    const frequency = parseInt(data.data_collection_frequency);
    if (isNaN(frequency) || frequency <= 0) {
      errors.data_collection_frequency = 'Invalid data collection frequency';
    }
  }

  if (data.status && !['planned', 'in-progress', 'paused', 'completed', 'aborted'].includes(data.status)) {
    errors.status = 'Invalid status value';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Waypoint validation
const validateWaypoint = (data) => {
  const errors = {};

  if (!data.latitude) {
    errors.latitude = 'Latitude is required';
  } else {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Invalid latitude value';
    }
  }

  if (!data.longitude) {
    errors.longitude = 'Longitude is required';
  } else {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Invalid longitude value';
    }
  }

  if (!data.altitude) {
    errors.altitude = 'Altitude is required';
  } else {
    const alt = parseFloat(data.altitude);
    if (isNaN(alt) || alt < 0) {
      errors.altitude = 'Invalid altitude value';
    }
  }

  // Only validate sequence_number if it's provided
  if (data.sequence_number !== undefined && data.sequence_number !== null) {
    const seq = parseInt(data.sequence_number);
    if (isNaN(seq) || seq < 0) {
      errors.sequence_number = 'Invalid sequence number';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Location validation
const validateLocation = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate) {
    if (!data.name || !data.name.trim()) {
      errors.name = 'Name is required';
    }
  }

  if (data.latitude !== undefined && data.latitude !== null && data.latitude !== '') {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
  }

  if (data.longitude !== undefined && data.longitude !== null && data.longitude !== '') {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
  }

  if (data.type && !['survey_site', 'construction', 'environmental', 'industrial'].includes(data.type)) {
    errors.type = 'Invalid location type';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Report validation
const validateReport = (data) => {
  const errors = {};

  if (!data.mission_id) {
    errors.mission_id = 'Mission ID is required';
  }

  if (data.flight_duration !== undefined) {
    const duration = parseInt(data.flight_duration);
    if (isNaN(duration) || duration < 0) {
      errors.flight_duration = 'Invalid flight duration';
    }
  }

  if (data.distance_flown !== undefined) {
    const distance = parseFloat(data.distance_flown);
    if (isNaN(distance) || distance < 0) {
      errors.distance_flown = 'Invalid distance value';
    }
  }

  if (data.area_covered !== undefined) {
    const area = parseFloat(data.area_covered);
    if (isNaN(area) || area < 0) {
      errors.area_covered = 'Invalid area value';
    }
  }

  if (data.battery_consumed !== undefined) {
    const battery = parseInt(data.battery_consumed);
    if (isNaN(battery) || battery < 0 || battery > 100) {
      errors.battery_consumed = 'Battery consumption must be between 0 and 100';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
  validateDrone,
  validateMission,
  validateWaypoint,
  validateLocation,
  validateReport
}; 