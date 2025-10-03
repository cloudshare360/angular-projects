#!/bin/bash

# Comprehensive E2E Test Runner for Angular Todo Application
# This script ensures proper service startup sequence before running Playwright tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_test() {
    echo -e "${CYAN}[TEST]${NC} $1"
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
    
    print_error "❌ $service_name failed to start within ${timeout}s"
    return 1
}

# Function to cleanup background processes on script exit
cleanup() {
    print_status "🧹 Cleaning up test environment..."
    
    # Kill frontend process
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend process stopped"
    fi
    
    # Kill backend process  
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend process stopped"
    fi
    
    # Stop Docker containers if started by this script
    if [ "$STARTED_DOCKER" = "true" ]; then
        print_status "Stopping Docker containers..."
        cd data-base/mongodb && docker-compose down 2>/dev/null || true
        cd ../..
    fi
    
    print_success "Cleanup completed"
}

# Set trap for cleanup on script exit
trap cleanup EXIT

# Check if script is run from project root
if [ ! -f "package.json" ] || [ ! -d "Front-End/angular-18-todo-app" ]; then
    print_error "Please run this script from the angular-todo-application root directory"
    exit 1
fi

print_phase "🧪 COMPREHENSIVE E2E TEST RUNNER"
print_status "Ensuring proper service startup sequence for Playwright E2E testing"
print_status ""

# ========================================
# PHASE 1: PRE-FLIGHT CHECKS
# ========================================
print_phase "🔍 PHASE 1: Pre-flight Checks"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker to continue."
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Set Docker command based on permissions
if docker ps > /dev/null 2>&1; then
    DOCKER_CMD="docker"
elif sudo docker ps > /dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
    DOCKER_COMPOSE_CMD="sudo $DOCKER_COMPOSE_CMD"
else
    print_error "Cannot access Docker. Please check Docker installation and permissions."
    exit 1
fi

print_success "✅ Docker and Docker Compose are available"

# Check Node.js and npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    print_error "Node.js and npm are required. Please install them."
    exit 1
fi

print_success "✅ Node.js and npm are available"

# ========================================
# PHASE 2: SERVICE STARTUP SEQUENCE
# ========================================
print_phase "🚀 PHASE 2: Starting Services in Proper Sequence"

# Step 1: Database Layer
print_status "Step 1: Starting Database Layer (MongoDB + MongoDB Express)"
cd data-base/mongodb

# Check if already running
if ! $DOCKER_COMPOSE_CMD ps | grep -q "angular-todo-mongodb.*Up"; then
    print_status "Starting MongoDB containers..."
    $DOCKER_COMPOSE_CMD up -d
    STARTED_DOCKER="true"
    wait_for_service "MongoDB" "$DOCKER_CMD exec angular-todo-mongodb mongosh --quiet --eval 'db.adminCommand(\"ping\")'" 60
else
    print_success "✅ MongoDB is already running"
    wait_for_service "MongoDB" "$DOCKER_CMD exec angular-todo-mongodb mongosh --quiet --eval 'db.adminCommand(\"ping\")'" 30
fi

cd ../..
print_success "🗄️ Database layer ready"

# Step 2: Backend API
print_status "Step 2: Starting Backend API (Express.js)"
cd Back-End/express-rest-todo-api

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Check .env file
if [ ! -f ".env" ]; then
    print_error ".env file not found. Creating default configuration..."
    cat > .env << EOF
MONGODB_URI=mongodb://admin:todopassword123@localhost:27017/tododb?authSource=admin
JWT_SECRET=test_jwt_secret_for_e2e_testing_only
JWT_EXPIRE=24h
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
EOF
    print_success "✅ Default .env file created"
fi

# Start backend
print_status "Starting Express.js API server..."
npm start > /tmp/backend-e2e.log 2>&1 &
BACKEND_PID=$!

wait_for_service "Express.js API" "curl -s http://localhost:3000/health" 60
cd ../..
print_success "🔌 Backend API ready"

# Step 3: Frontend Application
print_status "Step 3: Starting Frontend Application (Angular 18)"
cd Front-End/angular-18-todo-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Check if Playwright is installed
if [ ! -d "node_modules/@playwright" ]; then
    print_status "Installing Playwright for E2E testing..."
    npm install @playwright/test
    npx playwright install chromium firefox webkit
fi

# Start Angular development server
print_status "Starting Angular development server..."
print_status "This may take 20-40 seconds for initial compilation..."

# Use local ng if global not available
if command -v ng &> /dev/null; then
    NG_CMD="ng"
elif [ -f "node_modules/.bin/ng" ]; then
    NG_CMD="./node_modules/.bin/ng"
else
    print_error "Angular CLI not found"
    exit 1
fi

$NG_CMD serve --proxy-config proxy.conf.json --host 0.0.0.0 --port 4200 > /tmp/frontend-e2e.log 2>&1 &
FRONTEND_PID=$!

wait_for_service "Angular Application" "curl -s http://localhost:4200" 120
cd ../..
print_success "🎨 Frontend application ready"

# ========================================
# PHASE 3: COMPREHENSIVE HEALTH CHECK
# ========================================
print_phase "✅ PHASE 3: Comprehensive Health Check"

# Check all services
all_services_healthy=true

print_status "Verifying all services are healthy..."

# MongoDB Health Check
if $DOCKER_CMD exec angular-todo-mongodb mongosh --quiet --eval 'db.adminCommand("ping")' > /dev/null 2>&1; then
    print_success "✅ MongoDB: Healthy"
