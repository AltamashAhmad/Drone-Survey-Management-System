import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Drone Survey Management System</h1>
      <p>Welcome to the dashboard</p>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        <Link to="/mission-planner" style={{ textDecoration: 'none', color: 'inherit', flex: '1 0 calc(50% - 20px)' }}>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', height: '100%' }}>
            <h3>Mission Planning</h3>
            <p>Plan and configure drone survey missions</p>
          </div>
        </Link>
        <Link to="/fleet" style={{ textDecoration: 'none', color: 'inherit', flex: '1 0 calc(50% - 20px)' }}>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', height: '100%' }}>
            <h3>Fleet Management</h3>
            <p>Manage and monitor your drone fleet</p>
          </div>
        </Link>
        <Link to="/monitoring" style={{ textDecoration: 'none', color: 'inherit', flex: '1 0 calc(50% - 20px)' }}>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', height: '100%' }}>
            <h3>Mission Monitoring</h3>
            <p>Track ongoing missions in real-time</p>
          </div>
        </Link>
        <Link to="/reports" style={{ textDecoration: 'none', color: 'inherit', flex: '1 0 calc(50% - 20px)' }}>
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', height: '100%' }}>
            <h3>Reports</h3>
            <p>View survey reports and analytics</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
