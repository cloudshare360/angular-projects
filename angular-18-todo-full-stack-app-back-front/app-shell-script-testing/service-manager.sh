#!/bin/bash

# Service Manager for Angular Todo Full-Stack Application
# Purpose: Intelligent service management with status checking and unattended startup
# Date: October 2, 2025

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXPRESS_DIR="$PROJECT_ROOT/Back-End/express-rest-todo-api"
LOG_FILE="$SCRIPT_DIR/reports/service-manager.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Ensure reports directory exists
mkdir -p "$SCRIPT_DIR/reports"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo -e "${CYAN}🔧 Angular Todo Service Manager${NC}"
echo -e "${CYAN}================================${NC}"

# Function to check if MongoDB is running
check_mongodb() {
    log "Checking MongoDB status..."
    
    if sudo docker ps | grep -q "angular-todo-mongodb"; then
        echo -e "${GREEN}✅ MongoDB: RUNNING${NC}"
        
        # Test MongoDB connection
        if sudo docker exec angular-todo-mongodb mongosh --username admin --password todopassword123 --authenticationDatabase admin --eval "db.runCommand({ping: 1})" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB: CONNECTION OK${NC}"
            return 0
        else
            echo -e "${RED}❌ MongoDB: CONNECTION FAILED${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ MongoDB: NOT RUNNING${NC}"
        return 1
    fi
}

# Function to start MongoDB
start_mongodb() {
    log "Starting MongoDB containers..."
    
    cd "$PROJECT_ROOT/data-base/mongodb"
    
    if sudo docker-compose up -d; then
        echo -e "${GREEN}✅ MongoDB containers started${NC}"
        
        # Wait for MongoDB to be ready
        echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
        for i in {1..30}; do
            if sudo docker exec angular-todo-mongodb mongosh --username admin --password todopassword123 --authenticationDatabase admin --eval "db.runCommand({ping: 1})" >/dev/null 2>&1; then
                echo -e "${GREEN}✅ MongoDB is ready after ${i}s${NC}"
                return 0
            fi
            sleep 1
        done
        
        echo -e "${RED}❌ MongoDB failed to become ready within 30s${NC}"
        return 1
    else
        echo -e "${RED}❌ Failed to start MongoDB containers${NC}"
        return 1
    fi
}

