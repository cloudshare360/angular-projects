#!/bin/bash

# Express.js Startup Script - Task 3
# Generated: October 2, 2025
# Purpose: Start Express.js API server and verify basic functionality

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EXPRESS_DIR="$PROJECT_ROOT/Back-End/express-rest-todo-api"
REPORT_FILE="$SCRIPT_DIR/../reports/expressjs-startup-report.md"
LOG_FILE="$SCRIPT_DIR/../reports/expressjs-startup.log"

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

echo -e "${BLUE}🚀 Express.js Startup Script - Task 3${NC}"
echo -e "${BLUE}=====================================${NC}"
log "Starting Express.js startup process..."

# Clean previous logs
> "$LOG_FILE"

# Phase 1: Environment Verification
echo -e "\n${YELLOW}🔍 Phase 1: Environment Check${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_result "Node.js Installation" "PASS" "Version: $NODE_VERSION"
else
    check_result "Node.js Installation" "FAIL" "Node.js not found"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_result "NPM Installation" "PASS" "Version: $NPM_VERSION"
else
    check_result "NPM Installation" "FAIL" "NPM not found"
    exit 1
fi

# Phase 2: Project Structure Verification
echo -e "\n${YELLOW}🔍 Phase 2: Project Structure Check${NC}"

if [ ! -d "$EXPRESS_DIR" ]; then
    check_result "Express.js Directory" "FAIL" "Directory not found: $EXPRESS_DIR"
    exit 1
fi

check_result "Express.js Directory" "PASS" "Found at $EXPRESS_DIR"

cd "$EXPRESS_DIR"

if [ ! -f "package.json" ]; then
    check_result "Package.json" "FAIL" "package.json not found"
    exit 1
fi

check_result "Package.json" "PASS" "package.json exists"

# Check main app file
if [ -f "src/app.js" ]; then
    APP_FILE="src/app.js"
    check_result "Main App File" "PASS" "Using src/app.js"
elif [ -f "app.js" ]; then
    APP_FILE="app.js"
    check_result "Main App File" "PASS" "Using app.js"
else
    check_result "Main App File" "FAIL" "No app.js found"
    exit 1
fi

# Phase 3: MongoDB Dependency Check
echo -e "\n${YELLOW}🔍 Phase 3: MongoDB Dependency Check${NC}"

# Check if MongoDB is running
MONGODB_CONTAINER=$(sudo docker ps --filter "name=angular-todo-mongodb" --format "{{.Names}}" | head -1)
if [ -n "$MONGODB_CONTAINER" ]; then
    # Test MongoDB connection
    if sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.runCommand({ping: 1})" --quiet &>/dev/null; then
        check_result "MongoDB Connection" "PASS" "MongoDB is accessible"
    else
        check_result "MongoDB Connection" "FAIL" "Cannot connect to MongoDB"
        echo -e "${YELLOW}💡 Run Task 1 to start MongoDB${NC}"
    fi
else
    check_result "MongoDB Connection" "FAIL" "MongoDB container not running"
    echo -e "${YELLOW}💡 Run Task 1 to start MongoDB${NC}"
fi

# Phase 4: Dependency Installation
echo -e "\n${YELLOW}🔍 Phase 4: Dependency Management${NC}"

log "Checking node_modules..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    log "Installing dependencies..."
    if npm install; then
        check_result "Dependency Installation" "PASS" "Dependencies installed successfully"
    else
        check_result "Dependency Installation" "FAIL" "Failed to install dependencies"
        exit 1
    fi
else
    log "Dependencies already installed, checking for updates..."
    if npm ci --only=production; then
        check_result "Dependency Verification" "PASS" "Dependencies verified"
    else
        check_result "Dependency Verification" "FAIL" "Dependency verification failed"
    fi
fi

# Phase 5: Port Availability Check
echo -e "\n${YELLOW}🔍 Phase 5: Port Availability${NC}"

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    EXISTING_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    check_result "Port 3000 Availability" "FAIL" "Port already in use by PID: $EXISTING_PID"
    
    # Try to kill existing process
    read -p "Kill existing process on port 3000? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if kill -TERM "$EXISTING_PID" 2>/dev/null; then
            sleep 2
            if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
                check_result "Port Cleanup" "PASS" "Existing process terminated"
            else
                check_result "Port Cleanup" "FAIL" "Failed to terminate existing process"
                exit 1
            fi
        else
            check_result "Port Cleanup" "FAIL" "Cannot terminate existing process"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Cannot start server with port occupied${NC}"
        exit 1
    fi
else
    check_result "Port 3000 Availability" "PASS" "Port 3000 is available"
fi

# Phase 6: Application Startup
echo -e "\n${YELLOW}🔍 Phase 6: Express.js Server Startup${NC}"

log "Starting Express.js server..."

# Create startup script to run in background
cat > start_server.js << 'EOF'
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Express.js server...');

// Determine which app file to use
let appFile = 'src/app.js';
if (!fs.existsSync(appFile)) {
    appFile = 'app.js';
}

console.log(`📁 Using app file: ${appFile}`);

const server = spawn('node', [appFile], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
});

let startupComplete = false;
let startupTimeout;

