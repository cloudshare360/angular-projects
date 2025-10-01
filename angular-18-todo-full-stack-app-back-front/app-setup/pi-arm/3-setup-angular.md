# Angular Frontend Setup for Raspberry Pi ARM

This guide will help you set up the Angular frontend application on Raspberry Pi (ARM architecture) for the Todo Application.

## Prerequisites
- Raspberry Pi 4 (recommended) with ARM architecture
- Raspberry Pi OS (64-bit recommended)
- Node.js installed (see Express.js setup guide)
- Express.js API running
- MongoDB running
- At least 2GB RAM available for Angular compilation
- **Node.js and NVM installed** (see [0-nodejs-nvm-setup.md](../0-nodejs-nvm-setup.md))

## System Preparation

### Check System Resources
```bash
# Check system specifications
uname -a
cat /proc/cpuinfo | grep "model name"
free -h
df -h

# Monitor temperature
vcgencmd measure_temp

# Ensure adequate swap space for compilation
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=4096/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
free -h
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

## 2. Install Angular Dependencies

### Step 1: Optimize System for Angular Compilation
```bash
# Increase memory limits for Node.js
export NODE_OPTIONS="--max-old-space-size=2048"
echo 'export NODE_OPTIONS="--max-old-space-size=2048"' >> ~/.bashrc
source ~/.bashrc

# Create swap file specifically for compilation if needed
sudo fallocate -l 2G /swapfile-angular
sudo chmod 600 /swapfile-angular
sudo mkswap /swapfile-angular
sudo swapon /swapfile-angular
```

### Step 2: Install Angular CLI Globally
```bash
# Install Angular CLI with increased memory
NODE_OPTIONS="--max-old-space-size=2048" npm install -g @angular/cli

# Verify installation
ng version
which ng

# If installation fails due to memory, use alternative approach:
# npm install -g @angular/cli --unsafe-perm --verbose
```

### Step 3: Navigate to Frontend Directory
```bash
# Navigate to Angular app directory
cd "/path/to/your/project/Front-End/angular-18-todo-app"

# Check directory contents
ls -la
cat package.json | grep angular
```

### Step 4: Install Project Dependencies
```bash
# Clear npm cache first
npm cache clean --force

# Install dependencies with optimizations for Pi
NODE_OPTIONS="--max-old-space-size=2048" npm install --verbose

# Alternative installation methods if above fails:
# Method 1: Install without optional dependencies
# npm install --no-optional --verbose

# Method 2: Use npm ci for faster, reliable builds
# npm ci --verbose

# Method 3: Install specific Angular packages individually if needed
# npm install @angular/core @angular/common @angular/platform-browser

# Install additional dependencies
npm install @angular/material @angular/cdk @angular/animations

# Verify installation
npm list --depth=0
ng version
```

### Step 5: Handle ARM-Specific Dependencies
```bash
# Install build tools
sudo apt install -y build-essential python3-dev

# Rebuild native modules for ARM
npm rebuild

# If sass installation issues occur
npm uninstall node-sass
npm install sass --save-dev

# Check for any peer dependency issues
npm audit fix --force
```

### Step 6: Optimize Angular Configuration for Pi
```bash
# Create or modify angular.json for Pi optimization
cat > angular-pi-optimization.json << 'EOF'
{
  "build": {
    "optimization": false,
    "sourceMap": false,
    "extractCss": true,
    "namedChunks": false,
    "aot": false,
    "extractLicenses": false,
    "vendorChunk": false,
    "buildOptimizer": false
  },
  "serve": {
    "optimization": false,
    "sourceMap": false,
    "hmr": false,
    "liveReload": false
  }
}
EOF

# Backup original angular.json
cp angular.json angular.json.backup

# Apply Pi optimizations to angular.json (manual edit recommended)
echo "Please apply Pi optimizations to angular.json based on angular-pi-optimization.json"
```

## 4. Start Angular Application

### Method 1: Basic Angular CLI
```bash
# Start with basic configuration
ng serve --host 0.0.0.0 --port 4200

