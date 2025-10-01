#!/bin/bash

# Stop development services script for Angular Todo Application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🛑 Stopping Angular Todo Application Development Environment"
print_status "============================================================"

# Check Docker permissions and set DOCKER_CMD
if docker ps > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif sudo docker ps > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="sudo docker-compose"
else
    print_warning "Cannot access Docker - skipping container cleanup"
    DOCKER_COMPOSE_CMD=""
fi

# Stop processes using ports
print_status "Stopping processes on development ports..."

# Stop process on port 3000 (backend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Stopping backend server on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    print_success "✓ Backend server stopped"
else
    print_status "No process found on port 3000"
fi

# Stop process on port 4200 (frontend)
if lsof -Pi :4200 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_status "Stopping frontend server on port 4200..."
    lsof -ti:4200 | xargs kill -9 2>/dev/null || true
    print_success "✓ Frontend server stopped"
else
    print_status "No process found on port 4200"
fi

# Stop MongoDB containers
if [ ! -z "$DOCKER_COMPOSE_CMD" ]; then
    print_status "Stopping MongoDB containers..."
    cd data-base/mongodb
    if [ -f "docker-compose.yml" ]; then
        $DOCKER_COMPOSE_CMD down
        print_success "✓ MongoDB containers stopped"
    else
        print_warning "docker-compose.yml not found"
    fi
    cd ../..
fi

print_status "============================================================"
print_success "🎉 All development services stopped!"
print_status ""
print_status "To start the development environment again, run:"
print_status "  ./start-dev.sh"
print_status "============================================================"