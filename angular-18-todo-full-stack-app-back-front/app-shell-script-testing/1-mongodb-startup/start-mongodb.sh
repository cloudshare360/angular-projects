#!/bin/bash

# MongoDB Startup Script - Task 1
# Generated: October 2, 2025
# Purpose: Start MongoDB containers and verify basic connectivity

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_FILE="$SCRIPT_DIR/../reports/mongodb-startup-report.md"
LOG_FILE="$SCRIPT_DIR/../reports/mongodb-startup.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Result tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC}" | tee -a "$LOG_FILE"
        if [ -n "$details" ]; then
            echo -e "   ${BLUE}ℹ️  $details${NC}" | tee -a "$LOG_FILE"
        fi
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ $test_name: FAIL${NC}" | tee -a "$LOG_FILE"
        if [ -n "$details" ]; then
            echo -e "   ${YELLOW}⚠️  $details${NC}" | tee -a "$LOG_FILE"
        fi
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo -e "${BLUE}🚀 MongoDB Startup Script - Task 1${NC}"
echo -e "${BLUE}=====================================+${NC}"
log "Starting MongoDB startup process..."

# Clean previous logs
> "$LOG_FILE"

# Check if Docker is running
echo -e "\n${YELLOW}🔍 Phase 1: Docker Environment Check${NC}"
if ! command -v docker &> /dev/null; then
    check_result "Docker Installation" "FAIL" "Docker is not installed"
    exit 1
fi

if ! docker info &> /dev/null; then
    check_result "Docker Service" "FAIL" "Docker service is not running"
    log "Attempting to start Docker service..."
    
    # Try to start Docker service
    if sudo systemctl start docker 2>/dev/null; then
        sleep 3
        if docker info &> /dev/null; then
            check_result "Docker Service" "PASS" "Docker service started successfully"
        else
            check_result "Docker Service" "FAIL" "Failed to start Docker service"
            exit 1
        fi
    else
        check_result "Docker Service" "FAIL" "Cannot start Docker service"
        exit 1
    fi
else
    check_result "Docker Service" "PASS" "Docker is running"
fi

# Navigate to MongoDB directory
echo -e "\n${YELLOW}🔍 Phase 2: MongoDB Configuration Check${NC}"
MONGODB_DIR="$PROJECT_ROOT/data-base/mongodb"

if [ ! -d "$MONGODB_DIR" ]; then
    check_result "MongoDB Directory" "FAIL" "Directory not found: $MONGODB_DIR"
    exit 1
fi

check_result "MongoDB Directory" "PASS" "Found at $MONGODB_DIR"

cd "$MONGODB_DIR"

if [ ! -f "docker-compose.yml" ]; then
    check_result "Docker Compose File" "FAIL" "docker-compose.yml not found"
    exit 1
fi

check_result "Docker Compose File" "PASS" "docker-compose.yml exists"

# Stop any existing containers
echo -e "\n${YELLOW}🔍 Phase 3: Container Management${NC}"
log "Stopping any existing MongoDB containers..."

if sudo docker-compose down 2>/dev/null; then
    check_result "Container Cleanup" "PASS" "Existing containers stopped"
else
    check_result "Container Cleanup" "PASS" "No existing containers to stop"
fi

# Start MongoDB containers
log "Starting MongoDB containers..."
if sudo docker-compose up -d; then
    check_result "Container Startup" "PASS" "MongoDB containers started"
else
    check_result "Container Startup" "FAIL" "Failed to start MongoDB containers"
    exit 1
fi

# Wait for containers to be ready
echo -e "\n${YELLOW}🔍 Phase 4: Container Health Check${NC}"
log "Waiting for containers to be ready..."
sleep 10

# Check if containers are running
MONGODB_CONTAINER=$(sudo docker ps --filter "name=angular-todo-mongodb" --format "{{.Names}}" | head -1)
MONGOUI_CONTAINER=$(sudo docker ps --filter "name=angular-todo-mongo-ui" --format "{{.Names}}" | head -1)

if [ -n "$MONGODB_CONTAINER" ]; then
    check_result "MongoDB Container" "PASS" "Container $MONGODB_CONTAINER is running"
else
    check_result "MongoDB Container" "FAIL" "MongoDB container is not running"
fi

if [ -n "$MONGOUI_CONTAINER" ]; then
    check_result "MongoDB UI Container" "PASS" "Container $MONGOUI_CONTAINER is running"
else
    check_result "MongoDB UI Container" "FAIL" "MongoDB UI container is not running"
fi

# Test basic connectivity
echo -e "\n${YELLOW}🔍 Phase 5: Basic Connectivity Test${NC}"
log "Testing MongoDB connectivity..."

# Test MongoDB connection
if sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.runCommand({ping: 1})" &>/dev/null; then
    check_result "MongoDB Connection" "PASS" "Database connection successful"
else
    check_result "MongoDB Connection" "FAIL" "Cannot connect to MongoDB"
fi

# Test MongoDB UI accessibility
if curl -s --max-time 5 http://localhost:8081 >/dev/null 2>&1; then
    check_result "MongoDB UI Access" "PASS" "UI accessible at http://localhost:8081"
else
    check_result "MongoDB UI Access" "FAIL" "UI not accessible"
fi

# Generate summary report
echo -e "\n${BLUE}📊 MongoDB Startup Summary${NC}"
echo -e "${BLUE}===========================${NC}"
echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"

# Create detailed report
cat > "$REPORT_FILE" << EOF
# MongoDB Startup Report - Task 1

**Generated**: $(date)  
**Status**: $([ $FAILED_CHECKS -eq 0 ] && echo "✅ SUCCESS" || echo "❌ FAILED")  
**Pass Rate**: $((PASSED_CHECKS * 100 / TOTAL_CHECKS))%

## Summary
- Total Checks: $TOTAL_CHECKS
- Passed: $PASSED_CHECKS
- Failed: $FAILED_CHECKS

## Container Information
- MongoDB Container: ${MONGODB_CONTAINER:-"Not Running"}
- MongoDB UI Container: ${MONGOUI_CONTAINER:-"Not Running"}

## Connection Details
- MongoDB URI: mongodb://admin:todopassword123@localhost:27017/tododb?authSource=admin
- MongoDB UI: http://localhost:8081
- Credentials: admin / admin123

## Next Steps
$([ $FAILED_CHECKS -eq 0 ] && echo "✅ Ready for Task 2: MongoDB Testing" || echo "❌ Fix issues before proceeding")

---
*Generated by MongoDB Startup Script*
EOF

log "Report generated: $REPORT_FILE"

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}✅ MongoDB startup completed successfully!${NC}"
    echo -e "${GREEN}🔄 Ready for Task 2: MongoDB Testing${NC}"
    exit 0
else
    echo -e "\n${RED}❌ MongoDB startup failed!${NC}"
    echo -e "${RED}🛠️  Please fix the issues before proceeding${NC}"
    exit 1
fi