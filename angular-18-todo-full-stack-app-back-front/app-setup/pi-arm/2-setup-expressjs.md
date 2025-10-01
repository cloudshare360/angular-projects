# Express.js API Setup for Raspberry Pi ARM

This guide will help you set up the Express.js backend API on Raspberry Pi (ARM architecture) for the Angular Todo Application.

## Prerequisites
- Raspberry Pi 4 (recommended) with ARM architecture
- Raspberry Pi OS (64-bit recommended)
- sudo privileges
- Internet connection
- MongoDB running (see MongoDB setup guide)
- At least 2GB RAM available for Node.js
- **Node.js and NVM installed** (see [0-nodejs-nvm-setup.md](../0-nodejs-nvm-setup.md))

## System Preparation

### Check System Resources
```bash
# Check system information
uname -a
cat /proc/cpuinfo | grep "model name"
free -h
df -h

# Check temperature
vcgencmd measure_temp

# Ensure adequate swap space
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

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
2. Follow the Raspberry Pi ARM installation instructions
3. Return to this guide after Node.js is installed

## 2. Navigate to Express.js Project Directory

### Method 1: Using NodeSource Repository (Recommended)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget gnupg2 software-properties-common

# Add NodeSource repository for ARM
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Method 2: Using Package Manager (Faster but older version)
```bash
# Install Node.js from default repositories
sudo apt update
sudo apt install -y nodejs npm

# Check version
node --version
npm --version

# If version is too old, use NodeSource method above
```

### Method 3: Manual Installation for ARM64
```bash
# Download Node.js ARM64 binary
NODE_VERSION="v18.17.0"
wget https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-linux-arm64.tar.xz

# Extract and install
tar -xf node-$NODE_VERSION-linux-arm64.tar.xz
sudo mv node-$NODE_VERSION-linux-arm64 /opt/nodejs
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
sudo ln -s /opt/nodejs/bin/npx /usr/local/bin/npx

# Verify installation
node --version
npm --version
```

## 3. Install Express Dependencies

### Step 1: Optimize npm for Raspberry Pi
```bash
# Configure npm for better performance on Pi
npm config set fund false
npm config set audit false
npm config set progress false

# Increase memory limit for npm
export NODE_OPTIONS="--max-old-space-size=1024"
echo 'export NODE_OPTIONS="--max-old-space-size=1024"' >> ~/.bashrc
source ~/.bashrc
```

### Step 2: Navigate to Backend Directory
```bash
# Navigate to backend folder
cd "/path/to/your/project/Back-End/express-rest-todo-api"

# Check directory contents
ls -la
```

### Step 3: Install Dependencies
```bash
# Install build tools for native modules
sudo apt install -y build-essential python3-dev python3-pip

# Install dependencies with increased memory
NODE_OPTIONS="--max-old-space-size=1024" npm install

# Install development dependencies
npm install --save-dev nodemon

# Install global dependencies (optional)
sudo npm install -g pm2

# Verify installation
npm list --depth=0
```

### Step 4: Handle ARM-Specific Dependencies
```bash
# Some native modules might need rebuilding
npm rebuild

# If bcrypt installation fails, use bcryptjs instead
npm uninstall bcrypt
npm install bcryptjs

# Update package.json if needed to use bcryptjs
sed -i 's/bcrypt/bcryptjs/g' package.json

# Clear cache if needed
npm cache clean --force
```

### Step 5: Setup Environment Variables
```bash
# Copy environment template
cp .env.example .env 2>/dev/null || touch .env

# Edit .env file
nano .env
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

# Raspberry Pi specific optimizations
LOG_LEVEL=info
LOG_FILE=./logs/app.log
MAX_REQUEST_SIZE=10mb
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

## 4. Start Express API

### Method 1: Using NPM Scripts
```bash
# Start in development mode
npm run dev

# Start in production mode
npm start

# Check if server is running
curl http://localhost:3000/health
```

### Method 2: Using PM2 (Recommended for Pi)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'todo-api',
    script: 'src/app.js',
    instances: 1, // Use only 1 instance on Pi
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Pi-specific optimizations
    max_memory_restart: '256M',
    node_args: '--max-old-space-size=256',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status
pm2 logs todo-api

# Save PM2 configuration
pm2 save
pm2 startup
```

### Method 3: Using systemd Service
```bash
# Create systemd service file
sudo tee /etc/systemd/system/todo-api.service > /dev/null <<EOF
[Unit]
Description=Todo API Express Server
After=network.target mongod.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/project/Back-End/express-rest-todo-api
ExecStart=/usr/bin/node src/app.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=NODE_OPTIONS=--max-old-space-size=256
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=todo-api

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable todo-api.service
sudo systemctl start todo-api.service

# Check status
sudo systemctl status todo-api.service
sudo journalctl -u todo-api.service -f
```

### Method 4: Background Process with Screen
```bash
# Install screen
sudo apt install -y screen

