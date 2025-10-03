#!/bin/bash

# MongoDB Stop Script - Task 1
# Generated: October 2, 2025
# Purpose: Gracefully stop MongoDB containers and cleanup

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_FILE="$SCRIPT_DIR/../reports/mongodb-stop-report.md"
LOG_FILE="$SCRIPT_DIR/../reports/mongodb-stop.log"

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

echo -e "${BLUE}🛑 MongoDB Stop Script - Task 1${NC}"
echo -e "${BLUE}=================================${NC}"
log "Starting MongoDB shutdown process..."

# Clean previous logs
> "$LOG_FILE"

# Navigate to MongoDB directory
echo -e "\n${YELLOW}🔍 Phase 1: Locating MongoDB Configuration${NC}"
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

# Check current container status
echo -e "\n${YELLOW}🔍 Phase 2: Current Container Status${NC}"
MONGODB_RUNNING=$(sudo docker ps --filter "name=angular-todo-mongodb" --format "{{.Names}}" | head -1)
MONGOUI_RUNNING=$(sudo docker ps --filter "name=angular-todo-mongo-ui" --format "{{.Names}}" | head -1)

if [ -n "$MONGODB_RUNNING" ]; then
    check_result "MongoDB Container Status" "PASS" "Container $MONGODB_RUNNING is running"
    MONGODB_WAS_RUNNING=true
else
    check_result "MongoDB Container Status" "PASS" "No MongoDB container running"
    MONGODB_WAS_RUNNING=false
fi

if [ -n "$MONGOUI_RUNNING" ]; then
    check_result "MongoDB UI Container Status" "PASS" "Container $MONGOUI_RUNNING is running"
    MONGOUI_WAS_RUNNING=true
else
    check_result "MongoDB UI Container Status" "PASS" "No MongoDB UI container running"
    MONGOUI_WAS_RUNNING=false
fi

# Graceful shutdown
echo -e "\n${YELLOW}🔍 Phase 3: Graceful Container Shutdown${NC}"

if [ "$MONGODB_WAS_RUNNING" = true ] || [ "$MONGOUI_WAS_RUNNING" = true ]; then
    log "Stopping MongoDB containers gracefully..."
    
    # Give containers time to save data
    if [ "$MONGODB_WAS_RUNNING" = true ]; then
        log "Sending graceful shutdown signal to MongoDB..."
        sudo docker exec "$MONGODB_RUNNING" mongosh -u admin -p todopassword123 --authenticationDatabase admin --eval "db.adminCommand({shutdown: 1})" 2>/dev/null || true
        sleep 3
    fi
    
    # Stop containers using docker-compose
    if sudo docker-compose down; then
        check_result "Container Shutdown" "PASS" "Containers stopped gracefully"
    else
        check_result "Container Shutdown" "FAIL" "Failed to stop containers gracefully"
        
        # Force stop if graceful shutdown failed
        log "Attempting force shutdown..."
        if sudo docker-compose down --remove-orphans -t 10; then
            check_result "Force Shutdown" "PASS" "Containers force stopped"
        else
            check_result "Force Shutdown" "FAIL" "Failed to force stop containers"
        fi
    fi
else
    check_result "Container Shutdown" "PASS" "No containers were running"
fi

# Verify containers are stopped
echo -e "\n${YELLOW}🔍 Phase 4: Shutdown Verification${NC}"
sleep 2

MONGODB_STILL_RUNNING=$(sudo docker ps --filter "name=angular-todo-mongodb" --format "{{.Names}}" | head -1)
MONGOUI_STILL_RUNNING=$(sudo docker ps --filter "name=angular-todo-mongo-ui" --format "{{.Names}}" | head -1)

if [ -z "$MONGODB_STILL_RUNNING" ]; then
    check_result "MongoDB Container Stopped" "PASS" "Container fully stopped"
else
    check_result "MongoDB Container Stopped" "FAIL" "Container still running: $MONGODB_STILL_RUNNING"
fi

if [ -z "$MONGOUI_STILL_RUNNING" ]; then
    check_result "MongoDB UI Container Stopped" "PASS" "Container fully stopped"
else
    check_result "MongoDB UI Container Stopped" "FAIL" "Container still running: $MONGOUI_STILL_RUNNING"
fi

# Optional cleanup
echo -e "\n${YELLOW}🔍 Phase 5: Optional Cleanup${NC}"
read -p "Do you want to remove stopped containers? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Removing stopped containers..."
    if sudo docker-compose rm -f; then
        check_result "Container Cleanup" "PASS" "Stopped containers removed"
    else
        check_result "Container Cleanup" "FAIL" "Failed to remove containers"
    fi
else
    check_result "Container Cleanup" "PASS" "Cleanup skipped by user"
fi

# Check for orphaned volumes (information only)
VOLUMES=$(sudo docker volume ls --filter "name=angular-todo" --format "{{.Name}}")
if [ -n "$VOLUMES" ]; then
    log "MongoDB volumes preserved: $VOLUMES"
    check_result "Volume Preservation" "PASS" "Data volumes preserved"
else
    check_result "Volume Preservation" "PASS" "No volumes found"
fi

# Generate summary report
echo -e "\n${BLUE}📊 MongoDB Stop Summary${NC}"
echo -e "${BLUE}========================${NC}"
echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"

# Create detailed report
cat > "$REPORT_FILE" << EOF
# MongoDB Stop Report - Task 1

**Generated**: $(date)  
**Status**: $([ $FAILED_CHECKS -eq 0 ] && echo "✅ SUCCESS" || echo "❌ FAILED")  
**Pass Rate**: $((PASSED_CHECKS * 100 / TOTAL_CHECKS))%

## Summary
- Total Checks: $TOTAL_CHECKS
- Passed: $PASSED_CHECKS
- Failed: $FAILED_CHECKS

## Initial State
- MongoDB Container: $([ "$MONGODB_WAS_RUNNING" = true ] && echo "Running" || echo "Not Running")
- MongoDB UI Container: $([ "$MONGOUI_WAS_RUNNING" = true ] && echo "Running" || echo "Not Running")

## Final State
- MongoDB Container: $([ -z "$MONGODB_STILL_RUNNING" ] && echo "Stopped" || echo "Still Running")
- MongoDB UI Container: $([ -z "$MONGOUI_STILL_RUNNING" ] && echo "Stopped" || echo "Still Running")

## Data Preservation
- Volumes: $([ -n "$VOLUMES" ] && echo "Preserved" || echo "None Found")

## Operations Performed
1. Graceful shutdown signal sent to MongoDB
2. Docker Compose down executed
3. Container status verification
4. Optional cleanup $([ "$REPLY" = "y" ] && echo "performed" || echo "skipped")

---
*Generated by MongoDB Stop Script*
EOF

log "Report generated: $REPORT_FILE"

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}✅ MongoDB shutdown completed successfully!${NC}"
    echo -e "${GREEN}🗃️  Data volumes preserved for next startup${NC}"
    exit 0
else
    echo -e "\n${RED}❌ MongoDB shutdown encountered issues!${NC}"
    echo -e "${RED}🔍 Check running containers manually${NC}"
    exit 1
fi