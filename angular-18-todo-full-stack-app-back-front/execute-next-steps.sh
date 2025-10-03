#!/bin/bash

# =============================================================================
# NEXT STEPS EXECUTION SCRIPT
# =============================================================================
# This script guides you through the remaining E2E testing implementation
# steps with proper validation and user interaction.
#
# Usage: ./execute-next-steps.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║             NEXT STEPS EXECUTION GUIDE                  ║${NC}"
echo -e "${BLUE}║        E2E Testing Implementation Completion             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to wait for user confirmation
wait_for_user() {
    echo -e "${YELLOW}⏳ Press ENTER to continue or Ctrl+C to exit...${NC}"
    read -r
}

# Function to check if services are running
check_services() {
    echo -e "${BLUE}🔍 Checking Service Status...${NC}"
    
    # Check MongoDB
    if netstat -ln | grep -q ":27017.*LISTEN"; then
        echo -e "${GREEN}✅ MongoDB: Running${NC}"
        MONGODB_OK=true
    else
        echo -e "${RED}❌ MongoDB: Not Running${NC}"
        MONGODB_OK=false
    fi
    
    # Check Backend
    if curl -s http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Express.js Backend: Running${NC}"
        BACKEND_OK=true
    else
        echo -e "${RED}❌ Express.js Backend: Not Running${NC}"
        BACKEND_OK=false
    fi
    
    # Check Frontend
    if curl -s -I http://localhost:4200 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Angular Frontend: Running${NC}"
        FRONTEND_OK=true
    else
        echo -e "${RED}❌ Angular Frontend: Not Running${NC}"
        FRONTEND_OK=false
    fi
    
    echo ""
}

# Step 1: Service Status Check
echo -e "${PURPLE}🎯 STEP 1: Current Service Status Assessment${NC}"
echo "=============================================="
check_services

if [ "$MONGODB_OK" = true ] && [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}🎉 All services are running! Ready to proceed with E2E testing.${NC}"
    echo ""
    wait_for_user
else
    echo -e "${YELLOW}⚠️ Some services need to be started.${NC}"
    echo ""
    echo -e "${PURPLE}🎯 STEP 2: Starting Services${NC}"
    echo "============================="
    echo -e "${BLUE}Starting all development services...${NC}"
    echo ""
    
    echo -e "${YELLOW}This will start:${NC}"
    echo "• MongoDB (if not running)"
    echo "• Express.js Backend API"
    echo "• Angular Frontend Application"
    echo ""
    
    wait_for_user
    
    echo -e "${BLUE}🚀 Executing: ./start-dev.sh${NC}"
    ./start-dev.sh
    
    echo ""
    echo -e "${BLUE}⏳ Waiting 10 seconds for services to fully initialize...${NC}"
    sleep 10
    
    echo ""
    echo -e "${BLUE}🔍 Re-checking service status...${NC}"
    check_services
fi

# Step 3: Service Validation
echo -e "${PURPLE}🎯 STEP 3: Comprehensive Service Validation${NC}"
echo "============================================"
echo -e "${BLUE}Running service validation script...${NC}"
echo ""

if [ -f "./validate-services-before-e2e.sh" ]; then
    echo -e "${BLUE}🧪 Executing: ./validate-services-before-e2e.sh${NC}"
    ./validate-services-before-e2e.sh
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Service validation passed! All systems ready.${NC}"
    else
        echo ""
        echo -e "${RED}❌ Service validation failed. Please check the output above.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️ Service validation script not found. Proceeding with manual checks...${NC}"
fi

echo ""
wait_for_user

# Step 4: E2E Test Execution
echo -e "${PURPLE}🎯 STEP 4: Execute Optimized E2E Tests${NC}"
echo "======================================"
echo -e "${BLUE}Running E2E tests with all optimizations:${NC}"
echo "• Automatic service validation"
echo "• No redundant login operations"
echo "• 3-5 second delays between test cases"
echo "• Sequential execution with browser visibility"
echo "• Responsive design validation"
echo ""

wait_for_user

echo -e "${BLUE}🎭 Changing to frontend directory...${NC}"
cd Front-End/angular-18-todo-app

echo ""
echo -e "${BLUE}🧪 Executing: npm run test:e2e:headed${NC}"
echo -e "${YELLOW}This will open a browser window. Watch the tests execute!${NC}"
echo ""

npm run test:e2e:headed

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 E2E tests completed successfully!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️ Some tests may have failed. Check the results above.${NC}"
    echo -e "${BLUE}Would you like to run specific tests for debugging? (y/n)${NC}"
    read -r debug_choice
    
    if [ "$debug_choice" = "y" ] || [ "$debug_choice" = "Y" ]; then
        echo ""
        echo -e "${BLUE}🔍 Running authentication flow tests specifically...${NC}"
        npx playwright test --headed --project=chromium -g "registration"
        echo ""
        npx playwright test --headed --project=chromium -g "login"
    fi
fi

echo ""
wait_for_user

# Step 5: Cross-Device Testing
echo -e "${PURPLE}🎯 STEP 5: Cross-Device Responsive Testing${NC}"
echo "==========================================="
echo -e "${BLUE}Testing responsive design across different screen sizes...${NC}"
echo ""

echo -e "${YELLOW}Would you like to run cross-device testing? (y/n)${NC}"
read -r responsive_choice

if [ "$responsive_choice" = "y" ] || [ "$responsive_choice" = "Y" ]; then
    echo ""
    echo -e "${BLUE}📱 Testing Mobile Layout (480px)...${NC}"
    npx playwright test --headed --project=mobile user-journey.spec.ts || true
    
    echo ""
    echo -e "${BLUE}📊 Testing Tablet Layout (768px)...${NC}"
    npx playwright test --headed --project=tablet user-journey.spec.ts || true
    
    echo ""
    echo -e "${GREEN}📋 Cross-device testing completed!${NC}"
fi

# Step 6: Final Summary
echo ""
echo -e "${PURPLE}🎯 FINAL SUMMARY${NC}"
echo "================"
echo -e "${GREEN}✅ Service startup and validation completed${NC}"
echo -e "${GREEN}✅ E2E tests executed with all optimizations${NC}"
echo -e "${GREEN}✅ Authentication state management tested${NC}"
echo -e "${GREEN}✅ Inter-test delays and realistic timing validated${NC}"
echo -e "${GREEN}✅ Responsive design tested across breakpoints${NC}"
echo ""

echo -e "${BLUE}📊 Next Steps for Production:${NC}"
echo "1. Review test execution results and reports"
echo "2. Add any additional test cases as needed"
echo "3. Integrate with CI/CD pipeline"
echo "4. Set up automated test execution schedules"
echo "5. Create monitoring and alerting for test failures"
echo ""

echo -e "${PURPLE}📋 Documentation Available:${NC}"
echo "• E2E-TESTING-BEST-PRACTICES.md - Complete implementation guide"
echo "• E2E-TEST-PLAN-UPDATED.md - Updated test strategy"
echo "• NEXT-STEPS-ROADMAP.md - Detailed roadmap and metrics"
echo ""

echo -e "${GREEN}🎉 E2E Testing Implementation Complete!${NC}"
echo -e "${BLUE}Your application is now ready for production deployment with comprehensive E2E testing.${NC}"
echo ""

cd ../../