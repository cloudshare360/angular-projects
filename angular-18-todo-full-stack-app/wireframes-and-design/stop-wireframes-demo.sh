#!/bin/bash

# Wireframes Demo Server Stop Script
# Angular 18 Todo Full-Stack Application - Wireframes & Design

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Wireframes Demo Server${NC}"
echo -e "${BLUE}==================================${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if PID file exists
if [ -f ".wireframes-server.pid" ]; then
    SERVER_PID=$(cat .wireframes-server.pid)
    
    # Check if process is still running
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo -e "${YELLOW}🔄 Stopping server with PID: $SERVER_PID${NC}"
        kill $SERVER_PID
        
        # Wait for graceful shutdown
        sleep 2
        
        # Force kill if still running
        if kill -0 $SERVER_PID 2>/dev/null; then
            echo -e "${YELLOW}⚡ Force stopping server...${NC}"
            kill -9 $SERVER_PID 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✅ Server stopped successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Server was not running (PID: $SERVER_PID)${NC}"
    fi
    
    # Clean up PID file
    rm -f .wireframes-server.pid
else
    echo -e "${YELLOW}⚠️  No PID file found. Attempting to kill any http.server on port 8080...${NC}"
fi

# Kill any remaining http.server processes on port 8080
pkill -f "http.server.*8080" 2>/dev/null && echo -e "${GREEN}✅ Cleaned up any remaining server processes${NC}" || true

# Check if port is free
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}⚠️  Port 8080 is still in use by another process${NC}"
    echo -e "${BLUE}💡 You may need to manually kill the process using port 8080${NC}"
else
    echo -e "${GREEN}✅ Port 8080 is now free${NC}"
fi

# Clean up log file if it exists
if [ -f "wireframes-server.log" ]; then
    echo -e "${BLUE}📝 Server log saved as: wireframes-server.log${NC}"
    echo -e "${BLUE}💡 To view log: cat wireframes-server.log${NC}"
fi

echo -e "${GREEN}🎯 Wireframes demo server shutdown complete${NC}"