#!/bin/bash

# Wireframes Demo Server Startup Script
# Angular 18 Todo Full-Stack Application - Wireframes & Design

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Angular Todo App - Wireframes Demo Server${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 is required but not installed.${NC}"
    exit 1
fi

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8080 is already in use. Stopping existing server...${NC}"
    pkill -f "http.server.*8080" || true
    sleep 2
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📂 Starting server from: ${SCRIPT_DIR}${NC}"

# Start the HTTP server
echo -e "${YELLOW}🚀 Starting wireframes demo server on port 8080...${NC}"
python3 -m http.server 8080 --bind 0.0.0.0 > wireframes-server.log 2>&1 &
SERVER_PID=$!

# Save the PID for later cleanup
echo $SERVER_PID > .wireframes-server.pid

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Server started successfully!${NC}"
    echo -e "${GREEN}🌐 Demo URL: http://localhost:8080/${NC}"
    echo -e "${GREEN}📊 Server PID: $SERVER_PID${NC}"
    echo ""
    echo -e "${BLUE}🎮 How to Use the Demo:${NC}"
    echo -e "   1. Open browser: http://localhost:8080/"
    echo -e "   2. Click '🚀 Start Interactive Demo'"
    echo -e "   3. Use login form to navigate (User/Admin roles)"
    echo -e "   4. Explore interactive wireframes"
    echo ""
    echo -e "${YELLOW}📝 Server Log: wireframes-server.log${NC}"
    echo -e "${YELLOW}🛑 To stop: ./stop-wireframes-demo.sh${NC}"
    echo ""
    
    # Try to open browser if available
    if command -v chromium-browser &> /dev/null; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        chromium-browser http://localhost:8080/ &>/dev/null &
    elif command -v firefox &> /dev/null; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        firefox http://localhost:8080/ &>/dev/null &
    elif command -v google-chrome &> /dev/null; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        google-chrome http://localhost:8080/ &>/dev/null &
    else
        echo -e "${YELLOW}⚠️  No browser found. Please open http://localhost:8080/ manually${NC}"
    fi
    
else
    echo -e "${RED}❌ Failed to start server. Check wireframes-server.log for details.${NC}"
    exit 1
fi