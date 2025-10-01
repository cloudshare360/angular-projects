# Angular 18 Todo Full Stack Application Requirements

## 1. Overview
This document outlines the requirements for developing a full-stack Todo application using Angular 18, Express.js, and MongoDB with role-based access control.

## 2. User Management & Authentication

### 2.1 User Roles
- **User**: Standard user with limited permissions
- **Admin**: Administrative user with extended permissions

### 2.2 User Registration (Sign-up)
**Required Fields:**
- Username
- Password
- Confirm Password
- Email ID
- First Name
- Last Name
- Role Type (User/Admin)

**Process:**
- New users register through sign-up page
- Upon successful registration, redirect to login page with success message
- User account created in database

### 2.3 User Authentication (Login)
**Login Form Features:**
- Username and password input fields
- Submit button for authentication
- Link to sign-up page for new users
- Link to forgot password functionality
- Separate admin login option

**Authentication Flow:**
- Validate credentials against database
- Successful login redirects to homepage
- Invalid credentials display error message and remain on login page
- Role-based redirection based on user type

## 3. Authorization & Permissions

### 3.1 User Permissions
- Update own profile details
- Create and manage personal todo categories
- Create and manage todo items within categories
- View only own todos and categories

### 3.2 Admin Permissions
- All user permissions
- Activate/deactivate user profiles
- Update any user's profile details
- **Cannot** view user todos or categories (privacy protection)

## 4. Todo Management System

### 4.1 Category Management
- Users can create multiple todo categories
- Each category belongs to a specific user
- Categories serve as organizational containers for todos

### 4.2 Todo Item Management
- Users can create multiple todo items per category
- Todo items are associated with specific categories
- Users can only manage their own todos

## 5. Technical Architecture

### 5.1 Frontend - Angular 18
**Location:** `angular-18-front-end/`
- **Angular Version:** 18.2.14
- **Angular CLI:** 18.2.21
- **Node.js:** 22.19.0
- **npm:** 10.9.3
- **TypeScript:** 5.5.4
- CSS for styling (no server-side rendering)
- Component-based architecture
- Role-based routing and guards
- RxJS 7.8.2 for reactive programming
- Standalone components (Angular 18 feature)

### 5.2 Backend - Express.js
**Location:** `express-js-back-end/`
- REST API endpoints
- Authentication middleware
- Role-based authorization
- Data validation and sanitization

### 5.3 Database - MongoDB
**Location:** `mongo-db-database/`
- Docker Compose setup
- MongoDB database container
- MongoDB Express for database administration

