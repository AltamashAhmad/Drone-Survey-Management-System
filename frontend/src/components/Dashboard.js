import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { FlightTakeoff, ViewList, Assessment, Map } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, icon, description, link }) => {
  return (
    <Grid item xs={12} md={6} lg={3}>
      <Paper
        component={Link}
        to={link}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: 200,
          textDecoration: 'none',
          color: 'inherit',
          '&:hover': {
            boxShadow: 6,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {description}
        </Typography>
      </Paper>
    </Grid>
  );
};

const Dashboard = () => {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <DashboardCard
          title="Mission Planning"
          icon={<Map sx={{ fontSize: 60 }} />}
          description="Plan and configure drone survey missions"
          link="/mission-planner"
        />
        <DashboardCard
          title="Fleet Management"
          icon={<ViewList sx={{ fontSize: 60 }} />}
          description="Manage and monitor your drone fleet"
          link="/fleet"
        />
        <DashboardCard
          title="Mission Monitoring"
          icon={<FlightTakeoff sx={{ fontSize: 60 }} />}
          description="Track ongoing missions in real-time"
          link="/monitoring"
        />
        <DashboardCard
          title="Reports"
          icon={<Assessment sx={{ fontSize: 60 }} />}
          description="View survey reports and analytics"
          link="/reports"
        />
      </Grid>
    </div>
  );
};

export default Dashboard;
