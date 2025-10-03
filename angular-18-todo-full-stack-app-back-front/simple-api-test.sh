#!/bin/bash

# Simple API Test Script for Angular Todo Application
# Generated: October 2, 2025

echo "🧪 Simple API Test Suite"
echo "========================"
echo "Testing API: http://localhost:3000"
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/health)
HEALTH_CODE="${HEALTH_RESPONSE: -3}"
HEALTH_BODY="${HEALTH_RESPONSE%???}"

if [ "$HEALTH_CODE" = "200" ]; then
    echo "   ✅ Health Check: PASS (HTTP $HEALTH_CODE)"
    echo "   Response: $HEALTH_BODY"
else
    echo "   ❌ Health Check: FAIL (HTTP $HEALTH_CODE)"
    echo "   Response: $HEALTH_BODY"
fi
echo ""

# Test 2: Root Endpoint
echo "2. Testing Root Endpoint..."
ROOT_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/)
ROOT_CODE="${ROOT_RESPONSE: -3}"
ROOT_BODY="${ROOT_RESPONSE%???}"

if [ "$ROOT_CODE" = "200" ]; then
    echo "   ✅ Root Endpoint: PASS (HTTP $ROOT_CODE)"
    echo "   Response: $ROOT_BODY"
else
    echo "   ❌ Root Endpoint: FAIL (HTTP $ROOT_CODE)"
    echo "   Response: $ROOT_BODY"
fi
echo ""

# Test 3: API Documentation
echo "3. Testing API Documentation..."
DOCS_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/api-docs)
DOCS_CODE="${DOCS_RESPONSE: -3}"

if [ "$DOCS_CODE" = "200" ] || [ "$DOCS_CODE" = "302" ]; then
    echo "   ✅ API Docs: PASS (HTTP $DOCS_CODE)"
else
    echo "   ❌ API Docs: FAIL (HTTP $DOCS_CODE)"
fi
echo ""

# Test 4: User Registration (Should work without auth)
echo "4. Testing User Registration..."
REG_RESPONSE=$(curl -s -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123"}' \
    http://localhost:3000/api/auth/register)
REG_CODE="${REG_RESPONSE: -3}"
REG_BODY="${REG_RESPONSE%???}"

if [ "$REG_CODE" = "201" ] || [ "$REG_CODE" = "200" ]; then
    echo "   ✅ User Registration: PASS (HTTP $REG_CODE)"
    echo "   Response: $REG_BODY"
elif [ "$REG_CODE" = "400" ] && [[ "$REG_BODY" == *"already exists"* ]]; then
    echo "   ✅ User Registration: PASS (User already exists - HTTP $REG_CODE)"
else
    echo "   ❌ User Registration: FAIL (HTTP $REG_CODE)"
    echo "   Response: $REG_BODY"
fi
echo ""

# Test 5: User Login
echo "5. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}' \
    http://localhost:3000/api/auth/login)
LOGIN_CODE="${LOGIN_RESPONSE: -3}"
LOGIN_BODY="${LOGIN_RESPONSE%???}"

if [ "$LOGIN_CODE" = "200" ]; then
    echo "   ✅ User Login: PASS (HTTP $LOGIN_CODE)"
    echo "   Response: $LOGIN_BODY"
    
    # Extract token for further testing
    TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "   🔑 JWT Token extracted successfully"
    fi
else
    echo "   ❌ User Login: FAIL (HTTP $LOGIN_CODE)"
    echo "   Response: $LOGIN_BODY"
fi
echo ""

# Test 6: Protected Route (Lists)
if [ -n "$TOKEN" ]; then
    echo "6. Testing Protected Route (Lists)..."
    LISTS_RESPONSE=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        http://localhost:3000/api/lists)
    LISTS_CODE="${LISTS_RESPONSE: -3}"
    LISTS_BODY="${LISTS_RESPONSE%???}"

    if [ "$LISTS_CODE" = "200" ]; then
        echo "   ✅ Lists Endpoint: PASS (HTTP $LISTS_CODE)"
        echo "   Response: $LISTS_BODY"
    else
        echo "   ❌ Lists Endpoint: FAIL (HTTP $LISTS_CODE)"
        echo "   Response: $LISTS_BODY"
    fi
else
    echo "6. Testing Protected Route (Lists)..."
    echo "   ⏭️  SKIPPED - No token available"
fi
echo ""

# Test 7: Invalid Endpoint
echo "7. Testing Invalid Endpoint..."
INVALID_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/api/invalid)
INVALID_CODE="${INVALID_RESPONSE: -3}"

if [ "$INVALID_CODE" = "404" ]; then
    echo "   ✅ 404 Handling: PASS (HTTP $INVALID_CODE)"
else
    echo "   ❌ 404 Handling: FAIL (HTTP $INVALID_CODE)"
fi
echo ""

echo "🏁 Test Summary"
echo "==============="
echo "API Base URL: http://localhost:3000"
echo "Documentation: http://localhost:3000/api-docs"
echo "Health Check: http://localhost:3000/health"
echo ""
echo "✅ Basic API testing complete!"