### 5.4 Mock Data Server (Development)
**Location:** `angular-18-front-end/db.json`
- **JSON Server:** v0.17.4 for rapid prototyping
- **Port:** 3000 (http://localhost:3000)
- **Data Collections:** users, categories, todos, auth
- **Scripts:**
  - `npm run json-server` - Start JSON server only
  - `npm run dev` - Start both Angular app and JSON server concurrently
- **Features:**
  - Full CRUD operations support
  - RESTful API simulation
  - Real-time data persistence
  - CORS enabled for Angular integration

### 5.5 API Testing
**Location:** `postman-script/`
- Postman collection for all REST endpoints
- Test scenarios for different user roles
- Authentication and authorization tests

## 6. Database Schema

### 6.1 User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  email: String,
  firstName: String,
  lastName: String,
  roleType: String (enum: ['user', 'admin']),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6.2 Category Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 6.3 Todo Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  completed: Boolean,
  priority: String,
  categoryId: ObjectId (ref: Category),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 6.4 Relationships
- User → Categories (1:Many)
- Category → Todos (1:Many)
- User → Todos (1:Many, through categories)

## 7. Development Execution Order (Updated: Frontend-First Approach)

**Strategy:** Complete entire frontend application first, then build backend, then end-to-end testing.

### Phase 1: Frontend Development (Presentation Tier) - IN PROGRESS

#### 1.1 Foundation Setup ✅ COMPLETED
   - ✅ Angular 18 Project initialization with Angular CLI
   - ✅ Folder structure and component architecture
   - ✅ Routing configuration with guards
   - ✅ JSON Server setup with mock data
   - ✅ Development scripts (json-server, dev)

#### 1.2 Authentication & Core Features ✅ COMPLETED
   - ✅ Login component with form validation
   - ✅ Registration component
   - ✅ Role-based navigation
   - ✅ Authentication guards
   - ✅ User dashboard with statistics

#### 1.3 Todo Management ✅ COMPLETED
   - ✅ Todo CRUD operations (Create, Read, Update, Delete)
   - ✅ Category management with CategoryService
   - ✅ Todo filtering (All, Pending, Completed, Priority, Due Date, Overdue)
   - ✅ Edit Todo modal with full form
   - ✅ Quick add todo functionality
   - ✅ Bulk operations

#### 1.4 Advanced Todo Features ✅ COMPLETED
   - ✅ Subtasks system with auto-progress calculation
   - ✅ Tags system with filtering
   - ✅ Attachments upload with file validation
   - ✅ Priority-based color coding
   - ✅ Due date tracking
   - ✅ Progress percentage display

#### 1.5 Admin Features ✅ COMPLETED
   - ✅ Admin dashboard with backend integration
   - ✅ User management dashboard
   - ✅ System metrics display
   - ✅ Activity logs
   - ✅ System health monitoring

#### 1.6 User Management Features ⏳ PENDING
   - ❌ User Profile page (view/edit profile)
   - ❌ Settings page (preferences, theme, notifications)
   - ❌ Forgot Password flow
   - ❌ Password reset functionality

#### 1.7 Additional Views ⏳ PENDING (OPTIONAL)
   - ❌ Calendar view for todos
   - ❌ Progress tracking view
   - ❌ Trash/Archive view
   - ❌ Notification panel

### Phase 2: Backend Development (Logic Tier) - NOT STARTED

#### 2.1 Express.js API Setup
   - Project setup with dependencies
   - Database connection configuration
   - Environment configuration
   - Error handling middleware

#### 2.2 Authentication & Authorization
   - Password hashing with bcrypt
   - JWT token generation and verification
   - Authentication middleware
   - Role-based authorization middleware
   - Login/Register endpoints

#### 2.3 REST API Endpoints
   - User management endpoints
   - Category CRUD operations
   - Todo CRUD operations
   - Admin-specific endpoints
   - File upload endpoints (attachments)

#### 2.4 Security Implementation
   - Input validation and sanitization
   - CORS configuration
   - Rate limiting
   - Security headers (helmet)
   - XSS protection

### Phase 3: Database Layer (Data Tier) - NOT STARTED

#### 3.1 MongoDB Docker Setup
   - Create docker-compose.yml with MongoDB
   - MongoDB Express for admin interface
   - Database initialization scripts
   - Start/stop scripts

#### 3.2 Database Schema Implementation
   - User collection with indexes
   - Category collection with relationships
   - Todo collection with full schema
   - Validation rules
   - Seed data generation scripts

### Phase 4: Integration - NOT STARTED

#### 4.1 Frontend-Backend Integration
   - Replace JSON Server with real API
   - Update environment configuration
   - HTTP error handling
   - Loading states
   - API response handling

#### 4.2 Postman Testing
   - Create Postman collection
   - Test all API endpoints
   - Authentication workflows
   - Role-based access testing

### Phase 5: End-to-End Testing - NOT STARTED

#### 5.1 E2E Test Framework Setup
   - Cypress or Playwright installation
   - Test configuration
   - Test data setup
   - Helper functions

#### 5.2 E2E Test Scenarios
   - User registration and login flows
   - Todo CRUD operations
   - Subtasks, tags, attachments workflows
   - Admin user management
   - Role-based access control
   - Cross-browser testing

#### 5.3 Bug Fixes & Optimization
   - Fix failing tests
   - Performance optimization
   - Code cleanup
   - Final documentation

## 8. Security Considerations
- Password encryption using bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- Rate limiting on sensitive endpoints

## 9. Development Guidelines
- Follow Angular style guide and best practices
- Implement proper error handling throughout the application
- Use TypeScript interfaces for type safety
- Implement responsive design for mobile compatibility
- Follow REST API conventions for endpoint naming
- Use environment variables for configuration
- Implement proper logging for debugging and monitoring