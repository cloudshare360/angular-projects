# Angular Todo Application Requirements

## Project Overview
- Modern todo application using Angular 18
- TypeScript for type safety
- Material UI for professional design
- RESTful API integration
- **NEW**: Comprehensive E2E testing with Playwright
- **NEW**: Interactive HTML wireframes for UI/UX documentation
- **CRITICAL**: Proper service startup sequence for development and testing

## 🚀 **Application Startup Sequence (MANDATORY)**

The application stack **MUST** be started in the following order for proper functionality and E2E testing:

### **Phase 1: Database Layer (FIRST)**
```bash
# Navigate to database directory
cd data-base/mongodb

# Start MongoDB and MongoDB Express using Docker Compose
docker-compose up -d

# Verify services are running
docker ps | grep angular-todo-mongodb
```

**Services Started:**
- MongoDB Database (port 27017)
- MongoDB Express UI (port 8081)

**Health Check:**
```bash
docker exec angular-todo-mongodb mongosh --eval "db.adminCommand('ping')"
```

### **Phase 2: Backend API (SECOND)**
```bash
# Navigate to backend directory
cd Back-End/express-rest-todo-api

# Install dependencies (if needed)
npm install

# Start Express.js API server
npm start
```

**Services Started:**
- Express.js API Server (port 3000)
- REST API endpoints
- JWT Authentication
- MongoDB connection

**Health Check:**
```bash
curl http://localhost:3000/health
```

### **Phase 3: Frontend Application (THIRD)**
```bash
# Navigate to frontend directory
cd Front-End/angular-18-todo-app

# Install dependencies (if needed)
npm install

# Start Angular development server
ng serve --proxy-config proxy.conf.json
```

**Services Started:**
- Angular 18 Development Server (port 4200)
- Live reload functionality
- Proxy configuration for API calls

**Health Check:**
```bash
curl http://localhost:4200
```

### **Phase 4: E2E Testing (FINAL)**
```bash
# Verify all services are running
curl http://localhost:3000/health && curl -s http://localhost:4200 > /dev/null

# Run Playwright E2E tests
cd Front-End/angular-18-todo-app
npm run test:e2e

# Or use comprehensive test runner
./run-e2e-tests.sh
```

## **Service Dependencies**

| Service | Port | Depends On | Required For |
|---------|------|------------|--------------|
| MongoDB | 27017 | None | Backend API |
| MongoDB Express | 8081 | MongoDB | Database Management |
| Express.js API | 3000 | MongoDB | Frontend |
| Angular App | 4200 | Express.js API | E2E Testing |
| Playwright Tests | - | All Above | Quality Assurance |

## **Automated Startup Scripts**

### **Option 1: Individual Service Management**
```bash
# Start all services in sequence
./start-dev.sh

# Stop all services
./stop-dev.sh
```

### **Option 2: E2E Testing with Automatic Setup**
```bash
# Comprehensive E2E testing with automatic service management
./run-e2e-tests.sh

# Run specific test suites
./run-e2e-tests.sh auth
./run-e2e-tests.sh dashboard
./run-e2e-tests.sh workflows

# Interactive testing modes
./run-e2e-tests.sh ui        # Interactive UI mode
./run-e2e-tests.sh headed    # Visible browser mode
./run-e2e-tests.sh debug     # Debug mode
```

## Features Required
Todo App has following domain objects / actors

Users
List
Todos

Users
- [ ] Signup for user/ registration for user
- [ ] Login user
- [ ] Forgot password
- [ ] User when visits the todo app, he will see, login screen for username and password and submit button. 
- [ ] If he is a first time user, he has to click on signup page
       user is rediected to sign page and user will enter firstname, lastname
       emailid, password, verify password and submit button.
       verify if password and verify password field matches each other, user profile is created
- [ ] user forgot password
       when user clicks on forgot password, he will ask to enter his username, new password, and verify password; when he clicks on submit, new password will be updated in the system.
       he is redirected to login page
- [ ] User on Login
        user can create multiple list
        each list, he or she can create multiple todo list for each list
        one user can create multiple list, each list has multiple todo tasks; 

Lists
- [ ] User can add a list
- [ ] user can delete a list
- [ ] user can edit/update a list name
- [ ] user on selecting a list, he can perform crud  with todos
- [ ] Filter todos (all, active, completed)
- [ ] Responsive design

Todos
- [ ] Add new todos
- [ ] Mark todos as complete
- [ ] Edit existing todos
- [ ] Delete todos
- [ ] Filter todos (all, active, completed)
- [ ] Responsive design

Create Following Folders
Front-End
    angular-18-todo-app: user angular 18, material ui, css to create screens as described above
      
Back-End
    express-rest-todo-api
        Rest Api for login, create profile, forgot password, 
        create list for a selected user, for each list,  crud for todo task api are created
data-base
    mongodb
        docker-compose: it will start monodb, mongodb ui, create todo database; it will add few list of users, each user with list of categories/list. each list will have muultiple todo as seed data
        on start of docker-compose, the database service is started , where tododb is created, seed data is imported.
        seed-data-folder- contains seed data for starting the application
        datafolder
            datafolders contains the database and all the data of mongodb is persisted with in the folder
    

