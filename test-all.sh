#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting comprehensive test suite for Drone Survey Management System...${NC}"
echo -e "${YELLOW}==================================================================${NC}"

# Check if PostgreSQL is running
echo -e "\n${YELLOW}Checking PostgreSQL connection...${NC}"
pg_isready
if [ $? -ne 0 ]; then
  echo -e "${RED}PostgreSQL is not running. Please start PostgreSQL and try again.${NC}"
  exit 1
fi
echo -e "${GREEN}PostgreSQL is running.${NC}"

# Test backend database connection
echo -e "\n${YELLOW}Testing database connection and schema...${NC}"
cd backend
node db-check.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Database check failed. Please check your database configuration.${NC}"
  exit 1
fi
echo -e "${GREEN}Database check passed.${NC}"

# Test backend API endpoints
echo -e "\n${YELLOW}Testing backend API endpoints...${NC}"
npm test
if [ $? -ne 0 ]; then
  echo -e "${RED}API endpoint tests failed.${NC}"
  exit 1
fi
echo -e "${GREEN}API endpoint tests passed.${NC}"

# Start backend server for frontend tests
echo -e "\n${YELLOW}Starting backend server for frontend tests...${NC}"
npm start & 
BACKEND_PID=$!
echo $BACKEND_PID > server.pid
echo -e "${GREEN}Backend server started with PID $BACKEND_PID.${NC}"
sleep 5 # Give the server time to start

# Test frontend
echo -e "\n${YELLOW}Testing frontend...${NC}"
cd ../frontend
npm test -- --watchAll=false
FRONTEND_TEST_RESULT=$?

# Stop backend server
echo -e "\n${YELLOW}Stopping backend server...${NC}"
cd ../backend
kill $(cat server.pid)
rm server.pid
echo -e "${GREEN}Backend server stopped.${NC}"

# Report results
echo -e "\n${YELLOW}Test Results Summary${NC}"
echo -e "${YELLOW}===================${NC}"

if [ $FRONTEND_TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please check the logs above for details.${NC}"
  exit 1
fi 