# Start in screen session
screen -S todo-api
cd /path/to/your/project/Back-End/express-rest-todo-api
npm run dev

# Detach from screen: Ctrl+A, then D
# Reattach: screen -r todo-api
```

### Verify API is Running
```bash
# Test API endpoint
curl http://localhost:3000/health

# Test from another device on network
curl http://[PI_IP_ADDRESS]:3000/health

# Check process and resources
ps aux | grep node
htop

# Check port
ss -tlnp | grep :3000
```

## 5. Stop Express API

### Method 1: PM2
```bash
# Stop PM2 app
pm2 stop todo-api

# Delete from PM2
pm2 delete todo-api

# Stop all PM2 processes
pm2 stop all
```

### Method 2: systemd
```bash
# Stop systemd service
sudo systemctl stop todo-api.service

# Disable service
sudo systemctl disable todo-api.service
```

### Method 3: Kill Process
```bash
# Find and kill Node.js process
ps aux | grep node
kill -9 <PID>

# Or kill by port
sudo kill -9 $(lsof -ti:3000)
```

### Method 4: Screen Session
```bash
# Attach to screen session
screen -r todo-api

# Stop the process: Ctrl+C
# Exit screen: exit
```

## 6. API Testing Documentation (curl-doc)

### Raspberry Pi Specific Testing

#### Performance Testing
```bash
# Test API response time
time curl http://localhost:3000/health

# Load testing (light load for Pi)
for i in {1..10}; do
  curl -s http://localhost:3000/health > /dev/null &
done
wait
echo "Load test completed"
```

#### Basic API Testing Commands

#### 6.1 Health Check
```bash
# Check API health
curl -X GET http://localhost:3000/health

# With timing information
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/health
```

#### 6.2 User Registration
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "piuser",
    "email": "pi@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

#### 6.3 User Login and Token Management
```bash
# Login and save token
response=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pi@example.com",
    "password": "password123"
  }')

# Extract token (install jq if needed: sudo apt install jq)
token=$(echo $response | jq -r '.token')
echo "Token: $token"

# Save token for other requests
echo $token > /tmp/api_token.txt
```

### Complete Testing Script for Raspberry Pi
```bash
#!/bin/bash
# Save as test-api-pi.sh

set -e

BASE_URL="http://localhost:3000"
EMAIL="pi@example.com"
PASSWORD="password123"
TOKEN_FILE="/tmp/api_token.txt"

echo "🧪 Testing Express API on Raspberry Pi..."
echo "Pi Temperature: $(vcgencmd measure_temp)"
echo "Available Memory: $(free -h | grep Mem | awk '{print $7}')"

# Install jq if not present
if ! command -v jq &> /dev/null; then
    echo "Installing jq..."
    sudo apt update && sudo apt install -y jq
fi

# Function to check API health
check_health() {
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/health")
    local body=$(echo $response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    local status=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [ "$status" -eq 200 ]; then
        echo "✅ API is healthy"
        return 0
    else
        echo "❌ API health check failed (Status: $status)"
        return 1
    fi
}

# Function to monitor Pi resources during test
monitor_resources() {
    echo "📊 Pi Resources:"
    echo "  CPU Temperature: $(vcgencmd measure_temp)"
    echo "  Memory Usage: $(free -h | grep Mem | awk '{print "Used: " $3 ", Available: " $7}')"
    echo "  Load Average: $(uptime | awk -F'load average:' '{print $2}')"
}

# Health check
echo "1. Health check..."
if check_health; then
    monitor_resources
else
    echo "API is not responding. Please check if it's running."
    exit 1
fi

# Register user (might already exist)
echo "2. Registering user..."
register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"piuser\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"confirmPassword\": \"$PASSWORD\"
  }")

if echo "$register_response" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ User registered successfully"
else
    echo "⚠️  User might already exist, continuing..."
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
    echo "Response: $login_response"
    exit 1
fi

# Create list
echo "4. Creating todo list..."
list_response=$(curl -s -X POST "$BASE_URL/api/lists" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Pi Test List",
    "description": "Testing on Raspberry Pi"
  }')

list_id=$(echo $list_response | jq -r '.data._id')
if [ "$list_id" != "null" ] && [ "$list_id" != "" ]; then
    echo "✅ List created: $list_id"
else
    echo "❌ Failed to create list"
    echo "Response: $list_response"
    exit 1
fi

# Create todo
echo "5. Creating todo item..."
todo_response=$(curl -s -X POST "$BASE_URL/api/lists/$list_id/todos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{
    "title": "Pi Performance Test",
    "description": "Testing API performance on Raspberry Pi"
  }')

todo_id=$(echo $todo_response | jq -r '.data._id')
if [ "$todo_id" != "null" ] && [ "$todo_id" != "" ]; then
    echo "✅ Todo created: $todo_id"
