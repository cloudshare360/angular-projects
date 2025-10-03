#!/bin/bash

# =============================================================================
# FAST E2E TESTING EXECUTION SCRIPT
# =============================================================================
# Optimized for speed while maintaining test quality
# Usage: ./fast-e2e-execution.sh
# =============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 FAST E2E TESTING EXECUTION${NC}"
echo "=================================="
echo ""

# Quick service check function
quick_service_check() {
    echo -e "${BLUE}⚡ Quick Service Status Check...${NC}"
    
    # Check all services in parallel
    (netstat -ln | grep -q ":27017.*LISTEN" && echo -e "${GREEN}✅ MongoDB${NC}") &
    (curl -s http://localhost:3000/health >/dev/null 2>&1 && echo -e "${GREEN}✅ Backend${NC}") &
    (curl -s -I http://localhost:4200 >/dev/null 2>&1 && echo -e "${GREEN}✅ Frontend${NC}") &
    
    wait
    echo ""
}

# Fast service startup
start_services_fast() {
    echo -e "${YELLOW}🔧 Starting services (background mode)...${NC}"
    nohup ./start-dev.sh > dev-startup.log 2>&1 &
    STARTUP_PID=$!
    
    echo -e "${BLUE}⏳ Waiting for services (30s max)...${NC}"
    
    # Poll for services with timeout
    for i in {1..30}; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1 && curl -s -I http://localhost:4200 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ All services ready in ${i} seconds!${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
}

# Check current service status
quick_service_check

# Start services if needed
if ! (curl -s http://localhost:3000/health >/dev/null 2>&1 && curl -s -I http://localhost:4200 >/dev/null 2>&1); then
    start_services_fast
fi

# Quick validation
echo -e "${BLUE}⚡ Quick Validation...${NC}"
if curl -s http://localhost:3000/health | grep -q "OK" && curl -s -I http://localhost:4200 | grep -q "200 OK"; then
    echo -e "${GREEN}✅ Services validated successfully${NC}"
else
    echo -e "${RED}❌ Service validation failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🎭 Executing FAST E2E Tests...${NC}"
echo "================================"

cd Front-End/angular-18-todo-app

# Run tests with speed optimizations
echo -e "${YELLOW}Running optimized E2E tests...${NC}"
npx playwright test user-journey.spec.ts --headed --project=chromium --workers=1 --reporter=line

echo ""
echo -e "${GREEN}🎉 Fast E2E execution completed!${NC}"
cd ../../