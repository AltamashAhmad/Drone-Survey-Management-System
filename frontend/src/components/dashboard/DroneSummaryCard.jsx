import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const DroneSummaryCard = ({ title, value, icon, color }) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          top: -20,
          opacity: 0.2,
          transform: 'scale(2)'
        }}
      >
        {icon}
      </Box>
      
      <Typography variant="h6" component="div" gutterBottom>
        {title}
      </Typography>
      
      <Typography
        variant="h3"
        component="div"
        sx={{
          mt: 'auto',
          color: color,
          fontWeight: 'bold'
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export default DroneSummaryCard; 