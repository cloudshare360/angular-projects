# Express.js API Setup for Linux

This guide will help you set up the Express.js backend API on Linux for the Angular Todo Application.

## Prerequisites
- Linux distribution (Ubuntu 20.04+, Debian 11+, CentOS 8+, or RHEL 8+)
- sudo privileges
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
2. Follow the Linux installation instructions
3. Return to this guide after Node.js is installed

## 2. Navigate to Express.js Project Directory

## 3. Install Dependencies and Run Express.js Application

### Step 1: Open Terminal

### Step 2: Install Node.js with NVM
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
# Navigate to backend folder
cd "/path/to/your/project/Back-End/express-rest-todo-api"

# Check directory contents
ls -la
```

### Step 2: Install Dependencies
```bash
# Install all dependencies
npm install

# Install development dependencies specifically
npm install --save-dev nodemon

# Install global dependencies (optional)
sudo npm install -g pm2 nodemon

# Verify installation
npm list
npm list -g --depth=0
```

### Step 3: Handle Linux-Specific Dependencies
```bash
# Install build tools for native modules
# Ubuntu/Debian
sudo apt install -y build-essential python3-dev

# CentOS/RHEL/Fedora
sudo dnf groupinstall "Development Tools"
sudo dnf install python3-devel

# Arch Linux
sudo pacman -S base-devel python

# Rebuild native modules if needed
npm rebuild
```

### Step 4: Setup Environment Variables
```bash
# Copy environment template (if exists)
cp .env.example .env

# Edit .env file
nano .env
# or
vim .env
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

# Linux specific settings
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

# Start in background
nohup node src/app.js > server.log 2>&1 &
```

### Method 3: Using PM2 (Production-like)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start with PM2
pm2 start src/app.js --name "todo-api"

# Start with ecosystem file
pm2 start ecosystem.config.js

# Check status
pm2 status
pm2 logs todo-api
```

### Method 4: Using systemd Service
```bash
# Create systemd service file
sudo tee /etc/systemd/system/todo-api.service > /dev/null <<EOF
[Unit]
Description=Todo API Express Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project/Back-End/express-rest-todo-api
ExecStart=/usr/bin/node src/app.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable todo-api.service
sudo systemctl start todo-api.service

# Check status
sudo systemctl status todo-api.service
```

### Verify API is Running
```bash
# Test API endpoint
curl http://localhost:3000/health

# Test with headers
curl -H "Accept: application/json" http://localhost:3000/health

# Check process
ps aux | grep node
ss -tlnp | grep :3000
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
sudo ss -tlnp | grep :3000
sudo netstat -tlnp | grep :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or kill all node processes (use with caution)
pkill -f node
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

### Method 4: Using systemd (if configured)
```bash
# Stop systemd service
sudo systemctl stop todo-api.service

# Disable service
sudo systemctl disable todo-api.service
```

## 6. API Testing Documentation (curl-doc)

### Basic API Testing Commands

#### 6.1 Health Check
```bash
# Check API health
curl -X GET http://localhost:3000/health

# With JSON formatting (requires jq)
curl -X GET http://localhost:3000/health | jq

# With response time
curl -w "Response time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/health
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
  }' | jq
```

#### 6.3 User Login
```bash
# Login user and save token
response=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

# Extract token (requires jq)
token=$(echo $response | jq -r '.token')
echo "Token: $token"

# Save token to file for reuse
echo $token > /tmp/api_token.txt
```

#### 6.4 Create Todo List
```bash
# Create a new todo list (using saved token)
token=$(cat /tmp/api_token.txt)
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "My First List",
    "description": "A sample todo list"
  }' | jq
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
  }' | jq
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
  }' | jq
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

