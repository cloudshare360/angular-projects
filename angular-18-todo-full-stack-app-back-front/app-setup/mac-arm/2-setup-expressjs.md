# Express.js API Setup for Mac ARM (Apple Silicon)

This guide will help you set up the Express.js backend API on Mac with Apple Silicon (M1/M2/M3) for the Angular Todo Application.

## Prerequisites
- macOS with Apple Silicon (M1/M2/M3)
- Xcode command line tools
- Internet connection
- **Node.js and NVM installed** (see [0-nodejs-nvm-setup.md](../0-nodejs-nvm-setup.md))

## 1. Verify Node.js Installation

### Step 1: Check Node.js and npm
```bash
# Check Node.js and npm versions
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
2. Follow the Mac ARM installation instructions
3. Return to this guide after Node.js is installed

## 2. Navigate to Express.js Project Directory

## 2. Install NVM (Node Version Manager)

## 3. Install Dependencies and Run Express.js Application

### Step 1: Open Terminal

### Step 2: Configure NVM for Apple Silicon
```bash
# Add to ~/.zshrc (for zsh) or ~/.bash_profile (for bash)
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc

# Reload shell configuration
source ~/.zshrc

# Verify NVM installation
nvm --version
```

### Step 3: Install and Use Node.js with NVM
```bash
# List available Node.js versions
nvm list-remote

# Install specific Node.js version (recommended for Angular 18)
nvm install 18.17.0

# Use specific version
nvm use 18.17.0

# Set default version
nvm alias default 18.17.0

# Verify current version
node --version
npm --version
```

## 3. Install Express Dependencies

### Step 1: Navigate to Backend Directory
```bash
# Open Terminal and navigate to backend folder
cd "/path/to/your/project/Back-End/express-rest-todo-api"

# Or using Finder
open "/path/to/your/project/Back-End/express-rest-todo-api"
```

### Step 2: Install Dependencies
```bash
# Install all dependencies
npm install

# Install development dependencies specifically
npm install --save-dev nodemon

# Install global dependencies (if needed)
npm install -g pm2

# Verify installation
npm list
npm list -g --depth=0
```

### Step 3: Handle ARM64 Specific Dependencies
```bash
# Some packages might need rebuilding for ARM64
npm rebuild

# If you encounter node-gyp issues
npm install -g node-gyp
npm rebuild node-sass --force

# Clear npm cache if needed
npm cache clean --force
```

### Step 4: Setup Environment Variables
```bash
# Copy environment template (if exists)
cp .env.example .env

# Edit .env file using nano, vim, or VS Code
nano .env
# or
code .env
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

# macOS specific settings
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## 4. Start Express API

### Method 1: Using NPM Scripts
```bash
# Start in development mode (with auto-reload)
npm run dev

# Start in production mode
npm start

# Check if server is running
curl http://localhost:3000/health
```

### Method 2: Using Node.js Directly
```bash
# Start directly with Node.js
node src/app.js

# Start with nodemon for development
npx nodemon src/app.js

# Start with PM2 (production-like)
pm2 start src/app.js --name "todo-api"
pm2 status
```

### Method 3: Using macOS Launch Services
```bash
# Create a launch script for easy starting
cat > start-api.sh << 'EOF'
#!/bin/bash
cd "/path/to/your/project/Back-End/express-rest-todo-api"
npm run dev
EOF

chmod +x start-api.sh
./start-api.sh
```

### Verify API is Running
```bash
# Test API endpoint
curl http://localhost:3000/health

# Test with detailed output
curl -v http://localhost:3000/health

# Check process
ps aux | grep node

# Check port usage
lsof -i :3000
```

## 5. Stop Express API

### Method 1: Keyboard Interrupt
```bash
# In the running terminal, press:
Ctrl + C
```

### Method 2: Kill Process by Port
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or kill all node processes (use with caution)
killall node
```

### Method 3: Using PM2 (if used)
```bash
# Stop specific app
pm2 stop todo-api

# Stop all apps
pm2 stop all

# Delete app from PM2
pm2 delete todo-api

# Kill PM2 daemon
pm2 kill
```

### Method 4: Create Stop Script
```bash
# Create a stop script
cat > stop-api.sh << 'EOF'
#!/bin/bash
echo "Stopping Express API..."
PID=$(lsof -ti :3000)
if [ ! -z "$PID" ]; then
    kill -9 $PID
    echo "Express API stopped (PID: $PID)"
else
    echo "No process found on port 3000"
fi
EOF

chmod +x stop-api.sh
./stop-api.sh
```

## 6. API Testing Documentation (curl-doc)

### Basic API Testing Commands

#### 6.1 Health Check
```bash
# Check API health
curl -X GET http://localhost:3000/health

