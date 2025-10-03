# Service Startup Guide - Angular Todo 3-Tier Application

**Created**: October 3, 2025
**Application**: MEAN Stack Todo Application
**Architecture**: MongoDB → Express.js REST API → Angular 18 Frontend

---

## 📋 Quick Reference

### Service Overview
| Layer | Service | Port | Startup Time | Health Check |
|-------|---------|------|--------------|--------------|
| Database | MongoDB | 27017 | 10-15s | `docker exec angular-todo-mongodb mongosh --eval "db.adminCommand('ping')"` |
| Database UI | MongoDB Express | 8081 | 10-15s | `curl http://localhost:8081` |
| Backend | Express.js API | 3000 | 5-10s | `curl http://localhost:3000/health` |
| Frontend | Angular 18 | 4200 | 15-30s | `curl http://localhost:4200` |

### Access Points
- **Application**: http://localhost:4200
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Database UI**: http://localhost:8081 (admin / todopassword123)

---

## 🚀 Method 1: Automated Startup (RECOMMENDED)

### Option A: Use Master Startup Script
```bash
# Navigate to project root
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front

# Start all services in correct sequence
./start-dev.sh

# This script will:
# 1. Check prerequisites
# 2. Start MongoDB (with 15s wait)
# 3. Start Express API (with 10s wait)
# 4. Start Angular app (with 20s wait)
# 5. Verify all services healthy
# 6. Display access points

# ✅ Expected output: "ALL SERVICES ARE HEALTHY AND READY!"
```

### Option B: Use E2E Test Runner (Includes Service Management)
```bash
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front

# This will start services AND run E2E tests
./run-e2e-tests.sh

# Features:
# - Automatic service startup in correct order
# - Health checks at each layer
# - Comprehensive E2E testing
# - Automated reporting
# - Cleanup on exit
```

### Stopping All Services
```bash
# Option 1: Use stop script
./stop-dev.sh

# Option 2: Manual cleanup
pkill -f "ng serve"
pkill -f "node.*express"
cd data-base/mongodb && sudo docker-compose down
```

---

## 🔧 Method 2: Manual Service Startup (Step-by-Step)

### Phase 1: Start Database Layer (FIRST)

#### Step 1.1: Navigate to Database Directory
```bash
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front/data-base/mongodb
```

#### Step 1.2: Start Docker Containers
```bash
# Start MongoDB and MongoDB Express
sudo docker-compose up -d

# Expected output:
# Creating network "mongodb_default"
# Creating angular-todo-mongodb ... done
# Creating angular-todo-mongo-ui ... done
```

#### Step 1.3: Wait for Database Initialization
```bash
# Wait 15 seconds for MongoDB to fully initialize
sleep 15

# Alternatively, watch logs until "Waiting for connections"
sudo docker logs -f angular-todo-mongodb
# Press Ctrl+C when you see "Waiting for connections on port 27017"
```

#### Step 1.4: Verify MongoDB is Running
```bash
# Test 1: Check container status
sudo docker ps | grep angular-todo-mongodb
# ✅ EXPECTED: Container with status "Up"

# Test 2: Test MongoDB connection
sudo docker exec angular-todo-mongodb mongosh --eval "db.adminCommand('ping')"
# ✅ EXPECTED: { ok: 1 }

# Test 3: Test authentication
sudo docker exec angular-todo-mongodb mongosh --eval "
  use admin;
  db.auth('admin', 'todopassword123');
  print('✅ Authentication successful');
"

# Test 4: Check MongoDB Express UI
curl -I http://localhost:8081
# ✅ EXPECTED: HTTP 200 OK

# Test 5: Verify collections exist
sudo docker exec angular-todo-mongodb mongosh --eval "
  use tododb;
  db.getCollectionNames();
"
# ✅ EXPECTED: ['users', 'lists', 'todos']
```

**✅ Phase 1 Complete**: Database layer ready
**Next**: Proceed to Phase 2

---

### Phase 2: Start Backend API Layer (SECOND)

⚠️ **IMPORTANT**: Do NOT start backend until MongoDB is fully running!

#### Step 2.1: Open New Terminal Window
```bash
# Keep MongoDB terminal open for logs
# Open new terminal for backend
```

#### Step 2.2: Navigate to Backend Directory
```bash
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front/Back-End
```

#### Step 2.3: Verify Dependencies Installed
```bash
# Check if node_modules exists
ls node_modules > /dev/null 2>&1 && echo "✅ Dependencies installed" || echo "❌ Run npm install"

# If needed, install dependencies
npm install
```

#### Step 2.4: Start Express.js API Server
```bash
# Start the server
npm start

# Expected console output:
# > express-rest-todo-api@1.0.0 start
# > node src/server.js
#
# [INFO] 🚀 Server starting...
# [INFO] 📊 Environment: development
# [INFO] 🗄️ Connecting to MongoDB...
# [SUCCESS] ✅ MongoDB Connected Successfully
# [SUCCESS] 🎉 Server running on http://localhost:3000
# [INFO] 📚 API Documentation: http://localhost:3000/api-docs
# [INFO] ❤️ Health Check: http://localhost:3000/health
```

#### Step 2.5: Keep Backend Terminal Open
```bash
# DO NOT CLOSE THIS TERMINAL
# Backend logs will appear here
# You'll see API request logs as they happen
```

#### Step 2.6: Verify Backend is Running (New Terminal)
```bash
# Open another new terminal for testing

# Test 1: Health check
curl http://localhost:3000/health
# ✅ EXPECTED: {"success":true,"data":{"database":"Connected"...}}

# Test 2: Check database connection in response
curl -s http://localhost:3000/health | grep -q '"database":"Connected"' && \
  echo "✅ Database connected" || echo "❌ Database not connected"

# Test 3: API documentation accessible
curl -I http://localhost:3000/api-docs
# ✅ EXPECTED: HTTP 200 OK

# Test 4: Test authentication endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"test":"connectivity"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -o /dev/null -s
# ✅ EXPECTED: HTTP Status: 400 (endpoint exists, just bad request data)

# Test 5: Comprehensive API test
cd ../curl-scripts
./run-all-tests.sh
# ✅ EXPECTED: Most tests passing
```

**✅ Phase 2 Complete**: Backend API ready
**Next**: Proceed to Phase 3

---

### Phase 3: Start Frontend Application Layer (THIRD)

⚠️ **IMPORTANT**: Do NOT start frontend until backend API is fully running!

#### Step 3.1: Open New Terminal Window
```bash
# Keep backend terminal open for logs
# Open new terminal for frontend
```

#### Step 3.2: Navigate to Frontend Directory
```bash
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front/Front-End/angular-18-todo-app
```

#### Step 3.3: Verify Dependencies Installed
```bash
# Check if node_modules exists
ls node_modules > /dev/null 2>&1 && echo "✅ Dependencies installed" || echo "❌ Run npm install"

# If needed, install dependencies
npm install
```

#### Step 3.4: Verify Proxy Configuration (CRITICAL)
```bash
# Check proxy config
cat proxy.conf.json

# ✅ MUST HAVE: "secure": false
# ❌ If you see "secure": true, fix it:
cat > proxy.conf.json << 'EOF'
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
EOF
```

#### Step 3.5: Start Angular Development Server
```bash
# Start the dev server with proxy config
npm start

# OR use ng serve directly:
ng serve --proxy-config proxy.conf.json

# Expected console output:
# ❯ Building...
# ✔ Browser application bundle generation complete.
# Initial chunk files | Names | Raw size
# ...
# Application bundle generation complete. [X.XXX seconds]
#
# Watch mode enabled. Watching for file changes...
# ➜  Local:   http://localhost:4200/

# ⚠️ WAIT: Compilation takes 15-30 seconds
# Don't access app until you see "Local: http://localhost:4200/"
```

#### Step 3.6: Wait for Compilation
```bash
# Wait for these messages:
# ✔ Building...
# Application bundle generation complete.
# ➜  Local:   http://localhost:4200/

# Initial compilation: 15-30 seconds
# Subsequent rebuilds: 1-5 seconds
```

#### Step 3.7: Verify Frontend is Running (New Terminal)
```bash
# Open another new terminal for testing

# Test 1: Frontend accessible
curl -I http://localhost:4200
# ✅ EXPECTED: HTTP 200 OK

# Test 2: Main bundle loaded
curl -I http://localhost:4200/main.js
# ✅ EXPECTED: HTTP 200 OK

# Test 3: Proxy to backend working
curl -s http://localhost:4200/api/health | grep -q "success" && \
  echo "✅ Proxy working" || echo "❌ Proxy failed"

# Test 4: Compare direct API vs proxied API
echo "Direct API:"
curl -s http://localhost:3000/health | grep -o '"database":"[^"]*"'
echo "Proxied API:"
curl -s http://localhost:4200/api/health | grep -o '"database":"[^"]*"'
# ✅ EXPECTED: Both should show same database status

# Test 5: Angular app content
curl -s http://localhost:4200 | grep -q "<app-root>" && \
  echo "✅ Angular components loaded" || echo "❌ Angular failed to load"
```

**✅ Phase 3 Complete**: Frontend application ready
**Next**: Open browser and test

---

### Phase 4: Verify Complete Stack

#### All Services Health Check
```bash
echo "=== COMPLETE STACK HEALTH CHECK ===" && \
echo "" && \
echo "1. MongoDB:" && \
sudo docker exec angular-todo-mongodb mongosh --eval "db.adminCommand('ping')" 2>&1 | grep -q "ok: 1" && \
echo "   ✅ MongoDB: Healthy" || echo "   ❌ MongoDB: Failed" && \
echo "" && \
echo "2. MongoDB Express UI:" && \
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:8081 && \
echo "" && \
echo "3. Express.js API:" && \
curl -s http://localhost:3000/health | python3 -m json.tool | head -5 && \
echo "" && \
echo "4. Angular Frontend:" && \
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:4200 && \
echo "" && \
echo "5. Proxy Configuration:" && \
curl -s http://localhost:4200/api/health | grep -q "success" && \
echo "   ✅ Proxy: Working" || echo "   ❌ Proxy: Failed" && \
echo "" && \
echo "=== STACK READY FOR TESTING ==="
```

#### Access Points Summary
```bash
cat << 'EOF'

╔══════════════════════════════════════════════════════════╗
║           🎉 ALL SERVICES RUNNING SUCCESSFULLY          ║
╚══════════════════════════════════════════════════════════╝

📱 APPLICATION ACCESS POINTS:
   ├─ 🌐 Web App:         http://localhost:4200
   ├─ 🔌 API Server:      http://localhost:3000
   ├─ 📚 API Docs:        http://localhost:3000/api-docs
   ├─ 🗄️  Database UI:     http://localhost:8081
   └─ ❤️  Health Check:    http://localhost:3000/health

🔐 DATABASE CREDENTIALS:
   ├─ Username: admin
   └─ Password: todopassword123

🧪 TEST CREDENTIALS:
   ├─ Email:    test@example.com
   └─ Password: password123

📝 PROCESS IDs (for stopping services):
   ├─ MongoDB:  docker ps | grep angular-todo-mongodb
   ├─ Backend:  ps aux | grep "node.*express"
   └─ Frontend: ps aux | grep "ng serve"

🛑 TO STOP SERVICES:
   └─ Run: ./stop-dev.sh
      OR manually:
      1. Ctrl+C in backend terminal
      2. Ctrl+C in frontend terminal
      3. cd data-base/mongodb && sudo docker-compose down

EOF
```

---

## 🧪 Testing the Stack

### Test in Browser
```bash
# Open your default browser
xdg-open http://localhost:4200  # Linux
# OR
open http://localhost:4200      # Mac
# OR
start http://localhost:4200     # Windows

# Manual browser test:
# 1. Should see login page
# 2. Click "Sign up here" → Should see registration page
# 3. Try logging in with test@example.com / password123
```

### Run Automated E2E Tests
```bash
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front/Front-End/angular-18-todo-app

# Run all E2E tests
npm run test:e2e

# Run specific test suite
npx playwright test auth.spec.ts --project=chromium

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Container Won't Start
```bash
# Check if port 27017 is already in use
sudo netstat -tuln | grep 27017

# If port in use, find and kill the process
sudo lsof -i :27017
sudo kill -9 <PID>

# Remove old containers and try again
cd data-base/mongodb
sudo docker-compose down -v
sudo docker-compose up -d
```

### Issue: Backend Can't Connect to MongoDB
```bash
# Verify MongoDB is actually running
sudo docker ps | grep mongodb

# Check MongoDB logs
sudo docker logs angular-todo-mongodb | tail -20

# Test MongoDB connection manually
sudo docker exec -it angular-todo-mongodb mongosh

# In mongosh:
use tododb
db.users.count()
exit
```

### Issue: Backend Port 3000 Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or use a different port (update in .env or config)
```

### Issue: Frontend Won't Compile
```bash
# Clear node_modules and reinstall
cd Front-End/angular-18-todo-app
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
rm -rf .angular

# Try starting again
npm start
```

### Issue: Proxy Not Working
```bash
# Check proxy configuration
cat proxy.conf.json

# Should be:
# "secure": false (NOT true)

# Fix if needed:
cat > proxy.conf.json << 'EOF'
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
EOF

# Restart Angular server (Ctrl+C and npm start again)
```

### Issue: Services Running But Can't Access
```bash
# Check firewall isn't blocking ports
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 4200
sudo ufw allow 8081

# Check if bound to correct interface
netstat -tuln | grep -E "3000|4200|8081"
# Should show 0.0.0.0:PORT or *:PORT, not 127.0.0.1:PORT
```

---

## 📋 Service Management Cheat Sheet

### Start Services
```bash
# Database
cd data-base/mongodb && sudo docker-compose up -d

# Backend (in new terminal)
cd Back-End && npm start

# Frontend (in new terminal)
cd Front-End/angular-18-todo-app && npm start
```

### Stop Services
```bash
# Frontend
Ctrl+C in frontend terminal

# Backend
Ctrl+C in backend terminal

# Database
cd data-base/mongodb && sudo docker-compose down
```

### Restart Services
```bash
# Restart backend only
Ctrl+C in backend terminal
npm start

# Restart frontend only
Ctrl+C in frontend terminal
npm start

# Restart database
cd data-base/mongodb
sudo docker-compose restart
```

### View Logs
```bash
# Backend logs - shown in terminal where npm start was run

# Frontend logs - shown in terminal where npm start was run

# MongoDB logs
sudo docker logs angular-todo-mongodb

# Follow MongoDB logs
sudo docker logs -f angular-todo-mongodb

# MongoDB Express logs
sudo docker logs angular-todo-mongo-ui
```

### Check Service Status
```bash
# All at once
./check-services.sh

# Individual checks
sudo docker ps | grep mongo  # Database
curl http://localhost:3000/health  # Backend
curl -I http://localhost:4200  # Frontend
```

---

## 🎯 Quick Commands Reference

```bash
# START EVERYTHING (Automated)
./start-dev.sh

# STOP EVERYTHING
./stop-dev.sh

# CHECK ALL SERVICES
curl http://localhost:3000/health && curl -s http://localhost:4200 > /dev/null && echo "✅ Ready"

# RUN E2E TESTS
cd Front-End/angular-18-todo-app && npm run test:e2e

# VIEW API DOCS
xdg-open http://localhost:3000/api-docs

# VIEW DATABASE
xdg-open http://localhost:8081

# VIEW APPLICATION
xdg-open http://localhost:4200
```

---

**Document Version**: 1.0
**Last Updated**: October 3, 2025
**Maintained By**: Development Team