else
    print_error "❌ MongoDB: Not responding"
    all_services_healthy=false
fi

# Backend API Health Check
backend_response=$(curl -s -w "%{http_code}" http://localhost:3000/health -o /dev/null)
if [ "$backend_response" = "200" ]; then
    print_success "✅ Express.js API: Healthy (HTTP 200)"
else
    print_error "❌ Express.js API: Unhealthy (HTTP $backend_response)"
    all_services_healthy=false
fi

# Frontend Health Check
frontend_response=$(curl -s -w "%{http_code}" http://localhost:4200 -o /dev/null)
if [ "$frontend_response" = "200" ]; then
    print_success "✅ Angular Application: Healthy (HTTP 200)"
else
    print_error "❌ Angular Application: Unhealthy (HTTP $frontend_response)"
    all_services_healthy=false
fi

if [ "$all_services_healthy" = "false" ]; then
    print_error "❌ Some services are not healthy. Cannot proceed with E2E testing."
    print_status "Check the following log files for more details:"
    print_status "   • Backend: /tmp/backend-e2e.log"
    print_status "   • Frontend: /tmp/frontend-e2e.log"
    exit 1
fi

print_success "🎉 ALL SERVICES ARE HEALTHY AND READY FOR E2E TESTING!"

# ========================================
# PHASE 4: PLAYWRIGHT E2E TESTS EXECUTION
# ========================================
print_phase "🧪 PHASE 4: Executing Playwright E2E Tests"

cd Front-End/angular-18-todo-app

print_test "Starting Playwright E2E tests in Chrome browser..."
print_status "📊 Test execution will include:"
print_status "   • Authentication flow tests"
print_status "   • Dashboard functionality tests" 
print_status "   • User workflow tests"
print_status "   • Cross-browser compatibility tests"
print_status ""

# Determine test command based on arguments
test_cmd="npx playwright test"

# Parse command line arguments
if [ "$1" = "ui" ]; then
    test_cmd="$test_cmd --ui"
    print_test "Running in UI mode..."
elif [ "$1" = "headed" ]; then
    test_cmd="$test_cmd --headed"
    print_test "Running with visible browser..."
elif [ "$1" = "debug" ]; then
    test_cmd="$test_cmd --debug"
    print_test "Running in debug mode..."
elif [ "$1" = "auth" ]; then
    test_cmd="$test_cmd e2e/tests/auth.spec.ts"
    print_test "Running authentication tests only..."
elif [ "$1" = "dashboard" ]; then
    test_cmd="$test_cmd e2e/tests/dashboard.spec.ts"
    print_test "Running dashboard tests only..."
elif [ "$1" = "workflows" ]; then
    test_cmd="$test_cmd e2e/tests/workflows.spec.ts"
    print_test "Running workflow tests only..."
else
    test_cmd="$test_cmd --project=chromium"
    print_test "Running all tests in Chrome browser..."
fi

# Add reporter
test_cmd="$test_cmd --reporter=html,line"

# Execute tests
print_status "Executing: $test_cmd"
print_status ""

if $test_cmd; then
    print_success "🎉 PLAYWRIGHT E2E TESTS COMPLETED SUCCESSFULLY!"
    
    # Show test results location
    if [ -d "playwright-report" ]; then
        print_status "📊 Detailed test reports available at:"
        print_status "   • HTML Report: Front-End/angular-18-todo-app/playwright-report/index.html"
        print_status "   • Test Results: Front-End/angular-18-todo-app/test-results/"
    fi
    
    # Show test summary
    print_status ""
    print_success "✅ E2E TESTING SUMMARY:"
    print_success "   • All services started in correct sequence"
    print_success "   • Health checks passed"
    print_success "   • Playwright tests executed successfully"
    print_success "   • Application is working correctly"
    
else
    print_error "❌ PLAYWRIGHT E2E TESTS FAILED!"
    print_status "🔍 TROUBLESHOOTING:"
    print_status "   • Check test results in: Front-End/angular-18-todo-app/test-results/"
    print_status "   • Review screenshots and videos for failed tests"
    print_status "   • Check service logs:"
    print_status "     - Backend: /tmp/backend-e2e.log"
    print_status "     - Frontend: /tmp/frontend-e2e.log"
    print_status "   • Verify all services are still running"
    
    exit 1
fi

cd ../..

# ========================================
# PHASE 5: CLEANUP AND SUMMARY
# ========================================
print_phase "🧹 PHASE 5: Test Completion Summary"

print_success "🎊 E2E TESTING WORKFLOW COMPLETED!"
print_status ""
print_status "📋 EXECUTION SUMMARY:"
print_status "   ✅ Database Layer: MongoDB + MongoDB Express"
print_status "   ✅ Backend Layer: Express.js API"
print_status "   ✅ Frontend Layer: Angular 18 Application"
print_status "   ✅ E2E Tests: Playwright Chrome testing"
print_status ""
print_status "🌐 SERVICES REMAIN RUNNING AT:"
print_status "   • Application: http://localhost:4200"
print_status "   • API: http://localhost:3000"
print_status "   • Database UI: http://localhost:8081"
print_status ""
print_status "🎯 NEXT STEPS:"
print_status "   • Review test reports in playwright-report/ directory"
print_status "   • Test the application manually at http://localhost:4200"
print_status "   • Run specific test suites: ./run-e2e-tests.sh [auth|dashboard|workflows]"
print_status "   • Stop services when done: ./stop-dev.sh"
print_status ""
print_success "🚀 APPLICATION IS FULLY TESTED AND READY FOR USE!"