else
    echo "❌ Failed to create todo"
    exit 1
fi

# Performance test
echo "6. Performance testing..."
start_time=$(date +%s.%N)
for i in {1..5}; do
    curl -s "$BASE_URL/api/lists" \
      -H "Authorization: Bearer $token" > /dev/null
done
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)
avg_time=$(echo "scale=3; $duration / 5" | bc)
echo "✅ Average response time: ${avg_time}s"

# Final resource check
echo "7. Final resource check..."
monitor_resources

echo "✅ Raspberry Pi API testing completed!"

# Cleanup
rm -f $TOKEN_FILE
```

Make executable and run:
```bash
chmod +x test-api-pi.sh
./test-api-pi.sh
```

## Troubleshooting Raspberry Pi Issues

### Common Issues:

1. **Out of memory errors**
   ```bash
   # Check memory usage
   free -h
   
   # Increase swap
   sudo dphys-swapfile swapoff
   sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   
   # Reduce Node.js memory usage
   export NODE_OPTIONS="--max-old-space-size=256"
   ```

2. **Slow performance**
   ```bash
   # Check temperature (throttling occurs above 80°C)
   vcgencmd measure_temp
   
   # Check for throttling
   vcgencmd get_throttled
   
   # Improve cooling if needed
   # Use PM2 with limited memory
   pm2 start src/app.js --max-memory-restart 256M
   ```

3. **npm install failures**
   ```bash
   # Use lighter installation
   npm ci --only=production
   
   # Skip optional dependencies
   npm install --no-optional
   
   # Increase timeout
   npm install --timeout=300000
   ```

4. **Port access issues**
   ```bash
   # Check if port is accessible from network
   nmap -p 3000 [PI_IP_ADDRESS]
   
   # Configure firewall
   sudo ufw allow 3000/tcp
   
   # Test local connection
   curl localhost:3000/health
   ```

5. **SD card performance issues**
   ```bash
   # Check SD card speed
   sudo hdparm -t /dev/mmcblk0
   
   # Use USB SSD for better performance
   # Move project to USB drive
   sudo mkdir -p /mnt/usb-storage
   sudo mount /dev/sda1 /mnt/usb-storage
   ```

### Performance Optimization for Pi

1. **Use PM2 with optimizations**:
   ```bash
   # PM2 with memory limit
   pm2 start src/app.js --max-memory-restart 256M --node-args="--max-old-space-size=256"
   
   # Enable PM2 log rotation
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   ```

2. **Optimize Express app**:
   ```javascript
   // Add to your Express app (src/app.js)
   
   // Compress responses
   const compression = require('compression');
   app.use(compression());
   
   // Set memory limits
   app.use(express.json({ limit: '10mb' }));
   app.use(express.urlencoded({ limit: '10mb', extended: true }));
   ```

3. **System optimizations**:
   ```bash
   # Disable unnecessary services
   sudo systemctl disable bluetooth
   sudo systemctl disable cups-browsed
   
   # Optimize GPU memory (for headless Pi)
   echo 'gpu_mem=16' | sudo tee -a /boot/firmware/config.txt
   
   # Set CPU governor to performance
   echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
   ```

## Monitoring and Maintenance

### Create Monitoring Script
```bash
cat > monitor-api.sh << 'EOF'
#!/bin/bash
echo "=== API Monitoring Report ==="
echo "Date: $(date)"
echo "Temperature: $(vcgencmd measure_temp)"
echo "Memory: $(free -h | grep Mem | awk '{print "Used: " $3 ", Available: " $7}')"
echo "Disk: $(df -h / | tail -1 | awk '{print "Used: " $3 ", Available: " $4}')"

# Check if API is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "API Status: ✅ Running"
    echo "Response time: $(curl -w '%{time_total}s' -o /dev/null -s http://localhost:3000/health)"
else
    echo "API Status: ❌ Not responding"
fi

# PM2 status if using PM2
if command -v pm2 > /dev/null; then
    echo "PM2 Status:"
    pm2 jlist | jq -r '.[] | "  \(.name): \(.pm2_env.status)"'
fi

echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo "==============================="
EOF

chmod +x monitor-api.sh

# Schedule monitoring
echo "*/15 * * * * /path/to/monitor-api.sh >> /var/log/api-monitor.log" | crontab -
```

## Next Steps

Once the Express API is running on your Raspberry Pi:
1. Set up the Angular frontend (see next guide)
2. Configure remote access if needed
3. Set up automatic backups
4. Monitor performance and optimize as needed
5. Consider clustering for better performance

## Remote Access Tips

```bash
# Find Pi IP address
hostname -I

# Access API from other devices
curl http://[PI_IP_ADDRESS]:3000/health

# Set up reverse proxy with nginx (optional)
sudo apt install -y nginx
# Configure nginx to proxy requests to your API
```