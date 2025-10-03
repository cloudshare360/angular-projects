#!/bin/bash

# Development startup script for Angular Todo Application
# PROPER STARTUP SEQUENCE: Database → Backend → Frontend
# This script ensures services start in the correct order for E2E testing compatibility

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_phase() {
    echo -e "${PURPLE}[PHASE]${NC} $1"
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

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local health_check=$2
    local timeout=${3:-60}
    local counter=0
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $counter -lt $timeout ]; do
        if eval "$health_check" > /dev/null 2>&1; then
            print_success "✅ $service_name is ready!"
            return 0
        fi
        sleep 2
        counter=$((counter + 2))
        print_status "Waiting for $service_name... (${counter}/${timeout}s)"
    done
    
    print_warning "⚠️ $service_name took longer than expected to start"
    return 1
}

# Function to cleanup background processes on script exit
cleanup() {
    print_status "🧹 Cleaning up background processes..."
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

# ========================================
# PHASE 1: DATABASE LAYER STARTUP
# ========================================
print_phase "🗄️ PHASE 1: Starting Database Layer (MongoDB + MongoDB Express)"

cd data-base/mongodb
if [ -f "docker-compose.yml" ]; then
    # Check if containers are already running
    if ! $DOCKER_COMPOSE_CMD ps | grep -q "angular-todo-mongodb.*Up"; then
        print_status "Starting MongoDB containers..."
        $DOCKER_COMPOSE_CMD up -d
        print_success "✓ MongoDB containers started"
        
        # Wait for MongoDB to be ready
        wait_for_service "MongoDB" "$DOCKER_CMD exec angular-todo-mongodb mongosh --quiet --eval 'db.adminCommand(\"ping\")'" 60
        
        # Wait for MongoDB Express UI (optional)
        wait_for_service "MongoDB Express UI" "curl -s http://localhost:8081" 30
        
    else
        print_success "✓ MongoDB is already running"
        # Still verify connection
        wait_for_service "MongoDB" "$DOCKER_CMD exec angular-todo-mongodb mongosh --quiet --eval 'db.adminCommand(\"ping\")'" 30
    fi
else
    print_error "MongoDB docker-compose.yml not found in data-base/mongodb/"
    exit 1
fi
cd ../..

print_success "🎉 PHASE 1 COMPLETE: Database layer is ready"
print_status "📊 Database services available:"
print_status "   • MongoDB: localhost:27017"
print_status "   • MongoDB Express UI: http://localhost:8081"

# ========================================
# PHASE 2: BACKEND API STARTUP
# ========================================
print_phase "🚀 PHASE 2: Starting Backend API (Express.js)"

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

# Start backend API server
print_status "Starting Express.js API server..."
npm start &
BACKEND_PID=$!
cd ../..

# Wait for backend to be ready
wait_for_service "Express.js API" "curl -s http://localhost:3000/health" 60

print_success "🎉 PHASE 2 COMPLETE: Backend API is ready"
print_status "📊 Backend services available:"
print_status "   • API Server: http://localhost:3000"
print_status "   • API Documentation: http://localhost:3000/api-docs"
print_status "   • Health Check: http://localhost:3000/health"

# ========================================
# PHASE 3: FRONTEND APPLICATION STARTUP  
# ========================================
print_phase "🎨 PHASE 3: Starting Frontend Application (Angular 18)"

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

# Check if Angular CLI is available
if ! command -v ng &> /dev/null; then
    if [ -f "node_modules/.bin/ng" ]; then
        print_status "Using local Angular CLI"
        NG_CMD="./node_modules/.bin/ng"
    else
        print_error "Angular CLI not found. Installing locally..."
        npm install @angular/cli
        NG_CMD="./node_modules/.bin/ng"
    fi
else
    NG_CMD="ng"
    print_success "✓ Angular CLI is available"
fi

# Start Angular development server
print_status "Starting Angular development server..."
print_status "This may take 15-30 seconds for initial compilation..."
$NG_CMD serve --proxy-config proxy.conf.json --host 0.0.0.0 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to be ready (Angular takes longer to compile)
wait_for_service "Angular Application" "curl -s http://localhost:4200" 120

print_success "🎉 PHASE 3 COMPLETE: Frontend application is ready"
print_status "📊 Frontend services available:"
print_status "   • Angular Application: http://localhost:4200"
print_status "   • Development Server: Live reload enabled"

# ========================================
# FINAL HEALTH CHECK & SUMMARY
# ========================================
print_phase "✅ FINAL HEALTH CHECK: Verifying all services"

# Comprehensive health check
all_healthy=true

# Check MongoDB
if $DOCKER_CMD exec angular-todo-mongodb mongosh --quiet --eval 'db.adminCommand("ping")' > /dev/null 2>&1; then
    print_success "✅ MongoDB: Healthy"
else
    print_error "❌ MongoDB: Not responding"
    all_healthy=false
fi

# Check MongoDB Express
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    print_success "✅ MongoDB Express: Healthy"
else
    print_warning "⚠️ MongoDB Express: Not responding (optional service)"
fi

# Check Backend API
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    print_success "✅ Express.js API: Healthy"
else
    print_error "❌ Express.js API: Not responding"
    all_healthy=false
fi

# Check Frontend
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    print_success "✅ Angular Application: Healthy"
else
    print_error "❌ Angular Application: Not responding"
    all_healthy=false
fi

# ========================================
# E2E TESTING READINESS CHECK
# ========================================
if [ "$all_healthy" = true ]; then
    print_success "🎉 ALL SERVICES ARE HEALTHY AND READY!"
    print_status ""
    print_status "🚀 APPLICATION STACK STATUS:"
    print_status "   ✅ Database Layer:    MongoDB + MongoDB Express"
    print_status "   ✅ Backend Layer:     Express.js API"
    print_status "   ✅ Frontend Layer:    Angular 18 Application"
    print_status ""
    print_status "🌐 ACCESS POINTS:"
    print_status "   📱 Application:      http://localhost:4200"
    print_status "   🔌 API:              http://localhost:3000"
    print_status "   📊 API Docs:         http://localhost:3000/api-docs"
    print_status "   🗄️ Database UI:      http://localhost:8081"
    print_status ""
    print_status "🧪 E2E TESTING READY:"
    print_status "   All services are running in the correct sequence"
    print_status "   Ready for Playwright E2E testing execution"
    print_status ""
    print_status "🎯 NEXT STEPS:"
    print_status "   • Test the application at http://localhost:4200"
    print_status "   • Run E2E tests: cd Front-End/angular-18-todo-app && npm run test:e2e"
    print_status "   • Run comprehensive tests: ./run-e2e-tests.sh"
    print_status ""
    print_success "🎊 DEVELOPMENT ENVIRONMENT IS READY FOR USE!"
else
    print_error "❌ SOME SERVICES ARE NOT HEALTHY"
    print_status "Please check the error messages above and try again."
    print_status "You may need to:"
    print_status "   • Check Docker containers: docker ps"
    print_status "   • Check process logs: pm2 logs or check terminal output"
    print_status "   • Restart individual services manually"
    exit 1
fi

# Keep services running
print_status ""
print_status "🔄 SERVICES ARE RUNNING IN BACKGROUND"
print_status "📝 Process IDs:"
print_status "   • Backend PID: $BACKEND_PID"
print_status "   • Frontend PID: $FRONTEND_PID"
print_status ""
print_status "🛑 TO STOP ALL SERVICES:"
print_status "   • Press Ctrl+C to stop this script"
print_status "   • Or run: ./stop-dev.sh"
print_status ""
print_status "⏳ Keeping services running... Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
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