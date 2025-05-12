import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import FleetManagement from './components/fleet/FleetManagement';
import Missions from './components/missions/Missions';
import MissionPlanner from './components/missions/MissionPlanner';
import MissionMonitor from './components/missions/MissionMonitor';
import Reports from './components/reports';
import LocationManager from './components/locations/LocationManager';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Disable React Router future flag warnings
const routerOptions = {
  future: {
    v7_startTransition: false,
    v7_relativeSplatPath: false
  }
};

function App() {
  return (
    <BrowserRouter future={routerOptions.future}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fleet" element={<FleetManagement />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/missions/new" element={<MissionPlanner />} />
              <Route path="/missions/:id/edit" element={<MissionPlanner />} />
              <Route path="/missions/:id" element={<MissionMonitor />} />
              <Route path="/locations" element={<LocationManager />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
          </Box>
        </Box>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