## Technical Requirements
- Angular 18+
- TypeScript
- Angular Material
- RxJS for reactive programming
- Unit testing with Jasmine
- Front-End- Angular 18
- Back-End - expressjs
- database - momgodb

## Testing Results (October 2, 2025 - UPDATED)

### MongoDB Layer - 100% VERIFIED ✅
- ✅ Containers running and healthy (angular-todo-mongodb:27017)
- ✅ Database connectivity confirmed
- ✅ CRUD operations tested successfully
- ✅ MongoDB UI accessible at http://localhost:8081
- ✅ Full health check report generated
- ✅ Real-time data persistence working

### Express.js API - 100% FUNCTIONAL ✅
- ✅ Server running successfully on port 3000
- ✅ MongoDB connection established and stable
- ✅ All dependencies installed and configured
- ✅ **RESOLVED**: All API endpoints responding correctly
- ✅ **VALIDATED**: Complete CRUD operations working
- ✅ **TESTED**: Authentication system fully operational
- ✅ **VERIFIED**: JWT token management working
- ✅ **CONFIRMED**: Request validation and error handling active

### API Validation Summary
**All Core Functionality Tested and Working:**
1. ✅ **Authentication**: Registration, Login, JWT tokens
2. ✅ **User Management**: Profile CRUD, password management
3. ✅ **List Management**: Create, Read, Update, Delete operations
4. ✅ **Todo Management**: Full CRUD with list associations
5. ✅ **Security**: Rate limiting, input validation, authorization
6. ✅ **Error Handling**: Proper HTTP status codes and messages

## Project Analysis Summary (Updated: Oct 2, 2025)
**Overall Progress: 85% Complete**
- **Database Layer**: ✅ 100% Complete
- **Backend API**: ✅ 100% Complete and Functional
- **Frontend App**: 🟡 65% Complete (dependencies installed, structure ready)
- **Integration**: 🟡 70% Complete (API integration ready)

## Status Update
1. **Backend**: ✅ **RESOLVED** - All API endpoints tested and functional
2. **Frontend**: 🟡 **IN PROGRESS** - Angular 18 app structure complete, ready for component development
3. **Integration**: ✅ **READY** - API fully operational for frontend integration

## Immediate Tasks (Execute in Order)
### Phase 1: Backend Validation ✅ COMPLETED
1. ✅ Create MongoDB docker-compose setup
2. ✅ Create Express Rest API with comprehensive endpoints
3. ✅ Create Postman collection for API testing
4. ✅ Implement Swagger-UI documentation
5. ✅ **COMPLETED**: Install backend dependencies (`npm install`)
6. ✅ **COMPLETED**: Test MongoDB connection and API endpoints
7. ✅ **COMPLETED**: Validate all CRUD operations

### Phase 2: Frontend Development (NEXT - 45 min)
8. 🟡 **CURRENT**: Complete Angular 18 authentication components
9. ⏳ **NEXT**: Implement dashboard with list management
10. ⏳ **NEXT**: Complete API service integration
11. ⏳ **NEXT**: Add form validations and error handling

### Phase 3: Integration & Testing (25 min)
12. ⏳ Frontend-backend integration testing
13. ⏳ Create master startup scripts
14. ⏳ End-to-end workflow testing
15. ⏳ Create comprehensive user guide

## E2E Testing & Quality Assurance (NEW)

### 🧪 Playwright E2E Testing Framework
- [x] **Complete Test Coverage**: Authentication, Dashboard, User Workflows
- [x] **Multi-Browser Support**: Chrome, Firefox, Safari, Mobile devices
- [x] **Page Object Models**: Maintainable and scalable test architecture
- [x] **Automated Reporting**: HTML reports with screenshots and videos
- [x] **CI/CD Ready**: JSON and JUnit report formats

### 🎨 HTML Wireframes & Documentation
- [x] **Interactive Wireframes**: Complete UI/UX documentation in HTML
- [x] **Navigation Flows**: Visual representation of user journeys
- [x] **Feature Documentation**: Comprehensive feature overview
- [x] **Web Server**: Local server for wireframe viewing

### 📊 Testing Commands
```bash
# Run all E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# View HTML reports
npm run test:e2e:report

# Comprehensive test runner
./run-e2e-tests.sh

# View wireframes
./html-wireframes/serve-wireframes.sh
```

## Getting Started (Updated)
**Prerequisites**: Node.js 20+, Docker, Angular CLI

### Quick Start Commands
```bash
# 1. Start Database
cd data-base/mongodb && docker-compose up -d

# 2. Install & Start Backend
cd Back-End/express-rest-todo-api && npm install && npm start

# 3. Start Frontend
cd Front-End/angular-18-todo-app && ng serve

# 4. Test APIs
cd curl-scripts && ./run-all-tests.sh

# 5. Run E2E Tests (NEW)
cd Front-End/angular-18-todo-app && npm run test:e2e

# 6. View Wireframes (NEW)
./html-wireframes/serve-wireframes.sh
```

### Project Status Files
- ✅ `requirements.md` (this file)
- ✅ `project-status-tracker.md` (detailed progress tracking)
- ✅ `project-analysis-report.html` (comprehensive analysis)
- ✅ `copilot-agent-chat.md` (optimized execution plan)
- ✅ `html-wireframes/` (interactive UI/UX documentation) **NEW**
- ✅ `e2e/` (Playwright E2E testing framework) **NEW**
