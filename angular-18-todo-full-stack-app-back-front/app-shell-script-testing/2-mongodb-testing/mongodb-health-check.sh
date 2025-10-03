#!/bin/bash

# MongoDB Health Check Script - Task 2
# Generated: October 2, 2025
# Purpose: Comprehensive MongoDB testing and validation

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_FILE="$SCRIPT_DIR/../reports/mongodb-health-report.html"
LOG_FILE="$SCRIPT_DIR/../reports/mongodb-health.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Result tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TEST_RESULTS=()

test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    local expected="$4"
    local actual="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC}" | tee -a "$LOG_FILE"
        if [ -n "$details" ]; then
            echo -e "   ${BLUE}ℹ️  $details${NC}" | tee -a "$LOG_FILE"
        fi
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("PASS|$test_name|$details|$expected|$actual")
    else
        echo -e "${RED}❌ $test_name: FAIL${NC}" | tee -a "$LOG_FILE"
        if [ -n "$details" ]; then
            echo -e "   ${YELLOW}⚠️  $details${NC}" | tee -a "$LOG_FILE"
        fi
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("FAIL|$test_name|$details|$expected|$actual")
    fi
}

echo -e "${BLUE}🏥 MongoDB Health Check - Task 2${NC}"
echo -e "${BLUE}===================================${NC}"
log "Starting comprehensive MongoDB health check..."

# Clean previous logs
> "$LOG_FILE"

# Test 1: Container Status
echo -e "\n${YELLOW}🔍 Phase 1: Container Health${NC}"

MONGODB_CONTAINER=$(sudo docker ps --filter "name=angular-todo-mongodb" --format "{{.Names}}" | head -1)
if [ -n "$MONGODB_CONTAINER" ]; then
    CONTAINER_STATUS=$(sudo docker inspect "$MONGODB_CONTAINER" --format='{{.State.Status}}')
    if [ "$CONTAINER_STATUS" = "running" ]; then
        test_result "MongoDB Container Running" "PASS" "Container $MONGODB_CONTAINER is healthy" "running" "$CONTAINER_STATUS"
    else
        test_result "MongoDB Container Running" "FAIL" "Container status: $CONTAINER_STATUS" "running" "$CONTAINER_STATUS"
    fi
else
    test_result "MongoDB Container Running" "FAIL" "No MongoDB container found" "running" "not found"
fi

# Test 2: MongoDB Service Health
echo -e "\n${YELLOW}🔍 Phase 2: MongoDB Service Health${NC}"

if [ -n "$MONGODB_CONTAINER" ]; then
    # Test database ping
    if PING_RESULT=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.runCommand({ping: 1})" --quiet 2>/dev/null); then
        if echo "$PING_RESULT" | grep -q '"ok" : 1'; then
            test_result "Database Ping" "PASS" "MongoDB responding to ping" "ok: 1" "ok: 1"
        else
            test_result "Database Ping" "FAIL" "Ping response invalid" "ok: 1" "$PING_RESULT"
        fi
    else
        test_result "Database Ping" "FAIL" "Cannot execute ping command" "ok: 1" "connection failed"
    fi
    
    # Test authentication
    if AUTH_RESULT=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.runCommand({connectionStatus: 1})" --quiet 2>/dev/null); then
        if echo "$AUTH_RESULT" | grep -q '"authenticated" : true'; then
            test_result "Authentication" "PASS" "User authenticated successfully" "authenticated: true" "authenticated: true"
        else
            test_result "Authentication" "FAIL" "Authentication failed" "authenticated: true" "$AUTH_RESULT"
        fi
    else
        test_result "Authentication" "FAIL" "Cannot test authentication" "authenticated: true" "connection failed"
    fi
else
    test_result "Database Ping" "FAIL" "No container to test" "ok: 1" "no container"
    test_result "Authentication" "FAIL" "No container to test" "authenticated: true" "no container"
fi

# Test 3: Database Operations
echo -e "\n${YELLOW}🔍 Phase 3: CRUD Operations${NC}"

