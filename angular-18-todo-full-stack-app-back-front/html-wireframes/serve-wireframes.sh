#!/bin/bash

# HTML Wireframes Web Server Script
# Serves the wireframes on a local web server for easy viewing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PORT=${1:-8080}
WIREFRAMES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         HTML WIREFRAMES WEB SERVER                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📂 Wireframes Directory: ${WIREFRAMES_DIR}${NC}"
echo -e "${YELLOW}🌐 Server Port: ${PORT}${NC}"

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo -e "\n${GREEN}🐍 Starting Python 3 HTTP server...${NC}"
    cd "$WIREFRAMES_DIR"
    
    echo -e "${GREEN}✅ Server starting at: http://localhost:${PORT}${NC}"
    echo -e "${YELLOW}📋 Wireframes available at: http://localhost:${PORT}/index.html${NC}"
    echo -e "${YELLOW}⌨️  Press Ctrl+C to stop the server${NC}\n"
    
    # Open browser automatically
    if command -v xdg-open &> /dev/null; then
        sleep 2 && xdg-open "http://localhost:${PORT}" &
    elif command -v open &> /dev/null; then
        sleep 2 && open "http://localhost:${PORT}" &
    fi
    
    python3 -m http.server "$PORT"
    
elif command -v python &> /dev/null; then
    echo -e "\n${GREEN}🐍 Starting Python 2 HTTP server...${NC}"
    cd "$WIREFRAMES_DIR"
    
    echo -e "${GREEN}✅ Server starting at: http://localhost:${PORT}${NC}"
    echo -e "${YELLOW}📋 Wireframes available at: http://localhost:${PORT}/index.html${NC}"
    echo -e "${YELLOW}⌨️  Press Ctrl+C to stop the server${NC}\n"
    
    # Open browser automatically
    if command -v xdg-open &> /dev/null; then
        sleep 2 && xdg-open "http://localhost:${PORT}" &
    elif command -v open &> /dev/null; then
        sleep 2 && open "http://localhost:${PORT}" &
    fi
    
    python -m SimpleHTTPServer "$PORT"
    
elif command -v node &> /dev/null; then
    echo -e "\n${GREEN}📦 Node.js detected, using npx http-server...${NC}"
    cd "$WIREFRAMES_DIR"
    
    echo -e "${GREEN}✅ Server starting at: http://localhost:${PORT}${NC}"
    echo -e "${YELLOW}📋 Wireframes available at: http://localhost:${PORT}/index.html${NC}"
    echo -e "${YELLOW}⌨️  Press Ctrl+C to stop the server${NC}\n"
    
    # Install http-server if not available
    if ! command -v http-server &> /dev/null; then
        echo -e "${YELLOW}📦 Installing http-server...${NC}"
        npm install -g http-server
    fi
    
    # Open browser automatically
    if command -v xdg-open &> /dev/null; then
        sleep 2 && xdg-open "http://localhost:${PORT}" &
    elif command -v open &> /dev/null; then
        sleep 2 && open "http://localhost:${PORT}" &
    fi
    
    npx http-server -p "$PORT" -o
    
else
    echo -e "\n${RED}❌ No suitable web server found!${NC}"
    echo -e "${YELLOW}Please install one of the following:${NC}"
    echo -e "  • Python 3: sudo apt-get install python3"
    echo -e "  • Python 2: sudo apt-get install python"
    echo -e "  • Node.js: sudo apt-get install nodejs npm"
    echo -e "\n${YELLOW}Alternative: Open the following file in your browser:${NC}"
    echo -e "${GREEN}file://${WIREFRAMES_DIR}/index.html${NC}"
    exit 1
fi