# Start with Pi optimizations
ng serve --host 0.0.0.0 --port 4200 --optimization=false --source-map=false --hmr=false

# Start with proxy configuration
ng serve --host 0.0.0.0 --proxy-config proxy.conf.json --optimization=false
```

### Method 2: Using NPM Scripts with Optimizations
```bash
# Modify package.json scripts for Pi
cat >> package.json.pi << 'EOF'
{
  "scripts": {
    "start:pi": "ng serve --host 0.0.0.0 --optimization=false --source-map=false --hmr=false",
    "start:pi-proxy": "ng serve --host 0.0.0.0 --proxy-config proxy.conf.json --optimization=false --source-map=false",
    "build:pi": "ng build --optimization=false --source-map=false --build-optimizer=false"
  }
}
EOF

# Use Pi-optimized start command
npm run start:pi

# Or with proxy
npm run start:pi-proxy
```

### Method 3: Background Process with Screen
```bash
# Install screen
sudo apt install -y screen

# Start Angular in screen session
screen -S angular-app
cd /path/to/your/project/Front-End/angular-18-todo-app

# Start with Pi optimizations
NODE_OPTIONS="--max-old-space-size=1024" ng serve --host 0.0.0.0 --optimization=false --source-map=false

# Detach: Ctrl+A, then D
# Reattach: screen -r angular-app
```

### Method 4: systemd Service (for production-like setup)
```bash
# Create systemd service
sudo tee /etc/systemd/system/angular-todo.service > /dev/null <<EOF
[Unit]
Description=Angular Todo Application
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/project/Front-End/angular-18-todo-app
ExecStart=/usr/bin/node node_modules/@angular/cli/bin/ng serve --host 0.0.0.0 --optimization=false --source-map=false
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=development
Environment=NODE_OPTIONS=--max-old-space-size=1024
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=angular-todo

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable angular-todo.service
sudo systemctl start angular-todo.service

# Check status
sudo systemctl status angular-todo.service
sudo journalctl -u angular-todo.service -f
```

### Verify Angular is Running
```bash
# Test locally
curl http://localhost:4200

# Test from network (replace with Pi's IP)
curl http://[PI_IP_ADDRESS]:4200

# Check process and memory usage
ps aux | grep ng
htop

# Check port
ss -tlnp | grep :4200

# Monitor temperature during compilation
watch vcgencmd measure_temp
```

### Development Server Output:
```
** Angular Live Development Server is listening on 0.0.0.0:4200, open your browser on http://localhost:4200/ **

⚠ Compiled with warnings (optimization disabled for Pi performance)
```

## 5. Stop Angular Application

### Method 1: Keyboard Interrupt
```bash
# In the running terminal, press:
Ctrl + C
```

### Method 2: Kill Process by Port
```bash
# Find and kill Angular process
sudo ss -tlnp | grep :4200
kill -9 <PID>

# Or kill all ng processes
pkill -f ng
```

### Method 3: systemd Service
```bash
# Stop systemd service
sudo systemctl stop angular-todo.service

# Disable service
sudo systemctl disable angular-todo.service
```

### Method 4: Screen Session
```bash
# Attach to screen session
screen -r angular-app

# Stop: Ctrl+C, then exit
```

### Method 5: Create Stop Script
```bash
cat > stop-angular-pi.sh << 'EOF'
#!/bin/bash
echo "Stopping Angular on Raspberry Pi..."

# Find Angular process
PID=$(ps aux | grep "[n]g serve" | awk '{print $2}')

if [ ! -z "$PID" ]; then
    kill -9 $PID
    echo "Angular stopped (PID: $PID)"
else
    echo "No Angular process found"
fi

# Check temperature after stopping
echo "CPU Temperature: $(vcgencmd measure_temp)"

# Turn off additional swap if created
sudo swapoff /swapfile-angular 2>/dev/null || true
EOF

