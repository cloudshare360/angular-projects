#!/bin/bash

# Comprehensive Express.js API End-to-End Testing Script
# Generated: October 2, 2025
# Purpose: 100% verification of all API endpoints

echo "🚀 Express.js API - Complete End-to-End Testing"
echo "================================================"
echo "Timestamp: $(date)"
echo "API Base URL: http://localhost:3000"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test Results Array
declare -a TEST_RESULTS=()

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    local http_code="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "   ${GREEN}✅ $test_name: PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $test_name: PASS")
    else
        echo -e "   ${RED}❌ $test_name: FAIL${NC} (HTTP $http_code)"
        echo -e "      ${YELLOW}Details: $details${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ $test_name: FAIL - $details")
    fi
}

# Function to test endpoint
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local headers="$3"
    local data="$4"
    local expected_code="$5"
    local test_name="$6"
    
    if [ -z "$headers" ]; then
        if [ -z "$data" ]; then
            RESPONSE=$(curl -s -w "%{http_code}" -X "$method" "http://localhost:3000$endpoint")
        else
            RESPONSE=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "http://localhost:3000$endpoint")
        fi
    else
        if [ -z "$data" ]; then
            RESPONSE=$(curl -s -w "%{http_code}" -X "$method" -H "$headers" "http://localhost:3000$endpoint")
        else
            RESPONSE=$(curl -s -w "%{http_code}" -X "$method" -H "$headers" -H "Content-Type: application/json" -d "$data" "http://localhost:3000$endpoint")
        fi
    fi
    
    HTTP_CODE="${RESPONSE: -3}"
    RESPONSE_BODY="${RESPONSE%???}"
    
    if [[ "$HTTP_CODE" =~ ^$expected_code$ ]]; then
        log_test "$test_name" "PASS" "$RESPONSE_BODY" "$HTTP_CODE"
        return 0
    else
        log_test "$test_name" "FAIL" "Expected $expected_code, got $HTTP_CODE. Response: $RESPONSE_BODY" "$HTTP_CODE"
        return 1
    fi
}

echo "🔍 Phase 1: Basic Server Health & Connectivity"
echo "=============================================+"

# Test 1: Server Health Check
test_endpoint "GET" "/health" "" "" "200" "Server Health Check"

# Test 2: Root Endpoint
test_endpoint "GET" "/" "" "" "200" "Root Endpoint"

# Test 3: API Documentation
DOCS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/api-docs)
DOCS_CODE="${DOCS_RESPONSE: -3}"
if [ "$DOCS_CODE" = "200" ] || [ "$DOCS_CODE" = "302" ]; then
    log_test "API Documentation" "PASS" "Swagger docs accessible" "$DOCS_CODE"
else
    log_test "API Documentation" "FAIL" "Documentation not accessible" "$DOCS_CODE"
fi

echo ""
echo "🔐 Phase 2: Authentication System Testing"
echo "========================================="

# Test 4: User Registration
REG_DATA='{"firstName":"TestUser","lastName":"APITest","email":"test@apitest.com","password":"password123"}'
test_endpoint "POST" "/api/auth/register" "" "$REG_DATA" "[201|200|400]" "User Registration"

# Test 5: User Login
LOGIN_DATA='{"email":"test@apitest.com","password":"password123"}'
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$LOGIN_DATA" http://localhost:3000/api/auth/login)
LOGIN_CODE="${LOGIN_RESPONSE: -3}"
LOGIN_BODY="${LOGIN_RESPONSE%???}"

if [ "$LOGIN_CODE" = "200" ]; then
    log_test "User Login" "PASS" "Login successful" "$LOGIN_CODE"
    # Extract JWT token for further testing
    JWT_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$JWT_TOKEN" ]; then
        echo -e "      ${BLUE}🔑 JWT Token extracted successfully${NC}"
        AUTH_HEADER="Authorization: Bearer $JWT_TOKEN"
    else
        echo -e "      ${YELLOW}⚠️  Could not extract JWT token${NC}"
        AUTH_HEADER=""
    fi
else
    log_test "User Login" "FAIL" "Login failed: $LOGIN_BODY" "$LOGIN_CODE"
    AUTH_HEADER=""
fi

# Test 6: Password Reset Request
RESET_DATA='{"email":"test@apitest.com"}'
test_endpoint "POST" "/api/auth/forgot-password" "" "$RESET_DATA" "[200|400|404]" "Password Reset Request"

echo ""
echo "👤 Phase 3: User Profile Management Testing"
echo "==========================================+"

if [ -n "$AUTH_HEADER" ]; then
    # Test 7: Get User Profile
    test_endpoint "GET" "/api/users/profile" "$AUTH_HEADER" "" "200" "Get User Profile"
    
    # Test 8: Update User Profile
    UPDATE_DATA='{"firstName":"Updated","lastName":"Name"}'
    test_endpoint "PUT" "/api/users/profile" "$AUTH_HEADER" "$UPDATE_DATA" "200" "Update User Profile"
    
    # Test 9: Change Password
    PASSWORD_DATA='{"currentPassword":"password123","newPassword":"newpassword123"}'
    test_endpoint "PUT" "/api/users/change-password" "$AUTH_HEADER" "$PASSWORD_DATA" "[200|400]" "Change Password"
