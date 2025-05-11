const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_BASE_URL = `http://localhost:${process.env.PORT || 5001}/api`;

async function testAllEndpoints() {
  try {
    console.log('Testing all API endpoints...');
    console.log('API URL:', API_BASE_URL);
    
    // Test health endpoint
    console.log('\n=== Testing Health Endpoint ===');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check:', healthResponse.data);
    
    // Test drones endpoints
    console.log('\n=== Testing Drones Endpoints ===');
    
    // Get all drones
    const dronesResponse = await axios.get(`${API_BASE_URL}/drones`);
    console.log('Drones count:', dronesResponse.data.length);
    
    if (dronesResponse.data.length > 0) {
      const testDroneId = dronesResponse.data[0].id;
      
      // Get single drone
      console.log(`\nGetting drone with ID ${testDroneId}...`);
      const droneResponse = await axios.get(`${API_BASE_URL}/drones/${testDroneId}`);
      console.log('Drone details:', droneResponse.data);
      
      // Create a new drone
      console.log('\nCreating a new test drone...');
      const newDrone = {
        name: "Test Drone API",
        model: "API Test Model",
        status: "idle",
        battery_level: 95,
        location_lat: 37.7833,
        location_lng: -122.4167,
        altitude: 10
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/drones`, newDrone);
      console.log('Created drone:', createResponse.data);
      const createdDroneId = createResponse.data.id;
      
      // Update the drone
      console.log(`\nUpdating drone with ID ${createdDroneId}...`);
      const updateData = {
        status: "maintenance",
        battery_level: 85
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/drones/${createdDroneId}`, updateData);
      console.log('Updated drone:', updateResponse.data);
      
      // Delete the test drone
      console.log(`\nDeleting drone with ID ${createdDroneId}...`);
      const deleteResponse = await axios.delete(`${API_BASE_URL}/drones/${createdDroneId}`);
      console.log('Delete response:', deleteResponse.data);
    }
    
    // Test locations endpoints
    console.log('\n=== Testing Locations Endpoints ===');
    
    // Get all locations
    const locationsResponse = await axios.get(`${API_BASE_URL}/locations`);
    console.log('Locations count:', locationsResponse.data.length);
    
    if (locationsResponse.data.length > 0) {
      const testLocationId = locationsResponse.data[0].id;
      
      // Get single location
      console.log(`\nGetting location with ID ${testLocationId}...`);
      const locationResponse = await axios.get(`${API_BASE_URL}/locations/${testLocationId}`);
      console.log('Location details:', locationResponse.data);
      
      // Create a new location
      console.log('\nCreating a new test location...');
      const newLocation = {
        name: "Test Location API",
        description: "Created via API test",
        type: "survey_site",
        latitude: 37.7749,
        longitude: -122.4194,
        address: "123 Test St, San Francisco, CA"
      };
      
      const createLocationResponse = await axios.post(`${API_BASE_URL}/locations`, newLocation);
      console.log('Created location:', createLocationResponse.data);
      const createdLocationId = createLocationResponse.data.id;
      
      // Update the location
      console.log(`\nUpdating location with ID ${createdLocationId}...`);
      const updateLocationData = {
        name: "Updated Test Location",
        description: "Updated via API test",
        latitude: 37.7749,
        longitude: -122.4194,
        notes: "This is a test note"
      };
      
      const updateLocationResponse = await axios.put(`${API_BASE_URL}/locations/${createdLocationId}`, updateLocationData);
      console.log('Updated location:', updateLocationResponse.data);
    }
    
    // Test missions endpoints
    console.log('\n=== Testing Missions Endpoints ===');
    
    // Get all missions
    const missionsResponse = await axios.get(`${API_BASE_URL}/missions`);
    console.log('Missions count:', missionsResponse.data.length);
    
    if (missionsResponse.data.length > 0) {
      const testMissionId = missionsResponse.data[0].id;
      
      // Get single mission
      console.log(`\nGetting mission with ID ${testMissionId}...`);
      const missionResponse = await axios.get(`${API_BASE_URL}/missions/${testMissionId}`);
      console.log('Mission details:', missionResponse.data);
      
      // Get mission waypoints - using the correct endpoint
      console.log(`\nGetting waypoints for mission with ID ${testMissionId}...`);
      try {
        const waypointsResponse = await axios.get(`${API_BASE_URL}/waypoints/mission/${testMissionId}`);
        console.log('Waypoints count:', waypointsResponse.data.length);
      } catch (error) {
        console.log('No waypoints endpoint available or no waypoints found.');
      }
    }
    
    // Test reports endpoints
    console.log('\n=== Testing Reports Endpoints ===');
    
    // Get all reports
    try {
      const reportsResponse = await axios.get(`${API_BASE_URL}/reports`);
      console.log('Reports count:', reportsResponse.data.length);
      
      if (reportsResponse.data.length > 0) {
        const testReportId = reportsResponse.data[0].id;
        
        // Get single report
        console.log(`\nGetting report with ID ${testReportId}...`);
        const reportResponse = await axios.get(`${API_BASE_URL}/reports/${testReportId}`);
        console.log('Report details:', reportResponse.data);
      }
      
      // Get organization statistics
      console.log('\nGetting organization statistics...');
      const statsResponse = await axios.get(`${API_BASE_URL}/reports/statistics`);
      console.log('Organization statistics:', statsResponse.data);
      
      // Create a new test report if we have missions
      if (missionsResponse.data.length > 0) {
        const testMissionId = missionsResponse.data[0].id;
        const testLocationId = missionsResponse.data[0].location_id;
        
        console.log('\nCreating a new test report...');
        const newReport = {
          mission_id: testMissionId,
          flight_duration: 1800, // 30 minutes in seconds
          distance_flown: 2500.5,
          area_covered: 12000.0,
          waypoints_completed: 12,
          data_collected: 256.7,
          sensor_type: 'rgb',
          battery_consumed: 45,
          image_count: 120,
          location_id: testLocationId,
          report_data: {
            quality: 'high',
            coverage: 'complete',
            anomalies: ['vegetation_stress', 'erosion']
          }
        };
        
        const createReportResponse = await axios.post(`${API_BASE_URL}/reports`, newReport);
        console.log('Created report:', createReportResponse.data);
      }
    } catch (error) {
      console.error('Error testing reports endpoints:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
    
    console.log('\n✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAllEndpoints(); 