# With JSON formatting (requires jq)
curl -X GET http://localhost:3000/health | jq
```

#### 6.2 User Registration
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

#### 6.3 User Login
```bash
# Login user and save token
response=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

# Extract token (requires jq)
token=$(echo $response | jq -r '.token')
echo "Token: $token"
```

#### 6.4 Create Todo List
```bash
# Create a new todo list (replace $token with actual JWT token)
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "My First List",
    "description": "A sample todo list"
  }'
```

#### 6.5 Get All Lists
```bash
# Get all lists for user
curl -X GET http://localhost:3000/api/lists \
  -H "Authorization: Bearer $token" | jq
```

#### 6.6 Create Todo Item
```bash
# Create a todo item (replace LIST_ID with actual list ID)
LIST_ID="your_list_id_here"
curl -X POST http://localhost:3000/api/lists/$LIST_ID/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Sample Todo",
    "description": "A sample todo item",
    "priority": "medium"
  }'
```

#### 6.7 Get Todo Items
```bash
# Get all todos in a list
curl -X GET http://localhost:3000/api/lists/$LIST_ID/todos \
  -H "Authorization: Bearer $token" | jq
```

#### 6.8 Update Todo Item
```bash
# Update a todo item (replace TODO_ID with actual todo ID)
TODO_ID="your_todo_id_here"
curl -X PUT http://localhost:3000/api/todos/$TODO_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Updated Todo",
    "completed": true
  }'
```

#### 6.9 Delete Todo Item
```bash
# Delete a todo item
curl -X DELETE http://localhost:3000/api/todos/$TODO_ID \
  -H "Authorization: Bearer $token"
```

#### 6.10 Get User Profile
```bash
# Get current user profile
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $token" | jq
```

### Complete Testing Script for macOS
```bash
#!/bin/bash
# save as test-api.sh

BASE_URL="http://localhost:3000"
EMAIL="test@example.com"
PASSWORD="password123"

echo "🧪 Testing Express API..."

# Health check
echo "1. Health check..."
curl -s "$BASE_URL/health" | jq

# Register user
echo "2. Registering user..."
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"confirmPassword\": \"$PASSWORD\"
  }" | jq

# Login and get token
echo "3. Logging in..."
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

token=$(echo $response | jq -r '.token')
echo "Token: ${token:0:50}..."

# Create list
echo "4. Creating todo list..."
list_response=$(curl -s -X POST "$BASE_URL/api/lists" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Test List",
    "description": "A test todo list"
  }')

list_id=$(echo $list_response | jq -r '.data._id')
echo "List ID: $list_id"

# Create todo
echo "5. Creating todo item..."
curl -s -X POST "$BASE_URL/api/lists/$list_id/todos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Test Todo",
    "description": "A test todo item"
  }' | jq

echo "✅ API testing completed!"
```

Make the script executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Troubleshooting

### Common Issues on Apple Silicon:

1. **Node.js ARM64 compatibility**
   ```bash
   # Check Node.js architecture
   node -p "process.arch"
   
   # Should return 'arm64' for Apple Silicon
   
   # If you have x64 version, reinstall ARM64 version
   nvm uninstall node
   arch -arm64 brew install node
   ```

2. **Native modules compilation issues**
   ```bash
   # Install Python (required for node-gyp)
   brew install python@3.11
   
   # Rebuild native modules
   npm rebuild
   
   # If still failing, clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Port 3000 already in use**
   ```bash
   # Find what's using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   
   # Or change port in environment
   export PORT=3001
   ```

4. **MongoDB connection issues**
   ```bash
   # Check if MongoDB is running
   docker-compose ps
   
   # Test connection
   curl localhost:27017
   
   # Check MongoDB logs
   docker-compose logs mongodb
   ```

5. **Permission issues**
   ```bash
   # Fix npm permissions
   sudo chown -R $(whoami) ~/.npm
   
   # Fix project permissions
   sudo chown -R $(whoami) /path/to/project
   ```

## Performance Optimization for Apple Silicon

### Memory Management
```bash
# Check memory usage
top -l 1 | grep "PhysMem"

# Monitor Node.js memory usage
node --max-old-space-size=4096 src/app.js
```

### CPU Optimization
```bash
# Use all CPU cores with PM2
pm2 start src/app.js -i max --name "todo-api"

# Check CPU usage
top -pid $(pgrep node)
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

## macOS Development Tools

### Recommended Tools:
- **Postman**: For API testing with GUI
- **Bruno**: Lightweight API client
- **HTTPie**: Command-line HTTP client
- **jq**: JSON processor for terminal

```bash
# Install useful tools via Homebrew
brew install jq httpie bruno postman
```