// Set startup timeout
startupTimeout = setTimeout(() => {
    if (!startupComplete) {
        console.log('❌ Server startup timeout');
        server.kill('SIGTERM');
        process.exit(1);
    }
}, 10000); // 10 second timeout

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`📤 ${output.trim()}`);
    
    // Check for successful startup indicators
    if (output.includes('listening') || 
        output.includes('Server running') || 
        output.includes('started') ||
        output.includes('3000')) {
        startupComplete = true;
        clearTimeout(startupTimeout);
        console.log('✅ Server startup detected');
        
        // Test basic connectivity
        setTimeout(() => {
            const http = require('http');
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/',
                method: 'GET',
                timeout: 5000
            };
            
            const req = http.request(options, (res) => {
                console.log(`✅ Server responding with status: ${res.statusCode}`);
                console.log('🎉 Express.js startup successful!');
                process.exit(0);
            });
            
            req.on('error', (err) => {
                console.log(`⚠️  Server started but not responding: ${err.message}`);
                console.log('🎉 Express.js startup completed (with warnings)');
                process.exit(0);
            });
            
            req.on('timeout', () => {
                console.log('⚠️  Server response timeout');
                console.log('🎉 Express.js startup completed (with warnings)');
                process.exit(0);
            });
            
            req.end();
        }, 2000);
    }
});

server.stderr.on('data', (data) => {
    const output = data.toString();
    console.log(`📥 ERROR: ${output.trim()}`);
    
    // Don't exit on warnings, only on critical errors
    if (output.includes('EADDRINUSE') || 
        output.includes('Cannot find module') ||
        output.includes('SyntaxError')) {
        console.log('❌ Critical startup error detected');
        process.exit(1);
    }
});

server.on('close', (code) => {
    clearTimeout(startupTimeout);
    if (code === 0) {
        console.log('✅ Server process completed successfully');
    } else {
        console.log(`❌ Server process exited with code ${code}`);
        process.exit(1);
    }
});

// Handle script termination
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down server...');
    server.kill('SIGTERM');
    setTimeout(() => {
        server.kill('SIGKILL');
        process.exit(0);
    }, 5000);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down server...');
    server.kill('SIGTERM');
    setTimeout(() => {
        server.kill('SIGKILL');
        process.exit(0);
    }, 5000);
});
EOF

# Run the startup script
if timeout 15s node start_server.js; then
    check_result "Express.js Startup" "PASS" "Server started successfully"
    
    # Additional connectivity test
    sleep 2
    if curl -s --max-time 5 http://localhost:3000 >/dev/null 2>&1; then
        check_result "Server Connectivity" "PASS" "Server responding to requests"
    else
        check_result "Server Connectivity" "FAIL" "Server not responding to HTTP requests"
    fi
else
    check_result "Express.js Startup" "FAIL" "Server startup failed or timed out"
fi

# Cleanup
rm -f start_server.js

# Phase 7: Process Information
echo -e "\n${YELLOW}🔍 Phase 7: Server Process Information${NC}"

EXPRESS_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null || echo "")
if [ -n "$EXPRESS_PID" ]; then
    PROCESS_INFO=$(ps -p "$EXPRESS_PID" -o pid,ppid,cmd --no-headers 2>/dev/null || echo "Process info unavailable")
    check_result "Server Process" "PASS" "PID: $EXPRESS_PID"
    log "Process info: $PROCESS_INFO"
else
    check_result "Server Process" "FAIL" "No process found on port 3000"
fi

# Generate summary report
echo -e "\n${BLUE}📊 Express.js Startup Summary${NC}"
echo -e "${BLUE}==============================${NC}"
echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"

# Create detailed report
cat > "$REPORT_FILE" << EOF
# Express.js Startup Report - Task 3

**Generated**: $(date)  
**Status**: $([ $FAILED_CHECKS -eq 0 ] && echo "✅ SUCCESS" || echo "❌ FAILED")  
**Pass Rate**: $((PASSED_CHECKS * 100 / TOTAL_CHECKS))%

## Summary
- Total Checks: $TOTAL_CHECKS
- Passed: $PASSED_CHECKS
- Failed: $FAILED_CHECKS

## Environment Information
- Node.js Version: ${NODE_VERSION:-"Not Available"}
- NPM Version: ${NPM_VERSION:-"Not Available"}
- App File Used: ${APP_FILE:-"Not Determined"}

## Server Information
- Port: 3000
- Process ID: ${EXPRESS_PID:-"Not Running"}
- Base URL: http://localhost:3000

## Dependencies
- MongoDB Connection: $([ -n "$MONGODB_CONTAINER" ] && echo "✅ Available" || echo "❌ Not Available")
- Node Modules: $([ -d "node_modules" ] && echo "✅ Installed" || echo "❌ Missing")

## Next Steps
$([ $FAILED_CHECKS -eq 0 ] && echo "✅ Ready for Task 4: Express.js BDD Testing" || echo "❌ Fix startup issues before proceeding")

## Troubleshooting
$([ $FAILED_CHECKS -gt 0 ] && echo "- Check MongoDB connectivity
- Verify package.json and dependencies
- Ensure port 3000 is available
- Check application logs for errors")

---
*Generated by Express.js Startup Script*
EOF

log "Report generated: $REPORT_FILE"

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}✅ Express.js startup completed successfully!${NC}"
    echo -e "${GREEN}🔄 Ready for Task 4: Express.js BDD Testing${NC}"
    echo -e "${BLUE}📍 Server running at: http://localhost:3000${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Express.js startup failed!${NC}"
    echo -e "${RED}🛠️  Please fix the issues before proceeding${NC}"
    exit 1
fi