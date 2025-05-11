# Drone Survey Management System - User Guide

This guide provides detailed instructions on how to use the Drone Survey Management System for planning, executing, and analyzing drone surveys across multiple locations.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Fleet Management](#fleet-management)
3. [Mission Planning](#mission-planning)
4. [Mission Monitoring](#mission-monitoring)
5. [Survey Reports](#survey-reports)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the System

1. Open your web browser and navigate to the application URL (default: http://localhost:3000)
2. The dashboard provides an overview of your drone fleet, ongoing missions, and recent survey results

### Dashboard Overview

The dashboard displays:
- Active drones and their current status
- Ongoing missions with progress indicators
- Recent survey reports
- Key performance metrics

## Fleet Management

### Viewing Your Drone Fleet

1. Click on **Fleet** in the main navigation
2. View a list of all drones with their current status, battery level, and location
3. Use the filter options to sort by status, model, or other attributes

### Adding a New Drone

1. In the Fleet Management page, click **Add Drone**
2. Fill in the required information:
   - Name: A unique identifier for the drone
   - Model: The drone model
   - Status: Initial status (idle, maintenance, etc.)
   - Battery Level: Current battery percentage
   - Location: Current coordinates (if known)
3. Click **Save** to add the drone to your fleet

### Editing Drone Information

1. In the drone list, click the **Edit** button next to the drone you want to modify
2. Update the information as needed
3. Click **Save** to apply changes

### Removing a Drone

1. In the drone list, click the **Delete** button next to the drone you want to remove
2. Confirm the deletion when prompted
   - Note: You cannot delete a drone that is currently assigned to an active mission

## Mission Planning

### Creating a New Mission

1. Click on **Missions** in the main navigation, then click **New Mission**
2. Fill in the mission details:
   - Name: A descriptive name for the mission
   - Description: Additional information about the mission
   - Drone: Select an available drone from the dropdown
   - Location: Select a survey location

### Defining the Survey Area

1. In the mission planner, use the map interface to define the survey area:
   - Click the polygon or rectangle tool to draw the survey area
   - Click points on the map to create the boundary
   - Double-click to complete the shape

### Configuring Flight Parameters

1. Set the following parameters:
   - Flight Altitude: Height at which the drone will fly (in meters)
   - Flight Speed: Drone speed during the mission (in m/s)
   - Overlap Percentage: Image overlap for mapping missions (typically 60-80%)
   - Data Collection Frequency: How often the drone will collect data (in seconds)

### Selecting Survey Pattern

1. Choose a survey pattern:
   - **Grid**: Standard back-and-forth pattern for complete coverage
   - **Crosshatch**: Perpendicular passes for enhanced detail
   - **Perimeter**: Flight around the boundary of the area

### Setting Waypoints

1. The system will automatically generate waypoints based on your survey pattern
2. You can manually adjust waypoints by:
   - Dragging points to new positions
   - Adding new waypoints with the "+" button
   - Removing waypoints with the "-" button

### Saving the Mission

1. Review all mission parameters
2. Click **Save Mission** to save without starting
3. Or click **Save and Start** to immediately begin the mission

## Mission Monitoring

### Viewing Active Missions

1. Click on **Missions** in the main navigation
2. Active missions are highlighted and show real-time status

### Monitoring a Specific Mission

1. Click on a mission to open the detailed monitoring view
2. The monitoring interface shows:
   - Real-time drone position on the map
   - Mission progress (percentage complete)
   - Estimated time remaining
   - Battery level and other telemetry data
   - Completed and upcoming waypoints

### Mission Control Actions

1. Use the control buttons to manage the mission:
   - **Start**: Begin the mission (if not already started)
   - **Pause**: Temporarily halt the mission (drone will hover in place)
   - **Resume**: Continue a paused mission
   - **Abort**: End the mission and return the drone to home position

### Viewing Mission Logs

1. In the mission details page, scroll down to the "Mission Logs" section
2. Logs show important events such as:
   - Mission start and end times
   - Waypoint completions
   - Sensor activations
   - Warning events (low battery, high winds, etc.)

## Survey Reports

### Viewing Reports

1. Click on **Reports** in the main navigation
2. The reports dashboard shows:
   - Summary statistics for all surveys
   - Graphs of mission completion rates
   - Survey coverage metrics

### Analyzing Individual Reports

1. Click on a specific report to view details:
   - Flight path visualization
   - Data collection points
   - Flight statistics (duration, distance, area covered)
   - Sensor data summary

### Exporting Reports

1. In the report view, click **Export Report**
2. Choose the export format (CSV, PDF)
3. The report will download to your computer

### Organization-wide Analytics

1. Click on the **Statistics** tab in the Reports section
2. View aggregated data including:
   - Total flight time
   - Total area surveyed
   - Mission success rate
   - Equipment utilization

## Troubleshooting

### Common Issues

#### Drone Not Connecting
- Ensure the drone is powered on and has adequate battery
- Check that the drone is within communication range
- Verify that the drone firmware is up to date

#### Mission Planning Errors
- Ensure the survey area is properly defined
- Check that flight parameters are within the drone's capabilities
- Verify that the selected drone is available and operational

#### Data Not Appearing in Reports
- Confirm that the mission completed successfully
- Check that sensors were properly configured
- Verify that data transmission was successful

### Getting Help

For additional assistance, contact system administrators or refer to the technical documentation. 