chmod +x stop-angular-pi.sh
./stop-angular-pi.sh
```

## 6. Sample Test Data and User Authentication

### 6.1 Pi-Specific User Accounts
```json
{
  "admin": {
    "email": "admin@pi-todo.local",
    "password": "piAdmin123!"
  },
  "user": {
    "email": "user@pi-todo.local", 
    "password": "piUser123!"
  },
  "tester": {
    "email": "test@pi-todo.local",
    "password": "piTest123!"
  }
}
```

### 6.2 Sample Todo Data for Pi Testing
```json
{
  "lists": [
    {
      "title": "Raspberry Pi Projects",
      "description": "IoT and Pi-specific tasks",
      "color": "#E91E63",
      "todos": [
        {
          "title": "Set up GPIO control",
          "description": "Configure GPIO pins for LED control",
          "priority": "high",
          "dueDate": "2025-10-15",
          "completed": false
        },
        {
          "title": "Install temperature monitoring",
          "description": "Set up continuous temperature monitoring",
          "priority": "medium",
          "dueDate": "2025-10-12",
          "completed": false
        },
        {
          "title": "Configure VNC access",
          "description": "Enable remote desktop access",
          "priority": "low",
          "dueDate": "2025-10-20",
          "completed": true
        }
      ]
    },
    {
      "title": "Development Tasks",
      "description": "Web development on Pi",
      "color": "#4CAF50",
      "todos": [
        {
          "title": "Optimize Angular build",
          "description": "Improve compilation time and memory usage",
          "priority": "high",
          "dueDate": "2025-10-10",
          "completed": false
        },
        {
          "title": "Set up code sync",
          "description": "Configure git repository sync",
          "priority": "medium",
          "dueDate": "2025-10-14",
          "completed": false
        }
      ]
    }
  ]
}
```

### 6.3 Automated Testing Script for Pi
```bash
#!/bin/bash
# Save as test-angular-pi.sh

set -e

PI_IP=$(hostname -I | awk '{print $1}')
APP_URL="http://$PI_IP:4200"
API_URL="http://$PI_IP:3000"

echo "🥧 Testing Angular Application on Raspberry Pi..."
echo "Pi IP Address: $PI_IP"
echo "CPU Temperature: $(vcgencmd measure_temp)"
echo "Available Memory: $(free -h | grep Mem | awk '{print $7}')"

# Function to monitor Pi resources
monitor_pi_resources() {
    echo "📊 Pi Resources:"
    echo "  Temperature: $(vcgencmd measure_temp)"
    echo "  Memory: $(free -h | grep Mem | awk '{print "Used: " $3 ", Available: " $7}')"
    echo "  Load: $(uptime | awk -F'load average:' '{print $2}')"
    echo "  Disk: $(df -h / | tail -1 | awk '{print "Used: " $3 ", Available: " $4}')"
}

# Function to check if Angular is accessible
check_angular() {
    local url=$1
    if curl -s --connect-timeout 10 --head "$url" | head -n 1 | grep -q "200 OK"; then
        echo "✅ Angular is accessible at $url"
        return 0
    else
        echo "❌ Angular is not accessible at $url"
        return 1
    fi
}

# Check if Angular is running
if check_angular "$APP_URL"; then
    echo "Angular is running on Pi"
else
    echo "⚠️  Angular not detected. Starting Angular..."
    cd "/path/to/your/project/Front-End/angular-18-todo-app"
    
    # Start Angular in background with Pi optimizations
    NODE_OPTIONS="--max-old-space-size=1024" nohup ng serve --host 0.0.0.0 --optimization=false --source-map=false > angular-pi.log 2>&1 &
    
    echo "Waiting for Angular to start (this may take 2-3 minutes on Pi)..."
    sleep 30
    
    # Wait up to 3 minutes for Angular to start
    for i in {1..18}; do
        if check_angular "$APP_URL"; then
            echo "✅ Angular started successfully"
            break
        else
            echo "⏳ Still waiting... (${i}0s)"
            sleep 10
        fi
        
        if [ $i -eq 18 ]; then
            echo "❌ Angular failed to start within 3 minutes"
            echo "Check angular-pi.log for errors"
            exit 1
        fi
    done
fi

# Check API connectivity
if curl -s --connect-timeout 5 "$API_URL/health" > /dev/null; then
    echo "✅ API is accessible"
