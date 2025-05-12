import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Chip,
  Tabs,
  Tab,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getMissions } from '../../services/missionService';
import { getDrones } from '../../services/droneService';
import { getReports, getOrgStatistics } from '../../services/reportService';

const Reports = () => {
  const [missions, setMissions] = useState([]);
  const [drones, setDrones] = useState([]);
  const [reports, setReports] = useState([]);
  const [orgStats, setOrgStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('last30');

  const fetchData = useCallback(async (range = dateRange) => {
    try {
      setLoading(true);
      const missionsData = await getMissions();
      const dronesData = await getDrones();
      const reportsData = await getReports();
      const statsData = await getOrgStatistics();
      
      // Store the raw data for filtering
      const filteredMissions = filterMissionsByDateRange(missionsData, range);
      
      setMissions(filteredMissions);
      setDrones(dronesData);
      setReports(reportsData);
      setOrgStats(statsData);
    } catch (err) {
      console.error('Error fetching data for reports:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
    // Refetch data with the new date range
    fetchData(event.target.value);
  };

  // Filter missions based on date range
  const filterMissionsByDateRange = (missions, range) => {
    const now = new Date();
    let startDate;
    
    switch (range) {
      case 'last7':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'last90':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of this year
        break;
      case 'all':
      default:
        return missions; // Return all missions for "all" or any unrecognized range
    }
    
    return missions.filter(mission => {
      if (!mission.created_at) return false;
      const missionDate = new Date(mission.created_at);
      return missionDate >= startDate;
    });
  };

  // Calculate statistics - use orgStats from API when available
  const stats = {
    totalMissions: missions.length,
    completedMissions: missions.filter(m => m.status === 'completed').length,
    inProgressMissions: missions.filter(m => m.status === 'in_progress').length,
    abortedMissions: missions.filter(m => m.status === 'aborted').length,
    plannedMissions: missions.filter(m => m.status === 'planned').length,
    totalDrones: drones.length,
    activeDrones: drones.filter(d => d.status === 'in_mission').length,
    availableDrones: drones.filter(d => d.status === 'idle').length,
    totalFlightTime: orgStats.total_flight_time || missions.reduce((acc, mission) => {
      // If start_time and end_time exist, calculate duration
      if (mission.start_time && mission.end_time) {
        const start = new Date(mission.start_time);
        const end = new Date(mission.end_time);
        const durationInHours = (end - start) / (1000 * 60 * 60);
        return acc + durationInHours;
      }
      return acc;
    }, 0).toFixed(1),
    averageAltitude: missions.length ? 
      (missions.reduce((acc, m) => acc + Number(m.flight_altitude || 0), 0) / missions.length).toFixed(0) 
      : 0,
    totalSurveys: orgStats.total_surveys || reports.length,
    totalDistance: orgStats.total_distance || 0,
    totalAreaCovered: orgStats.total_area_covered || 0,
    totalImages: orgStats.total_images || 0,
    avgBatteryConsumption: orgStats.avg_battery_consumption || 0
  };

  // Generate chart data
  const missionStatusChartData = [
    { name: 'Completed', value: stats.completedMissions, color: '#4caf50' },
    { name: 'In Progress', value: stats.inProgressMissions, color: '#2196f3' },
    { name: 'Planned', value: stats.plannedMissions, color: '#9e9e9e' },
    { name: 'Aborted', value: stats.abortedMissions, color: '#f44336' }
  ];

  const droneStatusChartData = [
    { name: 'Active', value: stats.activeDrones, color: '#2196f3' },
    { name: 'Available', value: stats.availableDrones, color: '#4caf50' },
    { name: 'Maintenance', value: drones.filter(d => d.status === 'maintenance').length, color: '#ff9800' },
    { name: 'Offline', value: drones.filter(d => d.status === 'offline').length, color: '#f44336' }
  ];

  // Generate monthly mission counts from real data
  const getMonthlyMissionData = () => {
    // Create an array of the last 6 months
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: monthNames[month.getMonth()],
        month: month.getMonth(),
        year: month.getFullYear(),
        date: month
      });
    }
    
    // Initialize the data structure for each month with zeros
    const monthlyData = months.map(month => ({
      name: month.name,
      month: month.month,
      year: month.year,
      completed: 0,
      aborted: 0,
      planned: 0,
      in_progress: 0
    }));
    
    // Count missions by month and status
    missions.forEach(mission => {
      if (!mission.created_at) return;
      
      const missionDate = new Date(mission.created_at);
      const monthIndex = monthlyData.findIndex(m => 
        m.month === missionDate.getMonth() && m.year === missionDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        // Normalize mission status for consistency
        const status = mission.status === 'in-progress' ? 'in_progress' : mission.status;
        
        // Increment the appropriate counter based on status
        if (status === 'completed') {
          monthlyData[monthIndex].completed += 1;
        } else if (status === 'aborted') {
          monthlyData[monthIndex].aborted += 1;
        } else if (status === 'planned' || status === 'ready') {
          monthlyData[monthIndex].planned += 1;
        } else if (status === 'in_progress') {
          monthlyData[monthIndex].in_progress += 1;
        }
      }
    });
    
    // For visualization purposes, merge in_progress with planned
    // (since the chart design shows only 3 statuses)
    return monthlyData.map(month => ({
      name: month.name,
      completed: month.completed,
      aborted: month.aborted,
      planned: month.planned + month.in_progress
    }));
  };

  // Generate recent missions data
  const getRecentMissions = () => {
    return missions
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  const exportReportCSV = () => {
    // In a real app, this would generate a CSV file with mission data
    const headers = ['ID', 'Name', 'Status', 'Altitude', 'Pattern', 'Created At', 'Completed At'];
    const data = missions.map(m => [
      m.id,
      m.name,
      m.status,
      m.flight_altitude,
      m.survey_pattern,
      new Date(m.created_at).toLocaleDateString(),
      m.end_time ? new Date(m.end_time).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mission_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'default';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'aborted': return 'error';
      default: return 'default';
    }
  };

  // Add a function to get recent reports
  const getRecentReports = () => {
    return reports
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <Box>
          <FormControl sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={handleDateRangeChange}
            >
              <MenuItem value="last7">Last 7 Days</MenuItem>
              <MenuItem value="last30">Last 30 Days</MenuItem>
              <MenuItem value="last90">Last 90 Days</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            startIcon={<FileDownloadIcon />}
            onClick={exportReportCSV}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Missions</Typography>
              <Typography variant="h3">{stats.totalMissions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Completed Missions</Typography>
              <Typography variant="h3" color="success.main">{stats.completedMissions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Flight Time</Typography>
              <Typography variant="h3">{stats.totalFlightTime} hrs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Drones</Typography>
              <Typography variant="h3" color="primary.main">{stats.activeDrones}/{stats.totalDrones}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different report sections */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Mission Overview" />
          <Tab label="Drone Performance" />
          <Tab label="Mission History" />
          <Tab label="Survey Reports" />
        </Tabs>
      </Box>

      {/* Tab 1: Mission Overview */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>Mission Status Distribution</Typography>
              <Box sx={{ position: 'relative', height: '85%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Chart container with positioning */}
                <Box sx={{ width: '70%', height: '70%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={missionStatusChartData.filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius="90%"
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {missionStatusChartData.filter(item => item.value > 0).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} missions`, name]}
                        contentStyle={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Separate legend with status boxes */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 2, gap: 2 }}>
                  {missionStatusChartData.map((entry, index) => (
                    <Box 
                      key={`legend-${index}`}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: entry.value > 0 ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                        px: 2,
                        py: 0.5,
                        borderRadius: '16px',
                        boxShadow: entry.value > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          backgroundColor: entry.color,
                          mr: 1
                        }} 
                      />
                      <Typography variant="body2">
                        {entry.name}: {entry.value > 0 ? `${((entry.value / stats.totalMissions) * 100).toFixed(0)}%` : '0%'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>Monthly Mission Trends</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing data for the last 6 months
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 12, height: 12, backgroundColor: '#4caf50', mr: 0.5, borderRadius: 1 }} />
                    <Typography variant="caption">Completed</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 12, height: 12, backgroundColor: '#f44336', mr: 0.5, borderRadius: 1 }} />
                    <Typography variant="caption">Aborted</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 12, height: 12, backgroundColor: '#9e9e9e', mr: 0.5, borderRadius: 1 }} />
                    <Typography variant="caption">Planned/In Progress</Typography>
                  </Box>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart
                  data={getMonthlyMissionData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      border: 'none' 
                    }}
                    formatter={(value, name) => [value, name === 'planned' ? 'Planned/In Progress' : name]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar 
                    dataKey="completed" 
                    stackId="a" 
                    fill="#4caf50" 
                    radius={[0, 0, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="aborted" 
                    stackId="a" 
                    fill="#f44336" 
                    radius={[0, 0, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    dataKey="planned" 
                    stackId="a" 
                    fill="#9e9e9e" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
              {missions.length === 0 && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Typography color="text.secondary">No mission data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Recent Missions</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Pattern</TableCell>
                      <TableCell>Altitude</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getRecentMissions().map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell>{mission.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={mission.status} 
                            color={getStatusColor(mission.status)} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{mission.survey_pattern}</TableCell>
                        <TableCell>{mission.flight_altitude}m</TableCell>
                        <TableCell>{new Date(mission.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Drone Performance */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>Drone Status Distribution</Typography>
              <Box sx={{ position: 'relative', height: '85%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Chart container with positioning */}
                <Box sx={{ width: '70%', height: '70%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={droneStatusChartData.filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius="90%"
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {droneStatusChartData.filter(item => item.value > 0).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} drones`, name]}
                        contentStyle={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Separate legend with status boxes */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 2, gap: 2 }}>
                  {droneStatusChartData.map((entry, index) => (
                    <Box 
                      key={`legend-${index}`}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: entry.value > 0 ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                        px: 2,
                        py: 0.5,
                        borderRadius: '16px',
                        boxShadow: entry.value > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          backgroundColor: entry.color,
                          mr: 1
                        }} 
                      />
                      <Typography variant="body2">
                        {entry.name}: {entry.value > 0 ? `${((entry.value / stats.totalDrones) * 100).toFixed(0)}%` : '0%'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>Battery Performance (Example Data)</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={[
                    { name: 'Flight 1', battery: 100 },
                    { name: 'Flight 2', battery: 85 },
                    { name: 'Flight 3', battery: 70 },
                    { name: 'Flight 4', battery: 55 },
                    { name: 'Flight 5', battery: 40 },
                    { name: 'Flight 6', battery: 25 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="battery" stroke="#8884d8" name="Battery %" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Drone Fleet Status</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Battery</TableCell>
                      <TableCell>Last Mission</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drones.map((drone) => (
                      <TableRow key={drone.id}>
                        <TableCell>{drone.name}</TableCell>
                        <TableCell>{drone.model}</TableCell>
                        <TableCell>
                          <Chip 
                            label={drone.status} 
                            color={
                              drone.status === 'idle' ? 'success' :
                              drone.status === 'in_mission' ? 'primary' :
                              drone.status === 'maintenance' ? 'warning' : 'error'
                            } 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{drone.battery_level}%</TableCell>
                        <TableCell>{new Date(drone.updated_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Mission History */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Mission History</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pattern</TableCell>
                  <TableCell>Altitude</TableCell>
                  <TableCell>Drone</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {missions.map((mission) => {
                  // Find the drone assigned to this mission
                  const drone = drones.find(d => d.id === mission.drone_id);
                  
                  // Calculate duration if available
                  let duration = 'N/A';
                  if (mission.start_time && mission.end_time) {
                    const start = new Date(mission.start_time);
                    const end = new Date(mission.end_time);
                    const durationInMinutes = Math.round((end - start) / (1000 * 60));
                    duration = `${durationInMinutes} min`;
                  }
                  
                  return (
                    <TableRow key={mission.id}>
                      <TableCell>{mission.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={mission.status} 
                          color={getStatusColor(mission.status)} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{mission.survey_pattern}</TableCell>
                      <TableCell>{mission.flight_altitude}m</TableCell>
                      <TableCell>{drone ? drone.name : 'N/A'}</TableCell>
                      <TableCell>{new Date(mission.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{duration}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 4: Survey Reports */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Survey Reports</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mission</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Flight Duration</TableCell>
                      <TableCell>Distance Flown</TableCell>
                      <TableCell>Area Covered</TableCell>
                      <TableCell>Images</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getRecentReports().map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.mission_name || `Mission #${report.mission_id}`}</TableCell>
                        <TableCell>{report.location_name || `Location #${report.location_id}`}</TableCell>
                        <TableCell>{Math.round(report.flight_duration / 60)} min</TableCell>
                        <TableCell>{report.distance_flown}m</TableCell>
                        <TableCell>{report.area_covered}m²</TableCell>
                        <TableCell>{report.image_count}</TableCell>
                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {reports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">No reports available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom>Organization Statistics</Typography>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Total Surveys</Typography>
                    <Typography variant="h6">{stats.totalSurveys}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Total Flight Time</Typography>
                    <Typography variant="h6">{stats.totalFlightTime} hrs</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Total Distance</Typography>
                    <Typography variant="h6">{stats.totalDistance} km</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Area Covered</Typography>
                    <Typography variant="h6">{stats.totalAreaCovered} m²</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Total Images</Typography>
                    <Typography variant="h6">{stats.totalImages}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Avg. Battery Usage</Typography>
                    <Typography variant="h6">{stats.avgBatteryConsumption}%</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reports; 