### Complete Testing Script for Linux
```bash
#!/bin/bash
# Save as test-api.sh

set -e

BASE_URL="http://localhost:3000"
EMAIL="test@example.com"
PASSWORD="password123"
TOKEN_FILE="/tmp/api_token.txt"

echo "🧪 Testing Express API on Linux..."

# Function to check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo "Installing jq for JSON parsing..."
        if command -v apt &> /dev/null; then
            sudo apt install -y jq
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y jq
        elif command -v pacman &> /dev/null; then
            sudo pacman -S jq
        else
            echo "Please install jq manually"
            exit 1
        fi
    fi
}

check_jq

# Health check
echo "1. Health check..."
if curl -s "$BASE_URL/health" | jq . > /dev/null; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    exit 1
fi

# Register user
echo "2. Registering user..."
register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"confirmPassword\": \"$PASSWORD\"
  }")

if echo "$register_response" | jq -e '.success' > /dev/null; then
    echo "✅ User registered successfully"
else
    echo "⚠️  User might already exist, continuing with login..."
fi

# Login and get token
echo "3. Logging in..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

token=$(echo $login_response | jq -r '.token')
if [ "$token" != "null" ] && [ "$token" != "" ]; then
    echo "✅ Login successful"
    echo $token > $TOKEN_FILE
else
    echo "❌ Login failed"
    exit 1
fi

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
if [ "$list_id" != "null" ] && [ "$list_id" != "" ]; then
    echo "✅ List created: $list_id"
else
    echo "❌ Failed to create list"
    exit 1
fi

# Create todo
echo "5. Creating todo item..."
todo_response=$(curl -s -X POST "$BASE_URL/api/lists/$list_id/todos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Test Todo",
    "description": "A test todo item"
  }')

todo_id=$(echo $todo_response | jq -r '.data._id')
if [ "$todo_id" != "null" ] && [ "$todo_id" != "" ]; then
    echo "✅ Todo created: $todo_id"
else
    echo "❌ Failed to create todo"
    exit 1
fi

# Update todo
echo "6. Updating todo item..."
update_response=$(curl -s -X PUT "$BASE_URL/api/todos/$todo_id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "completed": true
  }')

if echo "$update_response" | jq -e '.success' > /dev/null; then
    echo "✅ Todo updated successfully"
else
    echo "❌ Failed to update todo"
fi

echo "✅ API testing completed successfully!"
echo "🗑️  Cleaning up..."
rm -f $TOKEN_FILE
```

Make the script executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Troubleshooting

### Common Issues on Linux:

1. **Port 3000 already in use**
   ```bash
   # Check what's using port 3000
   sudo ss -tlnp | grep :3000
   sudo netstat -tlnp | grep :3000
   
   # Kill the process
   sudo kill -9 <PID>
   
   # Check for other Node.js processes
   ps aux | grep node
   ```

2. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/project
   
   # Fix npm permissions
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Node.js not found after installation**
   ```bash
   # Add Node.js to PATH
   echo 'export PATH=/usr/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   
   # Or create symlink
   sudo ln -s /usr/bin/nodejs /usr/bin/node
   ```

4. **MongoDB connection failed**
   ```bash
   # Check if MongoDB is running
   docker ps | grep mongodb
   
   # Test MongoDB connection
   telnet localhost 27017
   
   # Check logs
   docker-compose logs mongodb
   ```

5. **Native module compilation errors**
   ```bash
   # Install build essentials
   # Ubuntu/Debian
   sudo apt install build-essential python3-dev
   
   # CentOS/RHEL/Fedora
   sudo dnf groupinstall "Development Tools"
   sudo dnf install python3-devel
   
   # Clear cache and rebuild
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

6. **Firewall blocking connections**
   ```bash
   # Ubuntu (UFW)
   sudo ufw allow 3000/tcp
   
   # CentOS/RHEL/Fedora (firewalld)
   sudo firewall-cmd --permanent --add-port=3000/tcp
   sudo firewall-cmd --reload
   
   # Check firewall status
   sudo ufw status
   sudo firewall-cmd --list-all
   ```

## Performance Optimization

### System Configuration:
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize TCP settings
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Node.js Performance:
```bash
# Use cluster mode with PM2
pm2 start src/app.js -i max --name "todo-api-cluster"

# Monitor performance
pm2 monit

# Use production optimizations
NODE_ENV=production npm start
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