else
    echo "❌ API is not accessible at $API_URL"
    echo "Please ensure the Express API is running"
fi

# Test main routes
echo "🧪 Testing application routes..."
routes=("/" "/auth/login" "/auth/register")

for route in "${routes[@]}"; do
    url="$APP_URL$route"
    if curl -s --connect-timeout 10 --head "$url" | head -n 1 | grep -q "200 OK"; then
        echo "✅ Route $route is accessible"
    else
        echo "❌ Route $route failed"
    fi
done

# Performance test
echo "⚡ Testing response time..."
start_time=$(date +%s.%N)
curl -s "$APP_URL" > /dev/null
end_time=$(date +%s.%N)
response_time=$(echo "$end_time - $start_time" | bc)
echo "📊 Initial page load time: ${response_time}s"

# Resource monitoring
monitor_pi_resources

# Network accessibility test
echo "🌐 Testing network accessibility..."
echo "Local access: $APP_URL"
echo "Network access: http://$PI_IP:4200"

# Generate QR code for mobile access (if qrencode is available)
if command -v qrencode > /dev/null; then
    echo "📱 QR Code for mobile access:"
    qrencode -t ansiutf8 "http://$PI_IP:4200"
else
    echo "💡 Install qrencode for QR code generation: sudo apt install qrencode"
fi

echo "✅ Raspberry Pi Angular testing completed!"
echo ""
echo "📋 Manual testing checklist:"
echo "   1. Open http://$PI_IP:4200 in browser"
echo "   2. Test responsive design on mobile"
echo "   3. Register/login with Pi test accounts"
echo "   4. Create Pi-specific todo lists"
echo "   5. Test all CRUD operations"
echo "   6. Monitor Pi temperature during usage"
echo ""
echo "🔧 Performance tips:"
echo "   - Keep Pi cool during development"
echo "   - Use external SSD for better performance"
echo "   - Monitor memory usage regularly"
echo "   - Consider using build optimization for production"
```

Make executable and run:
```bash
chmod +x test-angular-pi.sh
./test-angular-pi.sh
```

### 6.4 Manual Testing on Pi

#### Browser Testing
```bash
# If GUI is available on Pi
chromium-browser http://localhost:4200 &

# Or access from another device on network
# Open browser and go to: http://[PI_IP_ADDRESS]:4200
```

#### Mobile Testing
```bash
# Generate QR code for easy mobile access
sudo apt install -y qrencode
qrencode -t ansiutf8 "http://$(hostname -I | awk '{print $1}'):4200"

# Test responsive design on mobile device
```

## Troubleshooting Raspberry Pi Issues

### Common Issues:

1. **Compilation out of memory**
   ```bash
   # Increase swap space
   sudo dphys-swapfile swapoff
   sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=4096/' /etc/dphys-swapfile
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   
   # Increase Node.js memory
   export NODE_OPTIONS="--max-old-space-size=2048"
   
   # Use build optimization
   ng build --optimization=false --source-map=false
   ```

2. **Extremely slow compilation**
   ```bash
   # Check temperature (throttling occurs above 80°C)
   vcgencmd measure_temp
   
   # Improve cooling
   # Monitor during compilation
   watch vcgencmd measure_temp
   
   # Use incremental compilation
   ng serve --hmr=false --live-reload=false
   ```

3. **Angular CLI installation fails**
   ```bash
   # Use alternative installation
   npm install -g @angular/cli --unsafe-perm --verbose
   
   # Or install locally
   npm install @angular/cli
   npx ng version
   ```

4. **Port 4200 not accessible from network**
   ```bash
   # Check firewall
   sudo ufw allow 4200/tcp
   
   # Ensure Angular is bound to all interfaces
   ng serve --host 0.0.0.0
   
   # Test network connectivity
   nmap -p 4200 [PI_IP_ADDRESS]
   ```

5. **Browser compatibility issues**
   ```bash
   # Use lighter build for older browsers
   ng build --target=es5 --optimization=false
   
   # Check browser console for errors
   # Consider using polyfills for older browsers
   ```

6. **Hot Module Replacement issues**
   ```bash
   # Disable HMR on Pi for stability
   ng serve --hmr=false --live-reload=false
   
   # Or use manual refresh approach
   ng serve --watch=false
   ```

### Performance Optimization for Pi

1. **Build optimizations**:
   ```bash
   # Create production build for better performance
   ng build --optimization=true --source-map=false --build-optimizer=true
   
   # Serve production build
   npm install -g http-server
   http-server dist/angular-18-todo-app -p 4200 -a 0.0.0.0
   ```

2. **Development optimizations**:
   ```bash
   # Disable unnecessary features
   ng serve --optimization=false --source-map=false --hmr=false --live-reload=false --extract-css=true
   
   # Use polling for file watching (if needed)
   ng serve --poll=2000
   ```

3. **System optimizations**:
   ```bash
   # Use external storage
   # Move node_modules to USB drive
   sudo mkdir -p /mnt/usb-storage/node_modules
   ln -sf /mnt/usb-storage/node_modules ./node_modules
   
   # Optimize file system
   echo 'vm.dirty_ratio = 5' | sudo tee -a /etc/sysctl.conf
   echo 'vm.dirty_background_ratio = 2' | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

