#!/bin/bash

# Express.js Stop Script - Task 3
# Generated: October 2, 2025
# Purpose: Gracefully stop Express.js server

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_FILE="$SCRIPT_DIR/../reports/expressjs-stop-report.md"
LOG_FILE="$SCRIPT_DIR/../reports/expressjs-stop.log"

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

echo -e "${BLUE}🛑 Express.js Stop Script - Task 3${NC}"
echo -e "${BLUE}====================================${NC}"
log "Starting Express.js shutdown process..."

# Clean previous logs
> "$LOG_FILE"

# Phase 1: Identify Running Processes
echo -e "\n${YELLOW}🔍 Phase 1: Process Identification${NC}"

# Find processes on port 3000
EXPRESS_PIDS=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null || echo "")

if [ -n "$EXPRESS_PIDS" ]; then
    EXPRESS_PID_ARRAY=($EXPRESS_PIDS)
    check_result "Express.js Process Detection" "PASS" "Found ${#EXPRESS_PID_ARRAY[@]} process(es) on port 3000"
    
    for pid in "${EXPRESS_PID_ARRAY[@]}"; do
        PROCESS_INFO=$(ps -p "$pid" -o pid,ppid,cmd --no-headers 2>/dev/null || echo "Process info unavailable")
        log "Process $pid: $PROCESS_INFO"
    done
else
    check_result "Express.js Process Detection" "PASS" "No processes found on port 3000"
fi

# Find Node.js processes that might be related
NODE_PROCESSES=$(pgrep -f "node.*app\.js\|node.*src/app\.js" 2>/dev/null || echo "")
if [ -n "$NODE_PROCESSES" ]; then
    NODE_PID_ARRAY=($NODE_PROCESSES)
    check_result "Related Node.js Processes" "PASS" "Found ${#NODE_PID_ARRAY[@]} related Node.js process(es)"
    
    for pid in "${NODE_PID_ARRAY[@]}"; do
        PROCESS_INFO=$(ps -p "$pid" -o pid,ppid,cmd --no-headers 2>/dev/null || echo "Process info unavailable")
        log "Node process $pid: $PROCESS_INFO"
    done
else
    check_result "Related Node.js Processes" "PASS" "No related Node.js processes found"
fi

# Phase 2: Graceful Shutdown
echo -e "\n${YELLOW}🔍 Phase 2: Graceful Shutdown${NC}"

# Combine all relevant PIDs
ALL_PIDS=()
if [ -n "$EXPRESS_PIDS" ]; then
    ALL_PIDS+=($EXPRESS_PIDS)
fi
if [ -n "$NODE_PROCESSES" ]; then
    for pid in $NODE_PROCESSES; do
        # Only add if not already in EXPRESS_PIDS
        if [[ ! " ${EXPRESS_PIDS} " =~ " ${pid} " ]]; then
            ALL_PIDS+=($pid)
        fi
    done
fi