if [ -n "$MONGODB_CONTAINER" ]; then
    # Test database creation and selection
    DB_LIST=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin --eval "db.adminCommand('listDatabases')" --quiet 2>/dev/null | grep -o '"tododb"' || echo "")
    if [ -n "$DB_LIST" ]; then
        test_result "Database Exists" "PASS" "tododb database found" "tododb exists" "tododb found"
    else
        test_result "Database Exists" "FAIL" "tododb database not found" "tododb exists" "not found"
    fi
    
    # Test collection operations
    COLLECTIONS=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.getCollectionNames()" --quiet 2>/dev/null || echo "error")
    if [[ "$COLLECTIONS" != "error" ]]; then
        test_result "List Collections" "PASS" "Can list collections" "array response" "success"
    else
        test_result "List Collections" "FAIL" "Cannot list collections" "array response" "error"
    fi
    
    # Test write operation
    WRITE_TEST=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
        db.healthcheck.insertOne({
            testId: 'health-check-$(date +%s)',
            timestamp: new Date(),
            test: 'write-operation'
        })
    " --quiet 2>/dev/null)
    
    if echo "$WRITE_TEST" | grep -q "acknowledged.*true"; then
        test_result "Write Operation" "PASS" "Successfully inserted test document" "acknowledged: true" "acknowledged: true"
    else
        test_result "Write Operation" "FAIL" "Failed to insert document" "acknowledged: true" "$WRITE_TEST"
    fi
    
    # Test read operation
    READ_TEST=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
        db.healthcheck.findOne({test: 'write-operation'})
    " --quiet 2>/dev/null)
    
    if echo "$READ_TEST" | grep -q "write-operation"; then
        test_result "Read Operation" "PASS" "Successfully read test document" "document found" "document found"
    else
        test_result "Read Operation" "FAIL" "Failed to read document" "document found" "$READ_TEST"
    fi
    
    # Test update operation
    UPDATE_TEST=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
        db.healthcheck.updateOne(
            {test: 'write-operation'},
            {\$set: {updated: new Date(), status: 'updated'}}
        )
    " --quiet 2>/dev/null)
    
    if echo "$UPDATE_TEST" | grep -q "modifiedCount.*1"; then
        test_result "Update Operation" "PASS" "Successfully updated test document" "modifiedCount: 1" "modifiedCount: 1"
    else
        test_result "Update Operation" "FAIL" "Failed to update document" "modifiedCount: 1" "$UPDATE_TEST"
    fi
    
    # Test delete operation
    DELETE_TEST=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
        db.healthcheck.deleteMany({test: 'write-operation'})
    " --quiet 2>/dev/null)
    
    if echo "$DELETE_TEST" | grep -q "deletedCount"; then
        test_result "Delete Operation" "PASS" "Successfully deleted test documents" "deletedCount > 0" "deletedCount found"
    else
        test_result "Delete Operation" "FAIL" "Failed to delete documents" "deletedCount > 0" "$DELETE_TEST"
    fi
else
    test_result "Database Exists" "FAIL" "No container to test" "tododb exists" "no container"
    test_result "List Collections" "FAIL" "No container to test" "array response" "no container"
    test_result "Write Operation" "FAIL" "No container to test" "acknowledged: true" "no container"
    test_result "Read Operation" "FAIL" "No container to test" "document found" "no container"
    test_result "Update Operation" "FAIL" "No container to test" "modifiedCount: 1" "no container"
    test_result "Delete Operation" "FAIL" "No container to test" "deletedCount > 0" "no container"
fi

# Test 4: Performance Tests
echo -e "\n${YELLOW}🔍 Phase 4: Performance Tests${NC}"

