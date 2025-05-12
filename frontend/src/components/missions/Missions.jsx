import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMissions, updateMission, deleteMission } from '../../services/missionService';

const Missions = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await getMissions();
      setMissions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch missions');
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewMission = () => {
    navigate('/missions/new');
  };

  const handleEditMission = (id) => {
    navigate(`/missions/${id}/edit`);
  };

  const handleDeleteMission = async (id) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        await deleteMission(id);
        fetchMissions(); // Refresh the list
      } catch (err) {
        console.error('Error deleting mission:', err);
      }
    }
  };

  const handleStartMission = async (id) => {
    try {
      await updateMission(id, { status: 'in_progress' });
      fetchMissions();
    } catch (err) {
      console.error('Error starting mission:', err);
    }
  };

  const handleStopMission = async (id) => {
    try {
      await updateMission(id, { status: 'completed' });
      fetchMissions();
    } catch (err) {
      console.error('Error stopping mission:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Missions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateNewMission}
          >
            Create New Mission
          </Button>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Loading missions...</Typography>
            </Box>
          ) : missions.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No missions created yet. Click "Create New Mission" to get started.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Pattern</TableCell>
                  <TableCell>Altitude</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {missions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell>{mission.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={mission.status}
                        color={getStatusColor(mission.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(mission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{mission.survey_pattern}</TableCell>
                    <TableCell>{mission.flight_altitude}m</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditMission(mission.id)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      {mission.status === 'planned' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleStartMission(mission.id)}
                          title="Start"
                        >
                          <StartIcon />
                        </IconButton>
                      )}
                      {mission.status === 'in_progress' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleStopMission(mission.id)}
                          title="Stop"
                        >
                          <StopIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteMission(mission.id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Missions; 