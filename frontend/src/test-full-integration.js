import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

async function testFullIntegration() {
  try {
    console.log('Testing full frontend-backend integration...');
    console.log('API URL:', API_BASE_URL);
    
    // 1. Test API connection
    console.log('\n=== Testing API Connection ===');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check:', healthResponse.data);
    
    // 2. Test data flow - Create a new drone and verify it's retrievable
    console.log('\n=== Testing Data Flow ===');
    
    // Create a new drone
    const newDrone = {
      name: "Integration Test Drone",
      model: "Frontend-Backend Integration Model",
      status: "idle",
      battery_level: 100,
      location_lat: 37.7833,
      location_lng: -122.4167,
      altitude: 15
    };
    
    console.log('Creating a new drone:', newDrone);
    const createResponse = await axios.post(`${API_BASE_URL}/drones`, newDrone);
    const createdDrone = createResponse.data;
    console.log('Drone created successfully:', createdDrone);
    
    // Retrieve the created drone
    const droneId = createdDrone.id;
    console.log(`Retrieving drone with ID ${droneId}...`);
    const getResponse = await axios.get(`${API_BASE_URL}/drones/${droneId}`);
    const retrievedDrone = getResponse.data;
    console.log('Retrieved drone:', retrievedDrone);
    
    // Verify the retrieved drone matches the created drone
    if (retrievedDrone.name === newDrone.name && 
        retrievedDrone.model === newDrone.model && 
        retrievedDrone.status === newDrone.status) {
      console.log('✅ Data flow test passed! Created and retrieved drone data matches.');
    } else {
      console.log('❌ Data flow test failed! Created and retrieved drone data does not match.');
      console.log('Expected:', newDrone);
      console.log('Actual:', retrievedDrone);
    }
    
    // 3. Test mission creation with the new drone
    console.log('\n=== Testing Mission Creation ===');
    
    // Get a location to use
    const locationsResponse = await axios.get(`${API_BASE_URL}/locations`);
    if (locationsResponse.data.length > 0) {
      const testLocation = locationsResponse.data[0];
      
      // Create a new mission
      const newMission = {
        name: "Integration Test Mission",
        description: "Testing frontend-backend integration",
        drone_id: droneId,
        location_id: testLocation.id,
        status: "planned",
        flight_altitude: 50,
        flight_speed: 12.5,
        overlap_percentage: 70,
        data_collection_frequency: 3,
        survey_pattern: "grid",
        sensor_type: "rgb",
        survey_area: {
          type: "Polygon",
          coordinates: [[
            [testLocation.longitude - 0.001, testLocation.latitude - 0.001],
            [testLocation.longitude + 0.001, testLocation.latitude - 0.001],
            [testLocation.longitude + 0.001, testLocation.latitude + 0.001],
            [testLocation.longitude - 0.001, testLocation.latitude + 0.001],
            [testLocation.longitude - 0.001, testLocation.latitude - 0.001]
          ]]
        }
      };
      
      console.log('Creating a new mission:', newMission);
      const createMissionResponse = await axios.post(`${API_BASE_URL}/missions`, newMission);
      const createdMission = createMissionResponse.data;
      console.log('Mission created successfully:', createdMission);
      
      // Retrieve the created mission
      const missionId = createdMission.id;
      console.log(`Retrieving mission with ID ${missionId}...`);
      const getMissionResponse = await axios.get(`${API_BASE_URL}/missions/${missionId}`);
      const retrievedMission = getMissionResponse.data;
      console.log('Retrieved mission:', retrievedMission);
      
      // Verify the retrieved mission matches the created mission
      if (retrievedMission.name === newMission.name && 
          retrievedMission.description === newMission.description && 
          retrievedMission.drone_id === newMission.drone_id) {
        console.log('✅ Mission creation test passed! Created and retrieved mission data matches.');
      } else {
        console.log('❌ Mission creation test failed! Created and retrieved mission data does not match.');
        console.log('Expected:', newMission);
        console.log('Actual:', retrievedMission);
      }
      
      // 4. Add waypoints to the mission
      console.log('\n=== Testing Waypoint Creation ===');
      
      const waypoints = [
        {
          mission_id: missionId,
          sequence_number: 1,
          latitude: testLocation.latitude - 0.0005,
          longitude: testLocation.longitude - 0.0005,
          altitude: 50,
          action: 'takeoff'
        },
        {
          mission_id: missionId,
          sequence_number: 2,
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          altitude: 50,
          action: 'capture'
        },
        {
          mission_id: missionId,
          sequence_number: 3,
          latitude: testLocation.latitude + 0.0005,
          longitude: testLocation.longitude + 0.0005,
          altitude: 50,
          action: 'capture'
        },
        {
          mission_id: missionId,
          sequence_number: 4,
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          altitude: 10,
          action: 'land'
        }
      ];
      
      console.log('Adding waypoints to mission...');
      for (const waypoint of waypoints) {
        const createWaypointResponse = await axios.post(`${API_BASE_URL}/waypoints`, waypoint);
        console.log(`Waypoint ${waypoint.sequence_number} created:`, createWaypointResponse.data);
      }
      
      // Retrieve the waypoints
      console.log(`Retrieving waypoints for mission with ID ${missionId}...`);
      const getWaypointsResponse = await axios.get(`${API_BASE_URL}/missions/${missionId}/waypoints`);
      const retrievedWaypoints = getWaypointsResponse.data;
      console.log('Retrieved waypoints count:', retrievedWaypoints.length);
      
      if (retrievedWaypoints.length === waypoints.length) {
        console.log('✅ Waypoint creation test passed! Created and retrieved waypoints count matches.');
      } else {
        console.log('❌ Waypoint creation test failed! Created and retrieved waypoints count does not match.');
        console.log('Expected count:', waypoints.length);
        console.log('Actual count:', retrievedWaypoints.length);
      }
    }
    
    console.log('\n✅ Full integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

export default testFullIntegration;

// Execute the test if this file is run directly
if (require.main === module) {
  testFullIntegration();
} 