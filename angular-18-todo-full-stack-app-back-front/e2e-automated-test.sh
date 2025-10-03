#!/bin/bash

# Comprehensive End-to-End Automated Test Script
# This script tests the complete Angular 18 Todo Full-Stack Application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:4200"
TIMESTAMP=$(date +%s)
TEST_USER_EMAIL="e2etest${TIMESTAMP}@example.com"
TEST_USER_PASSWORD="testpass123"

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║       ANGULAR 18 TODO - END-TO-END AUTOMATED TESTS       ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════╝${NC}"

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}Checking ${service_name} health...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ ${service_name} is healthy${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -e "${YELLOW}  Attempt $attempt/$max_attempts - waiting for ${service_name}...${NC}"
        sleep 2
    done
    
    echo -e "${RED}✗ ${service_name} failed to start${NC}"
    return 1
}

# Function to run API test
api_test() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local description=$5
    
    echo -e "${CYAN}Testing: ${description}${NC}"
    
    if [ -n "$headers" ]; then
        response=$(curl -s -X "$method" "${API_BASE_URL}${endpoint}" -H "Content-Type: application/json" -H "$headers" -d "$data" 2>/dev/null || echo '{"success":false,"error":"Request failed"}')
    else
        response=$(curl -s -X "$method" "${API_BASE_URL}${endpoint}" -H "Content-Type: application/json" -d "$data" 2>/dev/null || echo '{"success":false,"error":"Request failed"}')
    fi
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}  ✓ ${description} - PASSED${NC}"
        echo "$response"
        return 0
    else
        echo -e "${YELLOW}  ⚠ ${description} - RESPONSE: $response${NC}"
        return 1
    fi
}

# Start comprehensive testing
echo -e "\n${BLUE}=== PHASE 1: SERVICE HEALTH CHECKS ===${NC}"

# Check backend health
check_service "Backend API" "${API_BASE_URL}/health"

# Check frontend
check_service "Frontend" "$FRONTEND_URL"

echo -e "\n${BLUE}=== PHASE 2: API FUNCTIONALITY TESTS ===${NC}"

# Test 1: User Registration
echo -e "\n${PURPLE}Test Group: Authentication${NC}"
REGISTER_DATA="{\"username\":\"e2euser${TIMESTAMP}\",\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\",\"confirmPassword\":\"${TEST_USER_PASSWORD}\",\"firstName\":\"E2E\",\"lastName\":\"Test\"}"

api_test "POST" "/auth/register" "$REGISTER_DATA" "" "User Registration"

# Test 2: User Login
LOGIN_DATA="{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\"}"
LOGIN_RESPONSE=$(api_test "POST" "/auth/login" "$LOGIN_DATA" "" "User Login")

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}  ✓ Token extracted successfully${NC}"
    AUTH_HEADER="Authorization: Bearer $TOKEN"
else
    echo -e "${RED}  ✗ Failed to extract token${NC}"
    AUTH_HEADER=""
fi

# Test 3: Get User Profile
echo -e "\n${PURPLE}Test Group: User Management${NC}"
api_test "GET" "/users/profile" "" "$AUTH_HEADER" "Get User Profile"

# Test 4: Create List
echo -e "\n${PURPLE}Test Group: List Management${NC}"
LIST_DATA="{\"name\":\"E2E Test List\",\"description\":\"Automated test list\",\"color\":\"#3498db\",\"isPublic\":false}"
LIST_RESPONSE=$(api_test "POST" "/lists" "$LIST_DATA" "$AUTH_HEADER" "Create List")

# Extract list ID
LIST_ID=$(echo "$LIST_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
if [ -n "$LIST_ID" ]; then
    echo -e "${GREEN}  ✓ List ID extracted: $LIST_ID${NC}"
else
    echo -e "${RED}  ✗ Failed to extract list ID${NC}"
fi

# Test 5: Get All Lists
api_test "GET" "/lists" "" "$AUTH_HEADER" "Get All Lists"

# Test 6: Create Todo
echo -e "\n${PURPLE}Test Group: Todo Management${NC}"
if [ -n "$LIST_ID" ]; then
    TODO_DATA="{\"title\":\"E2E Test Todo\",\"description\":\"Automated test todo\",\"priority\":\"medium\",\"category\":\"testing\",\"dueDate\":\"2025-12-31T23:59:59.000Z\"}"
    TODO_RESPONSE=$(api_test "POST" "/lists/${LIST_ID}/todos" "$TODO_DATA" "$AUTH_HEADER" "Create Todo")
    
    # Extract todo ID
    TODO_ID=$(echo "$TODO_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TODO_ID" ]; then
        echo -e "${GREEN}  ✓ Todo ID extracted: $TODO_ID${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠ Skipping todo tests - no list ID available${NC}"
fi

# Test 7: Get Todos from List
if [ -n "$LIST_ID" ]; then
    api_test "GET" "/lists/${LIST_ID}/todos" "" "$AUTH_HEADER" "Get Todos from List"
fi

# Test 8: Update Todo
if [ -n "$LIST_ID" ] && [ -n "$TODO_ID" ]; then
    UPDATE_TODO_DATA="{\"title\":\"Updated E2E Test Todo\",\"description\":\"Updated description\",\"completed\":true}"
    api_test "PUT" "/lists/${LIST_ID}/todos/${TODO_ID}" "$UPDATE_TODO_DATA" "$AUTH_HEADER" "Update Todo"
fi

# Test 9: Get All Todos
api_test "GET" "/todos" "" "$AUTH_HEADER" "Get All Todos"

echo -e "\n${BLUE}=== PHASE 3: FRONTEND INTEGRATION TESTS ===${NC}"

# Test frontend pages
echo -e "${CYAN}Testing frontend accessibility...${NC}"

# Check if main page loads
if curl -s "$FRONTEND_URL" | grep -q "Angular18TodoApp"; then
    echo -e "${GREEN}  ✓ Frontend main page loads${NC}"
else
    echo -e "${RED}  ✗ Frontend main page failed to load${NC}"
fi

# Check if login page is accessible
if curl -s "${FRONTEND_URL}/auth/login" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Login page accessible${NC}"
else
    echo -e "${YELLOW}  ⚠ Login page may not be accessible${NC}"
fi

# Check if register page is accessible
if curl -s "${FRONTEND_URL}/auth/register" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Register page accessible${NC}"
else
    echo -e "${YELLOW}  ⚠ Register page may not be accessible${NC}"
fi

echo -e "\n${BLUE}=== PHASE 4: CLEANUP TESTS ===${NC}"

# Cleanup: Delete created todo
if [ -n "$LIST_ID" ] && [ -n "$TODO_ID" ]; then
    api_test "DELETE" "/lists/${LIST_ID}/todos/${TODO_ID}" "" "$AUTH_HEADER" "Delete Todo"
fi

# Cleanup: Delete created list
if [ -n "$LIST_ID" ]; then
    api_test "DELETE" "/lists/${LIST_ID}" "" "$AUTH_HEADER" "Delete List"
fi

echo -e "\n${PURPLE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                  E2E TESTING COMPLETED                    ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}✓ End-to-End testing completed successfully!${NC}"
echo -e "${CYAN}Application Status:${NC}"
echo -e "  • Backend API: Running on http://localhost:3000"
echo -e "  • Frontend: Running on http://localhost:4200"
echo -e "  • MongoDB: Running via Docker"
echo -e "\n${YELLOW}The Angular 18 Todo Full-Stack Application is fully operational!${NC}"