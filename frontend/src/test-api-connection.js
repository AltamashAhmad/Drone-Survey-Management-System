import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

async function testApiConnection() {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check:', healthResponse.data);
    
    // Test drones endpoint
    const dronesResponse = await axios.get(`${API_BASE_URL}/drones`);
    console.log('Drones count:', dronesResponse.data.length);
    
    // Test missions endpoint
    const missionsResponse = await axios.get(`${API_BASE_URL}/missions`);
    console.log('Missions count:', missionsResponse.data.length);
    
    // Test locations endpoint
    const locationsResponse = await axios.get(`${API_BASE_URL}/locations`);
    console.log('Locations count:', locationsResponse.data.length);
    
    console.log('All API tests passed!');
  } catch (error) {
    console.error('API connection test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testApiConnection(); 