#!/bin/bash

# Development startup script for Angular Todo Application
# This script starts both the Express API backend and Angular frontend simultaneously

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

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 1
    else
        return 0
    fi
}

# Function to cleanup background processes on script exit
cleanup() {
    print_status "Cleaning up background processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend process stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend process stopped"
    fi
    
    # Ask user if they want to stop MongoDB containers
    echo ""
    read -p "Do you want to stop MongoDB containers? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping MongoDB containers..."
        cd data-base/mongodb 2>/dev/null && $DOCKER_COMPOSE_CMD down 2>/dev/null && cd ../.. || true
        print_status "MongoDB containers stopped"
    else
        print_status "MongoDB containers left running - use 'cd data-base/mongodb && $DOCKER_COMPOSE_CMD down' to stop them manually"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

print_status "🚀 Starting Angular Todo Application Development Environment"
print_status "============================================================"

# Check if we're in the right directory
if [ ! -f "PROJECT_STATUS.md" ]; then
    print_error "Please run this script from the angular-todo-application root directory"
    exit 1
fi

# Check required directories
if [ ! -d "Back-End/express-rest-todo-api" ]; then
    print_error "Backend directory not found: Back-End/express-rest-todo-api"
    exit 1
fi

if [ ! -d "Front-End/angular-18-todo-app" ]; then
    print_error "Frontend directory not found: Front-End/angular-18-todo-app"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm to continue."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker to continue."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose to continue."
    exit 1
fi

# Check Docker permissions and set DOCKER_CMD
if docker ps > /dev/null 2>&1; then
    DOCKER_CMD="docker"
    DOCKER_COMPOSE_CMD="docker-compose"
    print_status "Docker permissions: OK"
elif sudo docker ps > /dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
    DOCKER_COMPOSE_CMD="sudo docker-compose"
    print_warning "Docker requires sudo - will use sudo for Docker commands"
else
    print_error "Cannot access Docker. Please check Docker installation and permissions."
    print_status "You may need to:"
    print_status "1. Add your user to docker group: sudo usermod -aG docker \$USER"
    print_status "2. Log out and log back in, or run: newgrp docker"
    print_status "3. Or run this script with sudo"
    exit 1
fi

print_success "✓ Prerequisites check passed"

# Check ports availability
print_status "Checking port availability..."

if ! check_port 3000; then
    print_warning "Port 3000 (backend) is already in use"
    read -p "Do you want to kill the process using port 3000? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        print_success "Freed port 3000"
    else
        print_error "Cannot start backend on port 3000. Please free the port manually."
        exit 1
    fi
fi

if ! check_port 4200; then
    print_warning "Port 4200 (frontend) is already in use"
    read -p "Do you want to kill the process using port 4200? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:4200 | xargs kill -9 2>/dev/null || true
        print_success "Freed port 4200"
    else
        print_error "Cannot start frontend on port 4200. Please free the port manually."
        exit 1
    fi
fi

print_success "✓ Ports are available"

# Start MongoDB if not running
print_status "Starting MongoDB..."
cd data-base/mongodb
if [ -f "docker-compose.yml" ]; then
    # Check if containers are already running
    if ! $DOCKER_COMPOSE_CMD ps | grep -q "mongodb.*Up"; then
        print_status "Starting MongoDB containers..."
        $DOCKER_COMPOSE_CMD up -d
        print_success "✓ MongoDB containers started"
        
        # Wait for MongoDB to be ready
        print_status "Waiting for MongoDB to be ready..."
        sleep 5
        
        # Check MongoDB connection
        timeout=30
        counter=0
        while [ $counter -lt $timeout ]; do
            if $DOCKER_COMPOSE_CMD exec -T mongodb mongosh --quiet --eval "db.runCommand('ping')" > /dev/null 2>&1; then
                print_success "✓ MongoDB is ready and accepting connections"
                break
            fi
            sleep 2
            counter=$((counter + 2))
            print_status "Waiting for MongoDB... ($counter/${timeout}s)"
        done
        
        if [ $counter -ge $timeout ]; then
            print_warning "MongoDB took longer than expected to start, but continuing..."
        fi
    else
        print_success "✓ MongoDB is already running"
    fi
else
    print_error "MongoDB docker-compose.yml not found in data-base/mongodb/"
    exit 1
fi
cd ../..

# Install backend dependencies if needed
print_status "Checking backend dependencies..."
cd Back-End/express-rest-todo-api
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
    print_success "✓ Backend dependencies installed"
else
    print_success "✓ Backend dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found in Back-End/express-rest-todo-api/"
    print_status "Please create a .env file with the required configuration."
    print_status "You can use the following template:"
    print_status ""
    print_status "MONGODB_URI=mongodb://admin:todopassword123@localhost:27017/tododb?authSource=admin"
    print_status "JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production"
    print_status "JWT_EXPIRE=24h"
    print_status "PORT=3000"
    print_status "NODE_ENV=development"
    print_status "FRONTEND_URL=http://localhost:4200"
    print_status ""
    exit 1
fi

# Start backend server
print_status "Starting Express API backend on port 3000..."
npm run dev > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..
print_success "✓ Backend server started (PID: $BACKEND_PID)"

# Wait for backend to be ready
print_status "Waiting for backend API to be ready..."
sleep 3
timeout=30
counter=0
while [ $counter -lt $timeout ]; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1 || curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "✓ Backend API is ready and responding"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    print_status "Waiting for backend API... ($counter/${timeout}s)"
done

if [ $counter -ge $timeout ]; then
    print_warning "Backend API took longer than expected to start, but continuing..."
    print_status "Check logs/backend.log if you encounter issues"
fi

# Install frontend dependencies if needed
print_status "Checking frontend dependencies..."
cd Front-End/angular-18-todo-app
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    print_success "✓ Frontend dependencies installed"
else
    print_success "✓ Frontend dependencies already installed"
fi

# Start frontend server
print_status "Starting Angular frontend on port 4200..."
npm run start:dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..
print_success "✓ Frontend server started (PID: $FRONTEND_PID)"

# Create logs directory if it doesn't exist
mkdir -p logs

print_status "============================================================"
print_success "🎉 Development environment is ready!"
print_status ""
print_status "Services running:"
print_status "  📊 MongoDB:      http://localhost:27017"
print_status "  �️  Mongo UI:     http://localhost:8081 (admin/admin123)"
print_status "  �🚀 Backend API:  http://localhost:3000"
print_status "  🌐 Frontend:     http://localhost:4200"
print_status ""
print_status "Logs are being written to:"
print_status "  Backend:  logs/backend.log"
print_status "  Frontend: logs/frontend.log"
print_status ""
print_status "API Documentation: http://localhost:3000/api-docs"
print_status ""
print_status "Press Ctrl+C to stop all services"
print_status "============================================================"

# Monitor both processes
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend process died unexpectedly"
        print_status "Check logs/backend.log for details"
        cleanup
    fi
    
    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend process died unexpectedly"
        print_status "Check logs/frontend.log for details"
        cleanup
    fi
    
    sleep 5
done