# Express.js API Setup for Windows

This guide will help you set up the Express.js backend API on Windows for the Angular Todo Application.

## Prerequisites
- Windows 10/11
- Administrator privileges
- Internet connection
- **Node.js and NVM installed** (see [0-nodejs-nvm-setup.md](../0-nodejs-nvm-setup.md))

## 1. Verify Node.js Installation

### Step 1: Check Node.js and npm
```powershell
# Open PowerShell and verify installation
node --version
npm --version
```

**Expected Output:**
```
v18.17.0 (or later)
9.6.7 (or later)
```

### Step 2: If Node.js is not installed
**Please complete the Node.js setup first:**
1. Go to [0-nodejs-nvm-setup.md](../0-nodejs-nvm-setup.md)
2. Follow the Windows installation instructions
3. Return to this guide after Node.js is installed

## 2. Navigate to Express.js Project Directory

### Step 1: Download NVM for Windows
1. Visit [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases)
2. Download `nvm-setup.zip`
3. Extract and run `nvm-setup.exe` as administrator

### Step 2: Configure NVM
```powershell
# Restart PowerShell and verify NVM installation
nvm version

# List available Node.js versions
nvm list available

# Install and use specific Node.js version
nvm install 18.17.0
nvm use 18.17.0

# Set default version
nvm alias default 18.17.0
```

## 3. Install Express Dependencies

### Step 1: Navigate to Backend Directory
```powershell
# Open PowerShell and navigate to backend folder
cd "path\to\your\project\Back-End\express-rest-todo-api"
```

### Step 2: Install Dependencies
```powershell
# Install all dependencies
npm install

# Install development dependencies (if needed)
npm install --save-dev nodemon

# Verify installation
npm list
```

### Step 3: Setup Environment Variables
```powershell
# Copy environment template (if exists)
copy .env.example .env

# Edit .env file with your configuration
notepad .env
```

### Environment Configuration (.env):
```env
# MongoDB Configuration
MONGODB_URI=mongodb://admin:todopassword123@localhost:27017/tododb?authSource=admin

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_change_this_in_production
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=3000
NODE_ENV=development
API_VERSION=1.0.0
API_URL=http://localhost:3000

# Frontend Configuration
FRONTEND_URL=http://localhost:4200
ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

## 4. Start Express API

### Method 1: Using NPM Scripts
```powershell
# Start in development mode (with auto-reload)
npm run dev

# Start in production mode
npm start

# Check if server is running
# Open browser and visit: http://localhost:3000
```

### Method 2: Direct Node Execution
```powershell
# Start directly with Node.js
node src/app.js

# Start with nodemon for development
npx nodemon src/app.js
```

### Verify API is Running
```powershell
# Test API endpoint
curl http://localhost:3000/health

# Or use PowerShell's Invoke-RestMethod
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

## 5. Stop Express API

### Method 1: Keyboard Interrupt
```powershell
# In the running terminal, press:
Ctrl + C
```

### Method 2: Kill Process by Port
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <process_id> /F
```

### Method 3: Using PowerShell Script
```powershell
# Create a stop script
$process = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($process) {
    $process | Stop-Process -Force
    Write-Host "Express API stopped successfully"
} else {
    Write-Host "No Node.js process found"
}
```

## 6. API Testing Documentation (curl-doc)

### Basic API Testing Commands

#### 6.1 Health Check
```powershell
# Check API health
curl -X GET http://localhost:3000/health
```

#### 6.2 User Registration
```powershell
# Register a new user
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\",\"confirmPassword\":\"password123\"}"
```

#### 6.3 User Login
```powershell
# Login user
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### 6.4 Create Todo List
```powershell
# Create a new todo list (replace TOKEN with actual JWT token)
curl -X POST http://localhost:3000/api/lists ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN" ^
  -d "{\"title\":\"My First List\",\"description\":\"A sample todo list\"}"
```

#### 6.5 Get All Lists
```powershell
# Get all lists for user
curl -X GET http://localhost:3000/api/lists ^
  -H "Authorization: Bearer TOKEN"
```

#### 6.6 Create Todo Item
```powershell
# Create a todo item (replace LIST_ID with actual list ID)
curl -X POST http://localhost:3000/api/lists/LIST_ID/todos ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN" ^
  -d "{\"title\":\"Sample Todo\",\"description\":\"A sample todo item\",\"priority\":\"medium\"}"
```

#### 6.7 Get Todo Items
```powershell
# Get all todos in a list
curl -X GET http://localhost:3000/api/lists/LIST_ID/todos ^
  -H "Authorization: Bearer TOKEN"
```

#### 6.8 Update Todo Item
```powershell
# Update a todo item (replace TODO_ID with actual todo ID)
curl -X PUT http://localhost:3000/api/todos/TODO_ID ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN" ^
  -d "{\"title\":\"Updated Todo\",\"completed\":true}"
```

#### 6.9 Delete Todo Item
```powershell
# Delete a todo item
curl -X DELETE http://localhost:3000/api/todos/TODO_ID ^
  -H "Authorization: Bearer TOKEN"
```

#### 6.10 Get User Profile
```powershell
# Get current user profile
curl -X GET http://localhost:3000/api/users/profile ^
  -H "Authorization: Bearer TOKEN"
```

### PowerShell Alternative Commands

```powershell
# For Windows users who prefer PowerShell over curl

# Health Check
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET

# User Registration
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"

# User Login
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
```

## Troubleshooting

### Common Issues:

1. **Port 3000 already in use**
   ```powershell
   # Check what's using port 3000
   netstat -ano | findstr :3000
   
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **Node.js not found**
   - Restart PowerShell after Node.js installation
   - Check PATH environment variable

3. **MongoDB connection failed**
   - Ensure MongoDB is running (see MongoDB setup guide)
   - Check connection string in .env file

4. **Dependencies installation failed**
   ```powershell
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

## Next Steps

Once the Express API is running successfully:
1. Test all endpoints using the curl commands above
2. Set up the Angular frontend
3. Connect the frontend to the backend API
4. Test the complete application flow

## API Documentation

- **API Documentation**: http://localhost:3000/api-docs (Swagger UI)
- **Base URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health