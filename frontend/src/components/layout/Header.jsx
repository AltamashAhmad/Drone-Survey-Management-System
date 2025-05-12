import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Drone Survey Management
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/fleet')}>
            Fleet
          </Button>
          <Button color="inherit" onClick={() => navigate('/missions')}>
            Missions
          </Button>
          <Button color="inherit" onClick={() => navigate('/reports')}>
            Reports
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 