## Production Deployment on Pi

### Building for Production
```bash
# Build with Pi-specific optimizations
ng build --configuration production --optimization=true --source-map=false

# Use lighter http-server
npm install -g http-server
http-server dist/angular-18-todo-app -p 4200 -a 0.0.0.0 -c-1

# Or use nginx for better performance
sudo apt install -y nginx

# Configure nginx
sudo tee /etc/nginx/sites-available/angular-todo > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root /path/to/your/project/Front-End/angular-18-todo-app/dist/angular-18-todo-app;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/angular-todo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Monitoring and Maintenance

### Create Pi-Specific Monitoring
```bash
cat > monitor-angular-pi.sh << 'EOF'
#!/bin/bash
echo "=== Angular Pi Monitoring Report ==="
echo "Date: $(date)"
echo "Pi Model: $(cat /proc/cpuinfo | grep "Model" | head -1)"
echo "Temperature: $(vcgencmd measure_temp)"
echo "Memory: $(free -h | grep Mem | awk '{print "Used: " $3 ", Available: " $7}')"
echo "Disk: $(df -h / | tail -1 | awk '{print "Used: " $3 ", Available: " $4}')"
echo "Uptime: $(uptime -p)"

# Check Angular status
if curl -s http://localhost:4200 > /dev/null; then
    echo "Angular Status: ✅ Running"
    echo "Network Access: http://$(hostname -I | awk '{print $1}'):4200"
else
    echo "Angular Status: ❌ Not responding"
fi

# Check system load
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"

# Temperature warning
temp=$(vcgencmd measure_temp | cut -d= -f2 | cut -d\' -f1)
if (( $(echo "$temp > 75" | bc -l) )); then
    echo "⚠️  Warning: High temperature detected!"
fi

echo "==============================="
EOF

chmod +x monitor-angular-pi.sh

# Schedule monitoring
echo "*/30 * * * * /path/to/monitor-angular-pi.sh >> /var/log/angular-pi-monitor.log" | crontab -
```

## Next Steps

Once Angular is running successfully on your Raspberry Pi:
1. Test all user flows with sample data
2. Optimize for mobile access
3. Set up remote development workflow
4. Configure automatic deployment
5. Monitor performance and temperature
6. Consider edge computing use cases

## IoT Integration Ideas

Since you're running on Raspberry Pi, consider these IoT integrations:

```bash
# GPIO control for todo status LEDs
npm install rpi-gpio

# Add to your Angular service:
# - Green LED for completed todos
# - Red LED for overdue todos
# - Blue LED for high priority todos

# Temperature-based notifications
# Show system temperature in Angular app
# Alert when Pi is getting too hot

# Mobile-first responsive design
# Optimize for tablet/phone access
# Add PWA features for offline usage
```

Your Angular Todo application is now running on Raspberry Pi with ARM optimization!