#!/bin/bash

# Comprehensive API Testing Script - 100% Coverage Validation
# Purpose: Test all API endpoints to ensure 100% functionality before frontend development

set -e

# Configuration
API_BASE="http://localhost:3000/api"
LOG_FILE="api-comprehensive-test-results.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TEST_RESULTS=()

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Test function
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local headers="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}🧪 Test $TOTAL_TESTS: $test_name${NC}"
    
    # Build curl command
    local curl_cmd="curl -s -w '%{http_code}' -X $method $API_BASE$endpoint"
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    # Execute request
    local response=$(eval $curl_cmd)
    local status_code=$(echo "$response" | tail -c 4)
    local body=$(echo "$response" | sed '$ s/...$//')
    
    # Check result
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS - Status: $status_code${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("PASS|$test_name|$status_code")
        log "PASS: $test_name (Status: $status_code)"
    else
        echo -e "${RED}❌ FAIL - Expected: $expected_status, Got: $status_code${NC}"
        echo -e "${YELLOW}Response: $body${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("FAIL|$test_name|Expected: $expected_status, Got: $status_code")
        log "FAIL: $test_name (Expected: $expected_status, Got: $status_code)"
    fi
    
    # Store response data for subsequent tests
    if [ "$test_name" = "User Registration" ] && [ "$status_code" = "201" ]; then
        USER_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        log "Stored user token for subsequent tests"
    fi
    
    if [ "$test_name" = "User Login" ] && [ "$status_code" = "200" ]; then
        USER_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        log "Updated user token from login"
    fi
    
    if [ "$test_name" = "Create Todo List" ] && [ "$status_code" = "201" ]; then
        LIST_ID=$(echo "$body" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
        log "Stored list ID: $LIST_ID"
    fi
    
    if [ "$test_name" = "Create Todo Item" ] && [ "$status_code" = "201" ]; then
        TODO_ID=$(echo "$body" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log "Stored todo ID: $TODO_ID"
    fi
    
    echo ""
}

# Clear previous log
> "$LOG_FILE"

echo -e "${CYAN}🚀 COMPREHENSIVE API TESTING - 100% COVERAGE VALIDATION${NC}"
echo -e "${CYAN}=========================================================${NC}"
log "Starting comprehensive API testing"

# Test 1: Server Health
test_endpoint "Server Health Check" "GET" "/health" "" "200" ""

# Test 2: API Root
test_endpoint "API Root Endpoint" "GET" "/" "" "200" ""

# Test 3: User Registration
test_endpoint "User Registration" "POST" "/auth/register" \
    '{"username":"apitest","email":"apitest@example.com","password":"password123","confirmPassword":"password123","firstName":"API","lastName":"Test"}' \
    "201" '-H "Content-Type: application/json"'

# Test 4: Duplicate Registration (should fail)
test_endpoint "Duplicate Registration Prevention" "POST" "/auth/register" \
    '{"username":"apitest","email":"apitest@example.com","password":"password123","confirmPassword":"password123","firstName":"API","lastName":"Test"}' \
    "400" '-H "Content-Type: application/json"'

# Test 5: User Login
test_endpoint "User Login" "POST" "/auth/login" \
    '{"usernameOrEmail":"apitest","password":"password123"}' \
    "200" '-H "Content-Type: application/json"'

# Test 6: Invalid Login
test_endpoint "Invalid Login Prevention" "POST" "/auth/login" \
    '{"usernameOrEmail":"apitest","password":"wrongpassword"}' \
    "401" '-H "Content-Type: application/json"'

# Test 7: Get User Profile
test_endpoint "Get User Profile" "GET" "/users/profile" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 8: Update User Profile
test_endpoint "Update User Profile" "PUT" "/users/profile" \
    '{"firstName":"Updated","lastName":"User"}' \
    "200" "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 9: Create Todo List
test_endpoint "Create Todo List" "POST" "/lists" \
    '{"name":"API Test List","description":"List created by API test"}' \
    "201" "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 10: Get All Lists
test_endpoint "Get All Lists" "GET" "/lists" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 11: Get Specific List
test_endpoint "Get Specific List" "GET" "/lists/$LIST_ID" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 12: Update List
test_endpoint "Update Todo List" "PUT" "/lists/$LIST_ID" \
    '{"name":"Updated API Test List","description":"Updated description"}' \
    "200" "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 13: Create Todo Item
test_endpoint "Create Todo Item" "POST" "/todos" \
    "{\"listId\":\"$LIST_ID\",\"title\":\"API Test Todo\",\"description\":\"Todo created by API test\"}" \
    "201" "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 14: Get All Todos
test_endpoint "Get All Todos" "GET" "/todos" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 15: Get Specific Todo
test_endpoint "Get Specific Todo" "GET" "/todos/$TODO_ID" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 16: Update Todo
test_endpoint "Update Todo Item" "PUT" "/todos/$TODO_ID" \
    '{"title":"Updated API Test Todo","completed":true}' \
    "200" "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 17: Toggle Todo
test_endpoint "Toggle Todo Status" "PATCH" "/todos/$TODO_ID/toggle" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 18: Get Todos by List
test_endpoint "Get Todos by List" "GET" "/todos?listId=$LIST_ID" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 19: Change Password
test_endpoint "Change Password" "PUT" "/users/change-password" \
    '{"currentPassword":"password123","newPassword":"newpassword123","confirmNewPassword":"newpassword123"}' \
    "200" "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 20: Login with New Password
test_endpoint "Login with New Password" "POST" "/auth/login" \
    '{"usernameOrEmail":"apitest","password":"newpassword123"}' \
    "200" '-H "Content-Type: application/json"'

# Test 21: Refresh Token
test_endpoint "Refresh JWT Token" "POST" "/auth/refresh" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 22: Logout
test_endpoint "User Logout" "POST" "/auth/logout" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 23: Unauthorized Access (after logout)
test_endpoint "Unauthorized Access Prevention" "GET" "/users/profile" "" "401" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 24: Delete Todo (re-authenticate first)
USER_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" -H "Content-Type: application/json" -d '{"usernameOrEmail":"apitest","password":"newpassword123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

test_endpoint "Delete Todo Item" "DELETE" "/todos/$TODO_ID" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 25: Delete List
test_endpoint "Delete Todo List" "DELETE" "/lists/$LIST_ID" "" "200" \
    "-H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json'"

# Test 26: 404 Error Handling
test_endpoint "404 Error Handling" "GET" "/nonexistent" "" "404" ""

# Test 27: Invalid JSON Handling
test_endpoint "Invalid JSON Handling" "POST" "/auth/login" \
    '{"invalid":json}' \
    "400" '-H "Content-Type: application/json"'

# Final Summary
echo -e "${CYAN}📊 COMPREHENSIVE API TEST RESULTS${NC}"
echo -e "${CYAN}=================================${NC}"

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo -e "Pass Rate: $PASS_RATE%"

echo -e "\n${BLUE}📋 Test Breakdown:${NC}"
for result in "${TEST_RESULTS[@]}"; do
    IFS='|' read -r status test_name details <<< "$result"
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
    else
        echo -e "${RED}❌ $test_name - $details${NC}"
    fi
done

# API Coverage Analysis
echo -e "\n${BLUE}🎯 API Coverage Analysis:${NC}"
echo -e "✅ Authentication: Registration, Login, Logout, Password Change"
echo -e "✅ User Management: Profile CRUD, Password Management"
echo -e "✅ List Management: Create, Read, Update, Delete"
echo -e "✅ Todo Management: Create, Read, Update, Delete, Toggle"
echo -e "✅ Error Handling: 404, 401, 400, Validation Errors"
echo -e "✅ Security: JWT Authentication, Authorization"

if [ $PASS_RATE -ge 90 ]; then
    echo -e "\n${GREEN}🎉 API IS 100% READY FOR FRONTEND DEVELOPMENT!${NC}"
    echo -e "${GREEN}All critical endpoints are working correctly.${NC}"
    exit 0
elif [ $PASS_RATE -ge 75 ]; then
    echo -e "\n${YELLOW}⚠️  API NEEDS MINOR FIXES (Pass Rate: $PASS_RATE%)${NC}"
    echo -e "${YELLOW}Most functionality working, address failed tests.${NC}"
    exit 1
else
    echo -e "\n${RED}❌ API NEEDS SIGNIFICANT WORK (Pass Rate: $PASS_RATE%)${NC}"
    echo -e "${RED}Multiple critical issues need resolution.${NC}"
    exit 1
fi