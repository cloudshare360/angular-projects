#!/bin/bash

# =============================================================================
# SERVICE VALIDATION SCRIPT FOR E2E TESTING
# =============================================================================
# This script MUST be executed before running any Playwright E2E tests
# to ensure all required services are running and healthy.
#
# Usage: ./validate-services-before-e2e.sh
# =============================================================================

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║           PRE-E2E TESTING SERVICE VALIDATION             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation flags
MONGODB_OK=false
BACKEND_OK=false
FRONTEND_OK=false
ALL_SERVICES_OK=false

echo -e "${BLUE}🔍 STEP 1: Validating MongoDB Service (Port 27017)${NC}"
if netstat -ln | grep -q ":27017.*LISTEN"; then
    echo -e "${GREEN}✅ MongoDB is running on port 27017${NC}"
    MONGODB_OK=true
else
    echo -e "${RED}❌ MongoDB is NOT running on port 27017${NC}"
fi
echo ""

echo -e "${BLUE}🔍 STEP 2: Validating Express.js Backend (Port 3000)${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/health | jq -r '.data.message' 2>/dev/null || echo "Invalid JSON")
    if [ "$HEALTH_RESPONSE" = "OK" ]; then
        echo -e "${GREEN}✅ Express.js Backend is running and healthy on port 3000${NC}"
        BACKEND_OK=true
    else
        echo -e "${RED}❌ Express.js Backend is running but unhealthy (Response: $HEALTH_RESPONSE)${NC}"
    fi
else
    echo -e "${RED}❌ Express.js Backend is NOT responding on port 3000${NC}"
fi
echo ""

echo -e "${BLUE}🔍 STEP 3: Validating Angular Frontend (Port 4200)${NC}"
if curl -s -I http://localhost:4200 | grep -q "HTTP/1.1 200 OK"; then
    echo -e "${GREEN}✅ Angular Frontend is running and accessible on port 4200${NC}"
    FRONTEND_OK=true
else
    echo -e "${RED}❌ Angular Frontend is NOT responding on port 4200${NC}"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    VALIDATION RESULTS                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

if [ "$MONGODB_OK" = true ] && [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    ALL_SERVICES_OK=true
    echo -e "${GREEN}🎉 ALL SERVICES ARE RUNNING AND HEALTHY!${NC}"
    echo -e "${GREEN}✅ MongoDB: Running${NC}"
    echo -e "${GREEN}✅ Express.js Backend: Running & Healthy${NC}"
    echo -e "${GREEN}✅ Angular Frontend: Running & Accessible${NC}"
    echo ""
    echo -e "${GREEN}🚀 READY TO EXECUTE E2E PLAYWRIGHT TESTS${NC}"
    echo ""
    echo "To run E2E tests:"
    echo "  cd Front-End/angular-18-todo-app"
    echo "  npx playwright test --headed --project=chromium"
else
    echo -e "${RED}❌ SERVICE VALIDATION FAILED!${NC}"
    echo ""
    echo "Service Status:"
    [ "$MONGODB_OK" = true ] && echo -e "${GREEN}✅ MongoDB: Running${NC}" || echo -e "${RED}❌ MongoDB: Not Running${NC}"
    [ "$BACKEND_OK" = true ] && echo -e "${GREEN}✅ Express.js Backend: Running & Healthy${NC}" || echo -e "${RED}❌ Express.js Backend: Not Running or Unhealthy${NC}"
    [ "$FRONTEND_OK" = true ] && echo -e "${GREEN}✅ Angular Frontend: Running & Accessible${NC}" || echo -e "${RED}❌ Angular Frontend: Not Running${NC}"
    echo ""
    echo -e "${YELLOW}🔧 TO FIX: Start all services using:${NC}"
    echo "  ./start-dev.sh"
    echo ""
    echo -e "${YELLOW}⏳ Wait 30-60 seconds for all services to start, then run this script again.${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    END OF VALIDATION                     ║"
echo "╚══════════════════════════════════════════════════════════╝"

# Exit with appropriate code
if [ "$ALL_SERVICES_OK" = true ]; then
    exit 0
else
    exit 1
fi