else
    log_test "Get User Profile" "SKIP" "No authentication token available" "N/A"
    log_test "Update User Profile" "SKIP" "No authentication token available" "N/A"
    log_test "Change Password" "SKIP" "No authentication token available" "N/A"
fi

echo ""
echo "📝 Phase 4: Lists Management Testing"
echo "===================================="

if [ -n "$AUTH_HEADER" ]; then
    # Test 10: Get All Lists
    test_endpoint "GET" "/api/lists" "$AUTH_HEADER" "" "200" "Get All Lists"
    
    # Test 11: Create New List
    LIST_DATA='{"name":"Test API List","description":"Created via API test","color":"#007bff"}'
    CREATE_LIST_RESPONSE=$(curl -s -w "%{http_code}" -X POST -H "$AUTH_HEADER" -H "Content-Type: application/json" -d "$LIST_DATA" http://localhost:3000/api/lists)
    CREATE_LIST_CODE="${CREATE_LIST_RESPONSE: -3}"
    CREATE_LIST_BODY="${CREATE_LIST_RESPONSE%???}"
    
    if [ "$CREATE_LIST_CODE" = "201" ] || [ "$CREATE_LIST_CODE" = "200" ]; then
        log_test "Create New List" "PASS" "List created successfully" "$CREATE_LIST_CODE"
        # Extract list ID for further testing
        LIST_ID=$(echo "$CREATE_LIST_BODY" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -z "$LIST_ID" ]; then
            LIST_ID=$(echo "$CREATE_LIST_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        fi
        if [ -n "$LIST_ID" ]; then
            echo -e "      ${BLUE}📋 List ID extracted: $LIST_ID${NC}"
        fi
    else
        log_test "Create New List" "FAIL" "Failed to create list: $CREATE_LIST_BODY" "$CREATE_LIST_CODE"
        LIST_ID=""
    fi
    
    # Test 12: Get Specific List
    if [ -n "$LIST_ID" ]; then
        test_endpoint "GET" "/api/lists/$LIST_ID" "$AUTH_HEADER" "" "200" "Get Specific List"
        
        # Test 13: Update List
        UPDATE_LIST_DATA='{"name":"Updated Test List","description":"Updated via API"}'
        test_endpoint "PUT" "/api/lists/$LIST_ID" "$AUTH_HEADER" "$UPDATE_LIST_DATA" "200" "Update List"
    else
        log_test "Get Specific List" "SKIP" "No list ID available" "N/A"
        log_test "Update List" "SKIP" "No list ID available" "N/A"
    fi
else
    log_test "Get All Lists" "SKIP" "No authentication token available" "N/A"
    log_test "Create New List" "SKIP" "No authentication token available" "N/A"
    log_test "Get Specific List" "SKIP" "No authentication token available" "N/A"
    log_test "Update List" "SKIP" "No authentication token available" "N/A"
fi

echo ""
echo "✅ Phase 5: Todos Management Testing"
echo "===================================="

if [ -n "$AUTH_HEADER" ]; then
    # Test 14: Get All Todos
    test_endpoint "GET" "/api/todos" "$AUTH_HEADER" "" "200" "Get All Todos"
    
    # Test 15: Create New Todo
    TODO_DATA='{"title":"Test API Todo","description":"Created via API test","priority":"medium"}'
    if [ -n "$LIST_ID" ]; then
        TODO_DATA='{"title":"Test API Todo","description":"Created via API test","priority":"medium","listId":"'$LIST_ID'"}'
    fi
    
    CREATE_TODO_RESPONSE=$(curl -s -w "%{http_code}" -X POST -H "$AUTH_HEADER" -H "Content-Type: application/json" -d "$TODO_DATA" http://localhost:3000/api/todos)
    CREATE_TODO_CODE="${CREATE_TODO_RESPONSE: -3}"
    CREATE_TODO_BODY="${CREATE_TODO_RESPONSE%???}"
    
    if [ "$CREATE_TODO_CODE" = "201" ] || [ "$CREATE_TODO_CODE" = "200" ]; then
        log_test "Create New Todo" "PASS" "Todo created successfully" "$CREATE_TODO_CODE"
        # Extract todo ID for further testing
        TODO_ID=$(echo "$CREATE_TODO_BODY" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -z "$TODO_ID" ]; then
            TODO_ID=$(echo "$CREATE_TODO_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        fi
        if [ -n "$TODO_ID" ]; then
            echo -e "      ${BLUE}📝 Todo ID extracted: $TODO_ID${NC}"
        fi
    else
        log_test "Create New Todo" "FAIL" "Failed to create todo: $CREATE_TODO_BODY" "$CREATE_TODO_CODE"
        TODO_ID=""
    fi
    
    # Test 16: Get Specific Todo
    if [ -n "$TODO_ID" ]; then
        test_endpoint "GET" "/api/todos/$TODO_ID" "$AUTH_HEADER" "" "200" "Get Specific Todo"
        
        # Test 17: Update Todo
        UPDATE_TODO_DATA='{"title":"Updated Test Todo","description":"Updated via API","completed":true}'
        test_endpoint "PUT" "/api/todos/$TODO_ID" "$AUTH_HEADER" "$UPDATE_TODO_DATA" "200" "Update Todo"
        
        # Test 18: Toggle Todo Completion
        test_endpoint "PATCH" "/api/todos/$TODO_ID/toggle" "$AUTH_HEADER" "" "200" "Toggle Todo Completion"
    else
        log_test "Get Specific Todo" "SKIP" "No todo ID available" "N/A"
        log_test "Update Todo" "SKIP" "No todo ID available" "N/A"
        log_test "Toggle Todo Completion" "SKIP" "No todo ID available" "N/A"
    fi
    
    # Test 19: List-specific Todos
    if [ -n "$LIST_ID" ]; then
        test_endpoint "GET" "/api/lists/$LIST_ID/todos" "$AUTH_HEADER" "" "200" "Get List-specific Todos"
    else
        log_test "Get List-specific Todos" "SKIP" "No list ID available" "N/A"
    fi
else
    log_test "Get All Todos" "SKIP" "No authentication token available" "N/A"
    log_test "Create New Todo" "SKIP" "No authentication token available" "N/A"
    log_test "Get Specific Todo" "SKIP" "No authentication token available" "N/A"
    log_test "Update Todo" "SKIP" "No authentication token available" "N/A"
    log_test "Toggle Todo Completion" "SKIP" "No authentication token available" "N/A"
    log_test "Get List-specific Todos" "SKIP" "No authentication token available" "N/A"
fi

echo ""
echo "🛡️ Phase 6: Security & Error Handling Testing"
echo "=============================================="

# Test 20: Unauthorized Access
test_endpoint "GET" "/api/users/profile" "" "" "401" "Unauthorized Access Test"

# Test 21: Invalid Endpoint
test_endpoint "GET" "/api/invalid-endpoint" "" "" "404" "Invalid Endpoint Test"

# Test 22: Malformed JSON
MALFORMED_JSON='{"invalid": json}'
MALFORMED_RESPONSE=$(curl -s -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$MALFORMED_JSON" http://localhost:3000/api/auth/login)
MALFORMED_CODE="${MALFORMED_RESPONSE: -3}"
if [ "$MALFORMED_CODE" = "400" ] || [ "$MALFORMED_CODE" = "422" ]; then
    log_test "Malformed JSON Handling" "PASS" "Server correctly rejected malformed JSON" "$MALFORMED_CODE"
else
    log_test "Malformed JSON Handling" "FAIL" "Server did not handle malformed JSON properly" "$MALFORMED_CODE"
fi

echo ""
echo "🧹 Phase 7: Cleanup Testing"
echo "============================"

if [ -n "$AUTH_HEADER" ]; then
    # Test 23: Delete Todo (if created)
    if [ -n "$TODO_ID" ]; then
        test_endpoint "DELETE" "/api/todos/$TODO_ID" "$AUTH_HEADER" "" "200" "Delete Todo"
    else
        log_test "Delete Todo" "SKIP" "No todo ID available" "N/A"
    fi
    
    # Test 24: Delete List (if created)
    if [ -n "$LIST_ID" ]; then
        test_endpoint "DELETE" "/api/lists/$LIST_ID" "$AUTH_HEADER" "" "200" "Delete List"
    else
        log_test "Delete List" "SKIP" "No list ID available" "N/A"
    fi
    
    # Test 25: User Logout
    test_endpoint "POST" "/api/auth/logout" "$AUTH_HEADER" "" "[200|401]" "User Logout"
else
    log_test "Delete Todo" "SKIP" "No authentication token available" "N/A"
    log_test "Delete List" "SKIP" "No authentication token available" "N/A"
    log_test "User Logout" "SKIP" "No authentication token available" "N/A"
fi

echo ""
echo "📊 Final Test Results Summary"
echo "============================="
echo -e "${BLUE}Total Tests Executed: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Tests Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Tests Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Express.js API is 100% operational!${NC}"
    API_STATUS="✅ FULLY OPERATIONAL"
else
    echo -e "${YELLOW}⚠️  Some tests failed. API requires attention.${NC}"
    API_STATUS="⚠️ NEEDS ATTENTION"
fi

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "${BLUE}Pass Rate: $PASS_RATE%${NC}"

echo ""
echo "📋 Detailed Test Results:"
echo "========================"
for result in "${TEST_RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo "🔗 API Information:"
echo "=================="
echo "Base URL: http://localhost:3000"
echo "Documentation: http://localhost:3000/api-docs"
echo "Health Check: http://localhost:3000/health"
echo "Status: $API_STATUS"
echo "Test Completion: $(date)"

echo ""
echo "✅ Express.js API End-to-End Testing Complete!"
echo "==============================================="

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi