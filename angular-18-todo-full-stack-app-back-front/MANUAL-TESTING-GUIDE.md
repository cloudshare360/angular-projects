# Manual Testing Guide - Angular Todo 3-Tier Application

**Created**: October 3, 2025
**Application**: MEAN Stack Todo Application
**Version**: 1.0.0
**Architecture**: MongoDB → Express.js → Angular 18

---

## 📋 Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [Layer-by-Layer Testing](#layer-by-layer-testing)
3. [Functional Test Scenarios](#functional-test-scenarios)
4. [Integration Testing](#integration-testing)
5. [Test Data](#test-data)
6. [Known Issues](#known-issues)

---

## 🔧 Test Environment Setup

### Prerequisites Checklist
- [ ] Docker installed and running
- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Angular CLI installed globally
- [ ] curl command available
- [ ] Ports available: 27017, 8081, 3000, 4200

### Environment Verification
```bash
# Check versions
docker --version          # Should be 20.10+
node --version           # Should be 18.0+
npm --version            # Should be 9.0+
ng version              # Should be 18.0+

# Check port availability
netstat -tuln | grep -E "27017|8081|3000|4200"
```

---

## 🏗️ Layer-by-Layer Testing

## Layer 1: Database Layer (MongoDB)

### 1.1 Start MongoDB Services
```bash
# Navigate to database directory
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front/data-base/mongodb

# Start MongoDB and MongoDB Express
sudo docker-compose up -d

# Wait for initialization
sleep 15
```

### 1.2 Verify MongoDB Container
```bash
# Test 1: Check container status
sudo docker ps | grep angular-todo-mongodb
# ✅ EXPECTED: Container running with status "Up"

# Test 2: Check MongoDB health
sudo docker exec angular-todo-mongodb mongosh --eval "db.adminCommand('ping')"
# ✅ EXPECTED: { ok: 1 }

# Test 3: Test authentication
sudo docker exec angular-todo-mongodb mongosh --eval "
  use admin;
  db.auth('admin', 'todopassword123');
  db.runCommand({listCollections: 1});
"
# ✅ EXPECTED: Authentication successful, list of collections returned
```

### 1.3 MongoDB Express UI Testing
```bash
# Test UI accessibility
curl -I http://localhost:8081
# ✅ EXPECTED: HTTP 200 OK

# Manual browser test
# Open: http://localhost:8081
# Credentials: admin / todopassword123
# ✅ VERIFY: Can see databases, collections, and documents
```

### 1.4 Database Structure Verification
```bash
# Connect to MongoDB
sudo docker exec -it angular-todo-mongodb mongosh

# Run these commands in mongosh:
use tododb
show collections
# ✅ EXPECTED: users, lists, todos collections exist

db.users.countDocuments()
# ✅ EXPECTED: At least 1 user exists

db.lists.countDocuments()
# ✅ EXPECTED: At least 1 list exists

db.todos.countDocuments()
# ✅ EXPECTED: At least 1 todo exists

# Exit mongosh
exit
```

**✅ DATABASE LAYER PASS CRITERIA:**
- All containers running
- MongoDB responding to ping
- Authentication working
- Collections created
- Seed data loaded

---

## Layer 2: Backend API Layer (Express.js)

### 2.1 Start Express.js API
```bash
# Navigate to backend directory
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front/Back-End

# Start the API server
npm start

# Keep this terminal open, API logs will appear here
```

### 2.2 Health Check Testing
```bash
# Open new terminal for testing

# Test 1: API Health Endpoint
curl http://localhost:3000/health
# ✅ EXPECTED: {"success":true,"data":{"database":"Connected",...}}

# Test 2: API Documentation
curl -I http://localhost:3000/api-docs
# ✅ EXPECTED: HTTP 200 OK

# Test 3: CORS Headers
curl -I http://localhost:3000/health
# ✅ EXPECTED: Access-Control-Allow-Origin header present
```

### 2.3 Authentication Endpoint Testing

#### Register New User
```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser001",
    "email": "testuser001@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# ✅ EXPECTED: {"success":true,"data":{"user":{...},"token":"eyJ..."}}
# ❌ FAIL: 400 error with validation message
# Save the token from response for next tests
```

#### Login User
```bash
# Test user login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "test@example.com",
    "password": "password123"
  }'

# ✅ EXPECTED: {"success":true,"data":{"user":{...},"token":"eyJ..."}}
# Save the JWT token for authenticated requests
```

#### Export Token
```bash
# Save token for subsequent requests
export TOKEN="<paste-token-here>"
```

### 2.4 User Management Testing
```bash
# Get current user profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users/profile
# ✅ EXPECTED: User profile JSON

# Update user profile
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }'
# ✅ EXPECTED: Updated user profile
```

### 2.5 List Management Testing
```bash
# Get all lists for current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/lists
# ✅ EXPECTED: Array of lists

# Create new list
curl -X POST http://localhost:3000/api/lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test List",
    "description": "Testing API",
    "color": "#3498db"
  }'
# ✅ EXPECTED: Created list object with ID
# Save list ID: export LIST_ID="<list-id>"

# Get specific list
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/lists/$LIST_ID
# ✅ EXPECTED: List details

# Update list
curl -X PUT http://localhost:3000/api/lists/$LIST_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated List Name"
  }'
# ✅ EXPECTED: Updated list

# Delete list (optional - skip for now to test todos)
# curl -X DELETE -H "Authorization: Bearer $TOKEN" \
#   http://localhost:3000/api/lists/$LIST_ID
```

### 2.6 Todo Management Testing
```bash
# Get all todos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/todos
# ✅ EXPECTED: Array of todos

# Create new todo
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Todo Item",
    "description": "Testing todo creation",
    "listId": "'$LIST_ID'",
    "priority": "medium",
    "dueDate": "2025-10-10T00:00:00Z"
  }'
# ✅ EXPECTED: Created todo object with ID
# Save todo ID: export TODO_ID="<todo-id>"

# Get todos for specific list
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/lists/$LIST_ID/todos
# ✅ EXPECTED: Array of todos in this list

# Update todo
curl -X PUT http://localhost:3000/api/todos/$TODO_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Todo Title",
    "isCompleted": true
  }'
# ✅ EXPECTED: Updated todo

# Toggle todo completion
curl -X PATCH http://localhost:3000/api/todos/$TODO_ID/toggle \
  -H "Authorization: Bearer $TOKEN"
# ✅ EXPECTED: Todo with toggled completion status

# Delete todo
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/todos/$TODO_ID
# ✅ EXPECTED: {"success":true,"message":"Todo deleted"}
```

**✅ BACKEND API PASS CRITERIA:**
- Server running on port 3000
- Health endpoint responding
- All CRUD endpoints accessible
- Authentication working
- JWT tokens generated and validated
- Database operations successful

---

## Layer 3: Frontend Application Layer (Angular 18)

### 3.1 Start Angular Development Server
```bash
# Navigate to frontend directory
cd /home/sri/Documents/angular-projects/angular-18-todo-full-stack-app-back-front/Front-End/angular-18-todo-app

# Start Angular dev server
npm start

# Wait for compilation (15-30 seconds)
# ✅ EXPECTED: "Angular Live Development Server is listening on localhost:4200"
```

### 3.2 Frontend Accessibility Testing
```bash
# Open new terminal for testing

# Test 1: Frontend accessible
curl -I http://localhost:4200
# ✅ EXPECTED: HTTP 200 OK

# Test 2: Main bundle loads
curl -I http://localhost:4200/main.js
# ✅ EXPECTED: HTTP 200 OK

# Test 3: Styles load
curl -I http://localhost:4200/styles.css
# ✅ EXPECTED: HTTP 200 OK

# Test 4: Proxy to backend working
curl http://localhost:4200/api/health
# ✅ EXPECTED: Same response as http://localhost:3000/health
```

### 3.3 Manual Browser Testing

#### Open Application
```
URL: http://localhost:4200
```

#### Test Scenario 1: User Registration Flow
```
Step 1: Access Application
- Open: http://localhost:4200
- ✅ VERIFY: Login page loads
- ✅ VERIFY: "Welcome Back" heading visible
- ✅ VERIFY: Email and password fields present
- ✅ VERIFY: "Sign up here" link visible

Step 2: Navigate to Registration
- Click: "Sign up here" link
- ✅ VERIFY: Redirected to /auth/register
- ✅ VERIFY: "Create Account" heading visible
- ✅ VERIFY: All fields present:
  - First Name
  - Last Name
  - Username
  - Email
  - Password

Step 3: Fill Registration Form
- First Name: "Manual"
- Last Name: "Tester"
- Username: "manualtester001"
- Email: "manual@test.com"
- Password: "Test123!"

Step 4: Submit Registration
- Click: "Create Account" button
- ✅ EXPECTED: Redirect to dashboard
- ❌ ACTUAL: Stays on registration page
- ⚠️ ISSUE: Registration not completing properly
```

#### Test Scenario 2: User Login Flow
```
Step 1: Access Login Page
- Open: http://localhost:4200/auth/login
- ✅ VERIFY: Login form loads

Step 2: Fill Login Form
- Email: "test@example.com"
- Password: "password123"

Step 3: Submit Login
- Click: "Sign In" button
- ✅ EXPECTED: Redirect to /dashboard
- ❌ ACTUAL: Stays on login page with error
- ❌ ERROR: "An error occurred. Please try again."
- ⚠️ ISSUE: Login not working - root cause identified below
```

#### Test Scenario 3: Direct Dashboard Access
```
Step 1: Try accessing dashboard without login
- Open: http://localhost:4200/dashboard
- ✅ VERIFY: Redirected to /auth/login
- ✅ PASS: Auth guard working
```

**✅ FRONTEND LAYER PASS CRITERIA:**
- Server running on port 4200
- Application loads in browser
- All routes accessible
- Components render correctly
- Forms functional
- API integration working

---

## 🔗 Integration Testing

### Full Stack User Journey Test

#### Prerequisites
```bash
# Ensure all services running
curl http://localhost:3000/health && \
curl -s http://localhost:4200 > /dev/null && \
echo "✅ All services ready"
```

#### Journey 1: New User Complete Workflow
```
1. Open application: http://localhost:4200
   ✅ VERIFY: Login page loads

2. Click "Sign up here"
   ✅ VERIFY: Registration page loads

3. Fill registration form:
   - First Name: "Integration"
   - Last Name: "Test"
   - Username: "inttest001"
   - Email: "int@test.com"
   - Password: "IntTest123!"

4. Submit registration
   ⚠️ ISSUE: Registration may not redirect properly

5. If registration fails, use existing user for login:
   - Email: "test@example.com"
   - Password: "password123"

6. Submit login
   ❌ ISSUE: Login not redirecting to dashboard

7. Check browser console for errors
   - Open DevTools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for API call failures
```

#### Journey 2: Existing User Workflow
```
1. Login with test credentials
2. Verify dashboard loads
3. Create new todo list
4. Add todos to list
5. Mark todos as complete
6. Edit todo items
7. Delete todo items
8. Delete list
9. Logout
```

---

## 📝 Test Data

### Pre-loaded Test Users
```javascript
{
  email: "test@example.com",
  password: "password123",
  username: "testuser"
}

{
  email: "admin@example.com",
  password: "admin123",
  username: "admin"
}
```

### Sample List Data
```javascript
{
  name: "Work Tasks",
  description: "Professional todo items",
  color: "#3498db"
}
```

### Sample Todo Data
```javascript
{
  title: "Complete project documentation",
  description: "Write comprehensive user guide",
  priority: "high",
  dueDate: "2025-10-15T00:00:00Z",
  isCompleted: false
}
```

---

## 🐛 Known Issues

### Critical Issues

#### Issue 1: Login Not Redirecting ⚠️ CRITICAL
**Status**: Identified
**Impact**: Users cannot login to application
**Root Cause**: Proxy configuration was incorrect (`secure: true` for HTTP)
**Fix Applied**: Changed `proxy.conf.json` to `secure: false`
**Status**: Fixed - requires Angular dev server restart
**Workaround**: None - must fix proxy
**Priority**: P0 - Blocking all functionality

#### Issue 2: Registration Not Creating Users
**Status**: Under investigation
**Impact**: New users cannot register
**Symptoms**: Form submits but no redirect, no user created
**Next Steps**: Check backend logs, verify API endpoint

### Medium Issues

#### Issue 3: Dashboard UI Components Missing
**Status**: Identified
**Impact**: Cannot create lists/todos from UI
**Symptoms**: Buttons not found in tests
**Next Steps**: Verify Material Dialog components imported

#### Issue 4: Logout Functionality Missing
**Status**: Identified
**Impact**: Users cannot logout
**Symptoms**: No logout button visible
**Next Steps**: Verify button added with data-testid attribute

---

## ✅ Test Execution Checklist

### Before Testing
- [ ] All services started in correct order
- [ ] MongoDB container running
- [ ] Express API responding
- [ ] Angular app accessible
- [ ] Test credentials available

### Database Layer
- [ ] MongoDB container healthy
- [ ] MongoDB Express UI accessible
- [ ] Collections exist
- [ ] Seed data loaded
- [ ] CRUD operations work

### Backend API Layer
- [ ] Server running on port 3000
- [ ] Health check passing
- [ ] Authentication endpoints working
- [ ] User management working
- [ ] List management working
- [ ] Todo management working
- [ ] JWT tokens generated

### Frontend Layer
- [ ] Server running on port 4200
- [ ] Application loads in browser
- [ ] Login page renders
- [ ] Registration page renders
- [ ] Dashboard page renders
- [ ] Forms functional
- [ ] Routing working

### Integration
- [ ] Full user registration flow
- [ ] Full user login flow
- [ ] Dashboard access
- [ ] Create/Read/Update/Delete operations
- [ ] Logout flow

---

## 📊 Test Results Template

### Test Session Information
```
Date: ___________
Tester: ___________
Environment: Development/Staging/Production
Build Version: ___________
```

### Test Results
| Test ID | Test Case | Expected | Actual | Status | Notes |
|---------|-----------|----------|--------|--------|-------|
| DB-01 | MongoDB Container | Running | | ☐ Pass ☐ Fail | |
| DB-02 | Database Connection | Connected | | ☐ Pass ☐ Fail | |
| API-01 | Health Endpoint | 200 OK | | ☐ Pass ☐ Fail | |
| API-02 | User Registration | Token | | ☐ Pass ☐ Fail | |
| API-03 | User Login | Token | | ☐ Pass ☐ Fail | |
| FE-01 | App Loads | 200 OK | | ☐ Pass ☐ Fail | |
| FE-02 | Login Page | Renders | | ☐ Pass ☐ Fail | |
| INT-01 | Login Flow | Dashboard | | ☐ Pass ☐ Fail | |

### Issues Found
```
Issue #: ___________
Severity: Critical/Major/Minor
Description: ___________
Steps to Reproduce: ___________
Expected: ___________
Actual: ___________
```

---

## 📚 Additional Resources

### API Documentation
- Swagger UI: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

### Database UI
- MongoDB Express: http://localhost:8081
- Credentials: admin / todopassword123

### Application URLs
- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Database: localhost:27017

### Log Files
- Backend logs: Console output from npm start
- Frontend logs: Console output from npm start
- Browser logs: Browser DevTools Console

---

**Document Version**: 1.0
**Last Updated**: October 3, 2025
**Next Review**: After proxy fix applied
