#!/bin/bash

# MongoDB Health Check Script for Angular Todo Application
# Generated: October 2, 2025

echo "🔍 MongoDB Health Check Report"
echo "================================"
echo "Timestamp: $(date)"
echo ""

# Check if Docker containers are running
echo "📋 Container Status:"
MONGO_CONTAINER=$(sudo docker ps --filter "name=angular-todo-mongodb" --format "table {{.Names}}\t{{.Status}}" | grep mongodb)
UI_CONTAINER=$(sudo docker ps --filter "name=angular-todo-mongo-ui" --format "table {{.Names}}\t{{.Status}}" | grep mongo-ui)

if [ -z "$MONGO_CONTAINER" ]; then
    echo "   ❌ MongoDB Container: NOT RUNNING"
    exit 1
else
    echo "   ✅ MongoDB Container: RUNNING"
fi

if [ -z "$UI_CONTAINER" ]; then
    echo "   ❌ MongoDB UI Container: NOT RUNNING"
else
    echo "   ✅ MongoDB UI Container: RUNNING"
fi

echo ""

# Check database connectivity
echo "🔗 Database Connectivity:"
DB_CONNECTION=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.runCommand({ping: 1})" --quiet 2>/dev/null | grep "ok.*1")

if [ -z "$DB_CONNECTION" ]; then
    echo "   ❌ Database Connection: FAILED"
    exit 1
else
    echo "   ✅ Database Connection: SUCCESS"
fi

# Check collections
echo ""
echo "📊 Collections Status:"
COLLECTIONS=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.getCollectionNames()" --quiet 2>/dev/null)

if [[ $COLLECTIONS == *"users"* ]] && [[ $COLLECTIONS == *"lists"* ]] && [[ $COLLECTIONS == *"todos"* ]]; then
    echo "   ✅ Required Collections: ALL PRESENT"
    echo "      - users ✅"
    echo "      - lists ✅"
    echo "      - todos ✅"
else
    echo "   ❌ Required Collections: MISSING"
    echo "   Found: $COLLECTIONS"
fi

# Check seed data
echo ""
echo "📈 Seed Data Status:"
USER_COUNT=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.users.countDocuments()" --quiet 2>/dev/null | tail -1)
LIST_COUNT=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.lists.countDocuments()" --quiet 2>/dev/null | tail -1)
TODO_COUNT=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "db.todos.countDocuments()" --quiet 2>/dev/null | tail -1)

echo "   📊 Document Counts:"
echo "      - Users: $USER_COUNT"
echo "      - Lists: $LIST_COUNT"
echo "      - Todos: $TODO_COUNT"

if [ "$USER_COUNT" -gt 0 ] && [ "$LIST_COUNT" -gt 0 ] && [ "$TODO_COUNT" -gt 0 ]; then
    echo "   ✅ Seed Data: LOADED SUCCESSFULLY"
else
    echo "   ⚠️  Seed Data: PARTIALLY LOADED OR MISSING"
fi

# Test basic CRUD operations
echo ""
echo "🧪 CRUD Operations Test:"

# Test Create
CREATE_TEST=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
db.test_collection.insertOne({name: 'health_check', timestamp: new Date()});
db.test_collection.countDocuments({name: 'health_check'});
" --quiet 2>/dev/null | tail -1)

if [ "$CREATE_TEST" = "1" ]; then
    echo "   ✅ CREATE Operation: SUCCESS"
else
    echo "   ❌ CREATE Operation: FAILED"
fi

# Test Read
READ_TEST=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
db.test_collection.findOne({name: 'health_check'}) !== null
" --quiet 2>/dev/null | tail -1)

if [ "$READ_TEST" = "true" ]; then
    echo "   ✅ READ Operation: SUCCESS"
else
    echo "   ❌ READ Operation: FAILED"
fi

# Test Update
UPDATE_TEST=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
db.test_collection.updateOne({name: 'health_check'}, {\$set: {updated: true}});
db.test_collection.findOne({name: 'health_check', updated: true}) !== null
" --quiet 2>/dev/null | tail -1)

if [ "$UPDATE_TEST" = "true" ]; then
    echo "   ✅ UPDATE Operation: SUCCESS"
else
    echo "   ❌ UPDATE Operation: FAILED"
fi

# Test Delete
DELETE_TEST=$(sudo docker exec angular-todo-mongodb mongosh -u admin -p todopassword123 --authenticationDatabase admin tododb --eval "
db.test_collection.deleteMany({name: 'health_check'});
db.test_collection.countDocuments({name: 'health_check'});
" --quiet 2>/dev/null | tail -1)

if [ "$DELETE_TEST" = "0" ]; then
    echo "   ✅ DELETE Operation: SUCCESS"
else
    echo "   ❌ DELETE Operation: FAILED"
fi

# Check MongoDB UI accessibility
echo ""
echo "🌐 MongoDB UI Status:"
if curl -s --max-time 5 http://localhost:8081 >/dev/null 2>&1; then
    echo "   ✅ MongoDB Express UI: ACCESSIBLE at http://localhost:8081"
    echo "      Username: admin"
    echo "      Password: admin123"
else
    echo "   ❌ MongoDB Express UI: NOT ACCESSIBLE"
fi

# Connection strings
echo ""
echo "🔗 Connection Information:"
echo "   📝 MongoDB URI: mongodb://admin:todopassword123@localhost:27017/tododb"
echo "   🌐 MongoDB UI: http://localhost:8081"
echo "   🗄️  Database: tododb"
echo "   👤 Admin User: admin"

echo ""
echo "✅ MongoDB Health Check Complete!"
echo "================================"