# Function to check if Express.js is running
check_expressjs() {
    log "Checking Express.js server status..."
    
    # Check if process is running
    if ps aux | grep "node src/app.js" | grep -v grep >/dev/null; then
        echo -e "${GREEN}✅ Express.js: PROCESS RUNNING${NC}"
        
        # Check if port 3000 is responding
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Express.js: API RESPONDING${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Express.js: PROCESS RUNNING BUT API NOT RESPONDING${NC}"
            # Kill the non-responsive process
            pkill -f "node src/app.js" 2>/dev/null || true
            return 1
        fi
    else
        echo -e "${RED}❌ Express.js: NOT RUNNING${NC}"
        return 1
    fi
}

# Function to kill Express.js processes
kill_expressjs() {
    log "Killing any existing Express.js processes..."
    
    # Kill node processes
    pkill -f "node src/app.js" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    
    # Kill any process using port 3000
    if sudo lsof -ti:3000 >/dev/null 2>&1; then
        sudo kill -9 $(sudo lsof -ti:3000) 2>/dev/null || true
        echo -e "${GREEN}✅ Cleared port 3000${NC}"
    fi
    
    sleep 2
}

# Function to start Express.js server
start_expressjs() {
    log "Starting Express.js server..."
    
    cd "$EXPRESS_DIR"
    
    # Ensure we're in the right directory
    if [ ! -f "src/app.js" ]; then
        echo -e "${RED}❌ Express.js app.js not found in $EXPRESS_DIR/src/${NC}"
        return 1
    fi
    
    # Start server in background with proper output redirection
    echo -e "${YELLOW}⏳ Starting Express.js server in unattended mode...${NC}"
    
    nohup node src/app.js > "$SCRIPT_DIR/reports/expressjs.log" 2>&1 &
    EXPRESS_PID=$!
    
    echo "Express.js PID: $EXPRESS_PID" >> "$LOG_FILE"
    
    # Wait for server to start
    echo -e "${YELLOW}⏳ Waiting for Express.js to be ready...${NC}"
    for i in {1..20}; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Express.js is ready after ${i}s${NC}"
            echo -e "${GREEN}✅ Health endpoint: http://localhost:3000/health${NC}"
            echo -e "${GREEN}✅ API docs: http://localhost:3000/api-docs${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Express.js failed to start within 20s${NC}"
    echo -e "${YELLOW}📋 Check logs: $SCRIPT_DIR/reports/expressjs.log${NC}"
    return 1
}

# Function to display service status
show_status() {
    echo -e "\n${BLUE}📊 Service Status Summary${NC}"
    echo -e "${BLUE}=========================${NC}"
    
    # MongoDB Status
    if check_mongodb >/dev/null 2>&1; then
        echo -e "MongoDB: ${GREEN}✅ RUNNING & CONNECTED${NC}"
    else
        echo -e "MongoDB: ${RED}❌ NOT RUNNING${NC}"
    fi
    
    # Express.js Status
    if check_expressjs >/dev/null 2>&1; then
        echo -e "Express.js: ${GREEN}✅ RUNNING & RESPONDING${NC}"
        
        # Get health status
        HEALTH_STATUS=$(curl -s http://localhost:3000/health | jq -r '.data.message' 2>/dev/null || echo "Unknown")
        echo -e "API Health: ${GREEN}$HEALTH_STATUS${NC}"
    else
        echo -e "Express.js: ${RED}❌ NOT RUNNING${NC}"
    fi
    
    echo -e "\n${BLUE}🔗 Service URLs:${NC}"
    echo -e "  MongoDB UI: ${CYAN}http://localhost:8081${NC}"
    echo -e "  API Health: ${CYAN}http://localhost:3000/health${NC}"
    echo -e "  API Docs:   ${CYAN}http://localhost:3000/api-docs${NC}"
}

# Main execution logic
main() {
    case "$1" in
        "status")
            show_status
            ;;
        "start")
            echo -e "${CYAN}🚀 Starting all services...${NC}\n"
            
            # Start MongoDB if not running
            if ! check_mongodb; then
                start_mongodb || exit 1
            fi
            
            # Start Express.js if not running
            if ! check_expressjs; then
                kill_expressjs
                start_expressjs || exit 1
            fi
            
            echo -e "\n${GREEN}🎉 All services started successfully!${NC}"
            show_status
            ;;
        "stop")
            echo -e "${CYAN}🛑 Stopping all services...${NC}\n"
            
            # Stop Express.js
            kill_expressjs
            echo -e "${GREEN}✅ Express.js stopped${NC}"
            
            # Stop MongoDB (optional - usually keep running)
            if [ "$2" = "--include-mongodb" ]; then
                cd "$PROJECT_ROOT/data-base/mongodb"
                sudo docker-compose down
                echo -e "${GREEN}✅ MongoDB stopped${NC}"
            else
                echo -e "${YELLOW}ℹ️  MongoDB kept running (use --include-mongodb to stop)${NC}"
            fi
            ;;
        "restart")
            echo -e "${CYAN}🔄 Restarting services...${NC}\n"
            
            # Stop Express.js
            kill_expressjs
            
            # Start services
            $0 start
            ;;
        "test")
            echo -e "${CYAN}🧪 Testing service connectivity...${NC}\n"
            
            # Test MongoDB
            if check_mongodb; then
                echo -e "${GREEN}✅ MongoDB test passed${NC}"
            else
                echo -e "${RED}❌ MongoDB test failed${NC}"
                exit 1
            fi
            
            # Test Express.js
            if check_expressjs; then
                echo -e "${GREEN}✅ Express.js test passed${NC}"
                
                # Test API endpoint
                HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
                if echo "$HEALTH_RESPONSE" | grep -q '"success":true'; then
                    echo -e "${GREEN}✅ API health check passed${NC}"
                else
                    echo -e "${RED}❌ API health check failed${NC}"
                    exit 1
                fi
            else
                echo -e "${RED}❌ Express.js test failed${NC}"
                exit 1
            fi
            
            echo -e "\n${GREEN}🎉 All connectivity tests passed!${NC}"
            ;;
        *)
            echo -e "${YELLOW}📖 Angular Todo Service Manager${NC}"
            echo ""
            echo -e "${WHITE}Usage:${NC}"
            echo "  $0 status                    # Show current service status"
            echo "  $0 start                     # Start all services (unattended)"
            echo "  $0 stop [--include-mongodb]  # Stop services"
            echo "  $0 restart                   # Restart all services"
            echo "  $0 test                      # Test service connectivity"
            echo ""
            echo -e "${WHITE}Examples:${NC}"
            echo "  $0 start                     # Start MongoDB + Express.js"
            echo "  $0 status                    # Check what's running"
            echo "  $0 test                      # Verify everything works"
            echo "  $0 stop                      # Stop Express.js only"
            echo "  $0 stop --include-mongodb    # Stop everything"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"