if [ ${#ALL_PIDS[@]} -eq 0 ]; then
    check_result "Graceful Shutdown" "PASS" "No processes to stop"
else
    log "Attempting graceful shutdown of ${#ALL_PIDS[@]} process(es)..."
    
    SHUTDOWN_SUCCESS=true
    for pid in "${ALL_PIDS[@]}"; do
        if ps -p "$pid" > /dev/null 2>&1; then
            log "Sending SIGTERM to process $pid..."
            if kill -TERM "$pid" 2>/dev/null; then
                log "SIGTERM sent to process $pid"
            else
                log "Failed to send SIGTERM to process $pid"
                SHUTDOWN_SUCCESS=false
            fi
        else
            log "Process $pid already stopped"
        fi
    done
    
    # Wait for graceful shutdown
    log "Waiting 5 seconds for graceful shutdown..."
    sleep 5
    
    # Check if processes stopped gracefully
    REMAINING_PIDS=()
    for pid in "${ALL_PIDS[@]}"; do
        if ps -p "$pid" > /dev/null 2>&1; then
            REMAINING_PIDS+=($pid)
        fi
    done
    
    if [ ${#REMAINING_PIDS[@]} -eq 0 ]; then
        check_result "Graceful Shutdown" "PASS" "All processes stopped gracefully"
    else
        check_result "Graceful Shutdown" "FAIL" "${#REMAINING_PIDS[@]} process(es) still running"
        SHUTDOWN_SUCCESS=false
    fi
fi

# Phase 3: Force Shutdown (if needed)
echo -e "\n${YELLOW}🔍 Phase 3: Force Shutdown Check${NC}"

if [ "$SHUTDOWN_SUCCESS" = false ] && [ ${#REMAINING_PIDS[@]} -gt 0 ]; then
    log "Attempting force shutdown of remaining processes..."
    
    for pid in "${REMAINING_PIDS[@]}"; do
        if ps -p "$pid" > /dev/null 2>&1; then
            log "Sending SIGKILL to process $pid..."
            if kill -KILL "$pid" 2>/dev/null; then
                log "SIGKILL sent to process $pid"
            else
                log "Failed to send SIGKILL to process $pid"
            fi
        fi
    done
    
    # Wait and verify force shutdown
    sleep 2
    FINAL_REMAINING=()
    for pid in "${REMAINING_PIDS[@]}"; do
        if ps -p "$pid" > /dev/null 2>&1; then
            FINAL_REMAINING+=($pid)
        fi
    done
    
    if [ ${#FINAL_REMAINING[@]} -eq 0 ]; then
        check_result "Force Shutdown" "PASS" "All remaining processes terminated"
    else
        check_result "Force Shutdown" "FAIL" "${#FINAL_REMAINING[@]} process(es) could not be terminated"
    fi
else
    check_result "Force Shutdown" "PASS" "Force shutdown not needed"
fi

# Phase 4: Port Verification
echo -e "\n${YELLOW}🔍 Phase 4: Port Availability Verification${NC}"

sleep 1
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    REMAINING_ON_PORT=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    check_result "Port 3000 Cleanup" "FAIL" "Port still occupied by PID: $REMAINING_ON_PORT"
else
    check_result "Port 3000 Cleanup" "PASS" "Port 3000 is now available"
fi

# Test that port is truly free
if curl -s --max-time 2 http://localhost:3000 >/dev/null 2>&1; then
    check_result "Server Response Test" "FAIL" "Server still responding"
else
    check_result "Server Response Test" "PASS" "Server no longer responding"
fi

# Phase 5: Cleanup Check
echo -e "\n${YELLOW}🔍 Phase 5: Environment Cleanup${NC}"

# Check for any remaining Express.js related processes
REMAINING_EXPRESS=$(pgrep -f "express\|app\.js" 2>/dev/null || echo "")
if [ -n "$REMAINING_EXPRESS" ]; then
    check_result "Express.js Process Cleanup" "FAIL" "Remaining Express.js processes: $REMAINING_EXPRESS"
else
    check_result "Express.js Process Cleanup" "PASS" "No remaining Express.js processes"
fi

# Check for temporary files or locks
TEMP_FILES=$(find /tmp -name "*express*" -o -name "*node*" 2>/dev/null | wc -l)
check_result "Temporary File Check" "PASS" "Found $TEMP_FILES temporary files (normal)"

# Generate summary report
echo -e "\n${BLUE}📊 Express.js Stop Summary${NC}"
echo -e "${BLUE}===========================${NC}"
echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"

# Create detailed report
cat > "$REPORT_FILE" << EOF
# Express.js Stop Report - Task 3

**Generated**: $(date)  
**Status**: $([ $FAILED_CHECKS -eq 0 ] && echo "✅ SUCCESS" || echo "❌ FAILED")  
**Pass Rate**: $((PASSED_CHECKS * 100 / TOTAL_CHECKS))%

## Summary
- Total Checks: $TOTAL_CHECKS
- Passed: $PASSED_CHECKS
- Failed: $FAILED_CHECKS

## Process Information
- Initial Processes Found: ${#ALL_PIDS[@]}
- Graceful Shutdown: $([ "$SHUTDOWN_SUCCESS" = true ] && echo "✅ Successful" || echo "❌ Required Force Shutdown")
- Final Port Status: $(lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo "❌ Still Occupied" || echo "✅ Available")

## Operations Performed
1. Process identification on port 3000
2. Related Node.js process detection
3. Graceful shutdown (SIGTERM)
$([ "$SHUTDOWN_SUCCESS" = false ] && echo "4. Force shutdown (SIGKILL)")
5. Port availability verification
6. Environment cleanup check

## Terminated Processes
$(if [ ${#ALL_PIDS[@]} -gt 0 ]; then
    for pid in "${ALL_PIDS[@]}"; do
        echo "- PID: $pid"
    done
else
    echo "- No processes were running"
fi)

## Next Steps
$([ $FAILED_CHECKS -eq 0 ] && echo "✅ Express.js cleanly stopped - ready for restart" || echo "❌ Manual cleanup may be required")

---
*Generated by Express.js Stop Script*
EOF

log "Report generated: $REPORT_FILE"

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}✅ Express.js shutdown completed successfully!${NC}"
    echo -e "${GREEN}🔄 Ready for restart or next task${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Express.js shutdown encountered issues!${NC}"
    echo -e "${RED}🛠️  Manual cleanup may be required${NC}"
    exit 1
fi