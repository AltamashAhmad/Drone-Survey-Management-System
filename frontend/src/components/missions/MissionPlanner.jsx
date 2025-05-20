import React, { useState, useCallback, useEffect } from 'react';
import { Box, Paper, Typography, Stepper, Step, StepLabel, Button } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AreaSelector from './planning/AreaSelector';
import FlightPathConfig from './planning/FlightPathConfig';
import WaypointManager from './planning/WaypointManager';
import MissionParameters from './planning/MissionParameters';
import MissionSubmitDialog from './planning/MissionSubmitDialog';
import { getMission } from '../../services/missionService';

const steps = [
  'Select Survey Area',
  'Configure Flight Path',
  'Set Waypoints',
  'Mission Parameters'
];

const MissionPlanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;
  
  // Get drone ID from URL query parameter if it exists
  const queryParams = new URLSearchParams(location.search);
  const preselectedDroneId = queryParams.get('drone');
  
  const [activeStep, setActiveStep] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [missionData, setMissionData] = useState({
    id: null,
    name: '',
    description: '',
    surveyArea: null,
    flightPattern: 'grid', // 'grid', 'crosshatch', 'perimeter'
    waypoints: [],
    droneId: preselectedDroneId || null, // Include the preselected drone ID
    parameters: {
      altitude: 100,
      speed: 15,
      overlap: 60,
      sensorType: 'rgb',
      collectionFrequency: 5
    }
  });

  useEffect(() => {
    // Fetch mission data if in edit mode
    if (isEditing) {
      const fetchMission = async () => {
        try {
          setLoading(true);
          const mission = await getMission(id);
          
          // Format waypoints from database format
          let formattedWaypoints = [];
          if (mission.waypoints && mission.waypoints.length > 0) {
            // Keep waypoints in object format with latitude/longitude properties
            // This will work with our updated components
            formattedWaypoints = mission.waypoints.map(wp => ({
              latitude: parseFloat(wp.latitude),
              longitude: parseFloat(wp.longitude),
              altitude: parseFloat(wp.altitude || mission.flight_altitude)
            }));
          }
          
          // Parse survey_area if it exists in the database as a string
          let parsedSurveyArea = null;
          if (mission.survey_area) {
            try {
              // If it's already an object, use it directly, otherwise parse it
              parsedSurveyArea = typeof mission.survey_area === 'string' ? 
                JSON.parse(mission.survey_area) : mission.survey_area;
            } catch (parseError) {
              console.error("Error parsing survey area:", parseError);
            }
          }
          
          setMissionData({
            id: mission.id,
            name: mission.name || '',
            description: mission.description || '',
            surveyArea: parsedSurveyArea,
            flightPattern: mission.survey_pattern || 'grid',
            waypoints: formattedWaypoints,
            droneId: mission.drone_id || null,
            parameters: {
              altitude: mission.flight_altitude || 100,
              speed: mission.flight_speed || 15,
              overlap: mission.overlap_percentage || 60,
              sensorType: mission.sensor_type || 'rgb',
              collectionFrequency: mission.data_collection_frequency || 5
            }
          });
          setSubmitDialogOpen(true); // Open dialog immediately for edit
        } catch (error) {
          console.error('Failed to fetch mission:', error);
          // Handle error - maybe show a notification to user
        } finally {
          setLoading(false);
        }
      };
      
      fetchMission();
    }
  }, [id, isEditing]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAreaSelection = (area) => {
    setMissionData(prev => ({ ...prev, surveyArea: area }));
  };

  const handlePatternChange = (pattern) => {
    setMissionData(prev => ({ ...prev, flightPattern: pattern }));
  };

  const handleWaypointsUpdate = useCallback((waypoints) => {
    setMissionData(prev => ({ ...prev, waypoints }));
  }, []);

  const handleParametersUpdate = (parameters) => {
    setMissionData(prev => ({ ...prev, parameters: { ...prev.parameters, ...parameters } }));
  };

  const handleCreateMission = () => {
    setSubmitDialogOpen(true);
  };

  const handleMissionSuccess = () => {
    setSubmitDialogOpen(false);
    navigate('/missions');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <AreaSelector
            onAreaSelected={handleAreaSelection}
            selectedArea={missionData.surveyArea}
          />
        );
      case 1:
        return (
          <FlightPathConfig
            surveyArea={missionData.surveyArea}
            pattern={missionData.flightPattern}
            onPatternChange={handlePatternChange}
            onWaypointsUpdate={handleWaypointsUpdate}
          />
        );
      case 2:
        return (
          <WaypointManager
            surveyArea={missionData.surveyArea}
            pattern={missionData.flightPattern}
            waypoints={missionData.waypoints}
            onWaypointsUpdate={handleWaypointsUpdate}
          />
        );
      case 3:
        return (
          <MissionParameters
            parameters={missionData.parameters}
            onParametersUpdate={handleParametersUpdate}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading mission data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Mission' : 'New Mission'}
      </Typography>
      {!isEditing && (
        <>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Paper sx={{ p: 2, minHeight: '600px' }}>
            {renderStepContent(activeStep)}
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleCreateMission : handleNext}
              disabled={activeStep === 0 && !missionData.surveyArea}
            >
              {activeStep === steps.length - 1 ? 'Create Mission' : 'Next'}
            </Button>
          </Box>
        </>
      )}
      <MissionSubmitDialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        missionData={missionData}
        isEditing={isEditing}
        onSuccess={handleMissionSuccess}
        preselectedDroneId={preselectedDroneId}
      />
    </Box>
  );
};

export default MissionPlanner; 