if [ -n "$MONGODB_CONTAINER" ]; then
    # Test connection time
    START_TIME=$(date +%s%N)
    CONN_TEST=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.runCommand({ping: 1})" --quiet 2>/dev/null || echo "error")
    END_TIME=$(date +%s%N)
    CONN_TIME=$((($END_TIME - $START_TIME) / 1000000))  # Convert to milliseconds
    
    if [[ "$CONN_TEST" != "error" && $CONN_TIME -lt 1000 ]]; then
        test_result "Connection Performance" "PASS" "Connection time: ${CONN_TIME}ms" "< 1000ms" "${CONN_TIME}ms"
    else
        test_result "Connection Performance" "FAIL" "Connection too slow or failed: ${CONN_TIME}ms" "< 1000ms" "${CONN_TIME}ms"
    fi
    
    # Test bulk operations
    BULK_START=$(date +%s%N)
    BULK_TEST=$(sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
        var docs = [];
        for(var i = 0; i < 100; i++) {
            docs.push({
                testBulk: true,
                index: i,
                timestamp: new Date(),
                data: 'bulk-test-data-' + i
            });
        }
        db.healthcheck_bulk.insertMany(docs);
    " --quiet 2>/dev/null)
    BULK_END=$(date +%s%N)
    BULK_TIME=$((($BULK_END - $BULK_START) / 1000000))
    
    if echo "$BULK_TEST" | grep -q "insertedIds"; then
        test_result "Bulk Insert Performance" "PASS" "Inserted 100 docs in ${BULK_TIME}ms" "success" "${BULK_TIME}ms"
        
        # Cleanup bulk test data
        sudo docker exec "$MONGODB_CONTAINER" mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.healthcheck_bulk.drop()" --quiet 2>/dev/null
    else
        test_result "Bulk Insert Performance" "FAIL" "Bulk insert failed" "success" "failed"
    fi
else
    test_result "Connection Performance" "FAIL" "No container to test" "< 1000ms" "no container"
    test_result "Bulk Insert Performance" "FAIL" "No container to test" "success" "no container"
fi

# Test 5: MongoDB UI Access
echo -e "\n${YELLOW}🔍 Phase 5: MongoDB UI Health${NC}"

MONGOUI_CONTAINER=$(sudo docker ps --filter "name=angular-todo-mongo-ui" --format "{{.Names}}" | head -1)
if [ -n "$MONGOUI_CONTAINER" ]; then
    UI_STATUS=$(sudo docker inspect "$MONGOUI_CONTAINER" --format='{{.State.Status}}')
    if [ "$UI_STATUS" = "running" ]; then
        test_result "MongoDB UI Container" "PASS" "UI container $MONGOUI_CONTAINER is running" "running" "$UI_STATUS"
        
        # Test UI accessibility
        if curl -s --max-time 5 http://localhost:8081 >/dev/null 2>&1; then
            test_result "MongoDB UI Access" "PASS" "UI accessible at http://localhost:8081" "accessible" "accessible"
        else
            test_result "MongoDB UI Access" "FAIL" "UI not responding" "accessible" "not accessible"
        fi
    else
        test_result "MongoDB UI Container" "FAIL" "UI container status: $UI_STATUS" "running" "$UI_STATUS"
        test_result "MongoDB UI Access" "FAIL" "Container not running" "accessible" "container down"
    fi
else
    test_result "MongoDB UI Container" "FAIL" "No MongoDB UI container found" "running" "not found"
    test_result "MongoDB UI Access" "FAIL" "No container to test" "accessible" "no container"
fi

# Generate summary
echo -e "\n${BLUE}📊 MongoDB Health Summary${NC}"
echo -e "${BLUE}==========================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
if [ $SUCCESS_RATE -ge 90 ]; then
    HEALTH_STATUS="EXCELLENT"
    STATUS_COLOR=$GREEN
elif [ $SUCCESS_RATE -ge 75 ]; then
    HEALTH_STATUS="GOOD"
    STATUS_COLOR=$YELLOW
else
    HEALTH_STATUS="POOR"
    STATUS_COLOR=$RED
fi

echo -e "${STATUS_COLOR}Health Status: $HEALTH_STATUS ($SUCCESS_RATE%)${NC}"

# Generate HTML report
cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB Health Check Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007acc; padding-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; border-left: 4px solid #007acc; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .test-section { margin: 20px 0; }
        .test-section h3 { color: #007acc; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .test-item.pass { background: #d4edda; border-left: 4px solid #28a745; }
        .test-item.fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .status-badge { padding: 5px 10px; border-radius: 20px; color: white; font-weight: bold; }
        .status-excellent { background: #28a745; }
        .status-good { background: #ffc107; color: black; }
        .status-poor { background: #dc3545; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 MongoDB Health Check Report</h1>
            <p class="timestamp">Generated: $(date)</p>
            <span class="status-badge status-$(echo $HEALTH_STATUS | tr '[:upper:]' '[:lower:]')">$HEALTH_STATUS ($SUCCESS_RATE%)</span>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <h2>$TOTAL_TESTS</h2>
            </div>
            <div class="summary-card">
                <h3 class="pass">Passed</h3>
                <h2 class="pass">$PASSED_TESTS</h2>
            </div>
            <div class="summary-card">
                <h3 class="fail">Failed</h3>
                <h2 class="fail">$FAILED_TESTS</h2>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <h2>$SUCCESS_RATE%</h2>
            </div>
        </div>

        <div class="test-section">
            <h3>🔍 Test Results</h3>
EOF

# Add test results to HTML
current_phase=""
for result in "${TEST_RESULTS[@]}"; do
    IFS='|' read -r status name details expected actual <<< "$result"
    class=$(echo $status | tr '[:upper:]' '[:lower:]')
    
    cat >> "$REPORT_FILE" << EOF
            <div class="test-item $class">
                <div>
                    <strong>$name</strong>
                    $([ -n "$details" ] && echo "<br><small>$details</small>")
                </div>
                <div>
                    <span class="status-badge status-$(echo $status | tr '[:upper:]' '[:lower:]')">$status</span>
                </div>
            </div>
EOF
done

cat >> "$REPORT_FILE" << EOF
        </div>

        <div class="test-section">
            <h3>📊 Infrastructure Details</h3>
            <div class="test-item">
                <div><strong>MongoDB Container:</strong> ${MONGODB_CONTAINER:-"Not Running"}</div>
            </div>
            <div class="test-item">
                <div><strong>MongoDB UI Container:</strong> ${MONGOUI_CONTAINER:-"Not Running"}</div>
            </div>
            <div class="test-item">
                <div><strong>Connection URI:</strong> mongodb://admin:todopassword123@localhost:27017/tododb?authSource=admin</div>
            </div>
            <div class="test-item">
                <div><strong>MongoDB UI:</strong> <a href="http://localhost:8081" target="_blank">http://localhost:8081</a></div>
            </div>
        </div>

        <div class="test-section">
            <h3>🎯 Next Steps</h3>
            $(if [ $FAILED_TESTS -eq 0 ]; then
                echo '<div class="test-item pass"><div>✅ MongoDB is fully operational and ready for application testing</div></div>'
                echo '<div class="test-item pass"><div>🔄 Proceed to Task 3: Express.js Testing</div></div>'
            else
                echo '<div class="test-item fail"><div>❌ Fix failed tests before proceeding to Express.js testing</div></div>'
                echo '<div class="test-item fail"><div>🛠️ Check container logs and configuration</div></div>'
            fi)
        </div>

        <footer style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #6c757d;">
            <p>Generated by MongoDB Health Check Script - Task 2</p>
        </footer>
    </div>
</body>
</html>
EOF

log "HTML Report generated: $REPORT_FILE"

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✅ MongoDB health check completed successfully!${NC}"
    echo -e "${GREEN}🔄 Ready for Task 3: Express.js Testing${NC}"
    exit 0
else
    echo -e "\n${RED}❌ MongoDB health check failed!${NC}"
    echo -e "${RED}🛠️  Fix issues before proceeding to Express.js${NC}"
    exit 1
fi