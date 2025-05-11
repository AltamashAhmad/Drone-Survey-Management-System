const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Import routes
const missionsRouter = require('./routes/missions');
const droneController = require('./controllers/droneController');
const locationsRouter = require('./routes/locations');
const reportsRouter = require('./routes/reports');

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/database');
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'healthy', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// API Routes
app.use('/api/missions', missionsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/reports', reportsRouter);
app.get('/api/drones', droneController.getAllDrones);
app.get('/api/drones/:id', droneController.getDrone);
app.post('/api/drones', droneController.createDrone);
app.put('/api/drones/:id', droneController.updateDrone);
app.delete('/api/drones/:id', droneController.deleteDrone);
app.get('/api/drones/:id/mission', droneController.getDroneMission);

// Socket.io event handlers
io.on('connection', (socket) => {
  // Handle real-time drone updates
  socket.on('drone:update', async (data) => {
    try {
      const db = require('./config/database');
      await db.query(
        `UPDATE drones 
         SET location_lat = $1,
             location_lng = $2,
             altitude = $3,
             battery_level = $4,
             status = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [data.location_lat, data.location_lng, data.altitude, data.battery_level, data.status, data.id]
      );
      
      // Broadcast update to all connected clients
      io.emit('drone:updated', data);
    } catch (err) {
      console.error('Error updating drone:', err);
    }
  });
  
  socket.on('disconnect', () => {
    // Remove console.log for client disconnected
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
