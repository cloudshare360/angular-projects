#!/bin/bash

# Requirement Validation Testing Script
# Auto-generated from requirements.md
# Purpose: Validate that implemented features meet requirements

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_FILE="$SCRIPT_DIR/../reports/requirement-validation-report.html"
LOG_FILE="$SCRIPT_DIR/../reports/requirement-validation.log"
BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🎯 Requirement Validation Testing${NC}"
echo -e "${CYAN}===================================${NC}"

# Test requirement implementation
test_requirement() {
    local requirement="$1"
    local test_endpoint="$2"
    local expected_status="$3"
    
    echo -e "${BLUE}Testing: $requirement${NC}"
    
    if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$test_endpoint" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ PASS: $requirement${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL: $requirement${NC}"
        return 1
    fi
}

# Main testing logic will be auto-generated based on requirements.md

# Test user registration requirement  
test_requirement "User Registration" "/api/auth/register" "201"

# Test user login requirement
test_requirement "User Login" "/api/auth/login" "200"

# Test user login requirement
test_requirement "User Login" "/api/auth/login" "200"

# Test list creation requirement
test_requirement "Add List" "/api/lists" "201"

# Test todo creation requirement
test_requirement "Add Todo" "/api/todos" "201"

echo -e "\n${CYAN}📊 Requirement Validation Complete${NC}"
