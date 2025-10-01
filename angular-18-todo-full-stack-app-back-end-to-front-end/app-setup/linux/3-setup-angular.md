# Angular Frontend Setup for Lin### Step 1: Install Angular CLI Globally
```bashThis guide will help you set up the Angular frontend application on Linux for the Todo Application.

## Prerequisites
- Linux distribution (Ubuntu 20.04+, Debian 11+, CentOS 8+, or RHEL 8+)
- sudo privileges
- Express.js API running
- MongoDB running
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

## 2. Install Angular Dependencies

### Step 1: Install Angular CLI Globally
```bash
# Install Angular CLI globally
npm install -g @angular/cli

# If permission issues occur, use:
sudo npm install -g @angular/cli

# Or configure npm for global installations without sudo:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g @angular/cli

# Verify Angular CLI installation
ng version
which ng
```

### Step 2: Navigate to Frontend Directory
```bash
# Navigate to Angular app directory
cd "/path/to/your/project/Front-End/angular-18-todo-app"

# Check directory contents
ls -la
```

### Step 3: Install Project Dependencies
```bash
# Install all dependencies
npm install

# Install build tools for native modules (if needed)
# Ubuntu/Debian
sudo apt install -y build-essential python3-dev

# CentOS/RHEL/Fedora
sudo dnf groupinstall "Development Tools"
sudo dnf install python3-devel

# Arch Linux
sudo pacman -S base-devel python

# Install Angular Material (if not already included)
ng add @angular/material

# Verify installation
npm list
ng version
```

### Step 4: Handle Linux-Specific Dependencies
```bash
# Rebuild native modules if needed
npm rebuild

# If you encounter node-sass issues, switch to sass
npm uninstall node-sass
npm install sass --save-dev

# Clear cache if needed
npm cache clean --force
```

### Step 5: Check Angular Configuration
```bash
# Verify Angular version and dependencies
ng version

# Check proxy configuration
cat proxy.conf.json

# Verify TypeScript configuration
cat tsconfig.json
```

## 4. Start Angular Application

### Method 1: Using Angular CLI
```bash
# Start development server
ng serve

# Start with specific host and port
ng serve --host 0.0.0.0 --port 4200

# Start with proxy configuration
ng serve --proxy-config proxy.conf.json

# Start in background
nohup ng serve > angular.log 2>&1 &
```

### Method 2: Using NPM Scripts
```bash
# Use npm scripts defined in package.json
npm start

# Start with development configuration
npm run start:dev

# Check available scripts
npm run
```

### Method 3: Using systemd Service
```bash
# Create systemd service file
sudo tee /etc/systemd/system/angular-todo.service > /dev/null <<EOF
[Unit]
Description=Angular Todo Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/path/to/your/project/Front-End/angular-18-todo-app
ExecStart=/usr/bin/ng serve --host 0.0.0.0
Restart=on-failure
Environment=NODE_ENV=development

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable angular-todo.service
sudo systemctl start angular-todo.service

# Check status
sudo systemctl status angular-todo.service
```

### Verify Angular is Running
```bash
# Test with curl
curl http://localhost:4200

# Check process
ps aux | grep ng
ss -tlnp | grep :4200

# Test in browser (if GUI available)
xdg-open http://localhost:4200
```

### Development Server Output:
```
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **

✔ Compiled successfully.
```

## 5. Stop Angular Application

### Method 1: Keyboard Interrupt
```bash
# In the running terminal, press:
Ctrl + C
```

### Method 2: Kill Process by Port
```bash
# Find process using port 4200
sudo ss -tlnp | grep :4200
sudo netstat -tlnp | grep :4200

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Kill all node processes (use with caution)
pkill -f ng
```

### Method 3: Using systemd (if configured)
```bash
# Stop systemd service
sudo systemctl stop angular-todo.service

# Disable service
sudo systemctl disable angular-todo.service
```

### Method 4: Create Stop Script
```bash
# Create a stop script
cat > stop-angular.sh << 'EOF'
#!/bin/bash
echo "Stopping Angular development server..."
PID=$(ss -tlnp | grep :4200 | awk '{print $7}' | cut -d',' -f2 | cut -d'=' -f2)
if [ ! -z "$PID" ]; then
    kill -9 $PID
    echo "Angular development server stopped (PID: $PID)"
else
    echo "No process found on port 4200"
fi
EOF

chmod +x stop-angular.sh
./stop-angular.sh
```

## 6. Sample Test Data and User Authentication

### 6.1 Admin User Login
```json
{
  "email": "admin@todoapp.com",
  "password": "admin123456"
}
```

### 6.2 Regular User Login
```json
{
  "email": "user@todoapp.com",
  "password": "user123456"
}
```

### 6.3 Test User Registration
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

### 6.4 Sample Todo Lists Data
```json
{
  "lists": [
    {
      "title": "Work Tasks",
      "description": "Tasks related to work projects",
      "color": "#2196F3",
      "todos": [
        {
          "title": "Complete project documentation",
          "description": "Finish writing the technical documentation",
          "priority": "high",
          "dueDate": "2025-10-15",
          "completed": false
        },
        {
          "title": "Review code changes",
          "description": "Review pending pull requests",
          "priority": "medium",
          "dueDate": "2025-10-10",
          "completed": true
        }
      ]
    },
    {
      "title": "Personal Tasks",
      "description": "Personal and household tasks",
      "color": "#4CAF50",
      "todos": [
        {
          "title": "Grocery shopping",
          "description": "Buy weekly groceries",
          "priority": "low",
          "dueDate": "2025-10-08",
          "completed": false
        },
        {
          "title": "Doctor appointment",
          "description": "Annual health checkup",
          "priority": "high",
          "dueDate": "2025-10-12",
          "completed": false
        }
      ]
    }
  ]
}
```

### 6.5 Application Testing Sequence

#### Automated Testing Script
```bash
#!/bin/bash
# Save as test-angular.sh

set -e

APP_URL="http://localhost:4200"
API_URL="http://localhost:3000"

echo "🧪 Testing Angular Application on Linux..."

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local name=$2
    if curl -s --head "$url" | head -n 1 | grep -q "200 OK\|302 Found"; then
        echo "✅ $name is accessible"
        return 0
    else
        echo "❌ $name is not accessible"
        return 1
    fi
}

# Check if Angular is running
if check_url "$APP_URL" "Angular application"; then
    echo "Angular is running on $APP_URL"
else
    echo "Starting Angular application..."
    cd "/path/to/your/project/Front-End/angular-18-todo-app"
    nohup ng serve > angular.log 2>&1 &
    sleep 15
    
    if check_url "$APP_URL" "Angular application"; then
        echo "Angular started successfully"
    else
        echo "Failed to start Angular application"
        exit 1
    fi
fi

# Check if API is running
if ! check_url "$API_URL/health" "Express API"; then
    echo "❌ Express API is not running. Please start the API first."
    exit 1
fi

# Test main routes
routes=("/" "/auth/login" "/auth/register" "/dashboard")

for route in "${routes[@]}"; do
    url="$APP_URL$route"
    if curl -s --head "$url" | head -n 1 | grep -q "200 OK\|302 Found"; then
        echo "✅ Route $route is accessible"
    else
        echo "❌ Route $route is not accessible"
    fi
done

# Open in browser if GUI is available
if command -v xdg-open &> /dev/null; then
    echo "🌐 Opening application in browser..."
    xdg-open "$APP_URL"
elif command -v firefox &> /dev/null; then
    firefox "$APP_URL" &
elif command -v google-chrome &> /dev/null; then
    google-chrome "$APP_URL" &
elif command -v chromium-browser &> /dev/null; then
    chromium-browser "$APP_URL" &
else
    echo "📝 Please open $APP_URL in your browser"
fi

echo "✅ Angular application testing completed!"
echo "📋 Manual testing checklist:"
echo "   1. Register a new user"
echo "   2. Login with credentials"
echo "   3. Create todo lists"
echo "   4. Add/edit/delete todos"
echo "   5. Test all features"
```

Make executable and run:
```bash
chmod +x test-angular.sh
./test-angular.sh
```

### 6.6 Manual Testing Steps

#### Step 1: User Registration and Login
```bash
# Using curl to test API integration
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

#### Step 2: Browser Testing
1. Open http://localhost:4200 in browser
2. Navigate to registration page
3. Fill in user details and register
4. Login with created credentials
5. Test all application features

### 6.7 Browser Testing URLs

- **Homepage**: http://localhost:4200
- **Login**: http://localhost:4200/auth/login
- **Register**: http://localhost:4200/auth/register
- **Dashboard**: http://localhost:4200/dashboard
- **Profile**: http://localhost:4200/profile
- **Admin Panel**: http://localhost:4200/admin (admin only)

## Troubleshooting

### Common Issues on Linux:

1. **Port 4200 already in use**
   ```bash
   # Check what's using port 4200
   sudo ss -tlnp | grep :4200
   sudo netstat -tlnp | grep :4200
   
   # Kill the process
   sudo kill -9 <PID>
   
   # Or start on different port
   ng serve --port 4201
   ```

2. **Angular CLI not found**
   ```bash
   # Check if Angular CLI is in PATH
   which ng
   echo $PATH
   
   # Add npm global bin to PATH
   echo 'export PATH="$(npm root -g)/.bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   
   # Or reinstall Angular CLI
   npm uninstall -g @angular/cli
   npm install -g @angular/cli@latest
   ```

3. **Permission denied for global packages**
   ```bash
   # Configure npm to install global packages without sudo
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   
   # Reinstall Angular CLI
   npm install -g @angular/cli
   ```

4. **Node Sass or styling issues**
   ```bash
   # Switch to Dart Sass
   npm uninstall node-sass
   npm install sass --save-dev
   
   # Rebuild native modules
   npm rebuild
   
   # Clear cache and reinstall if needed
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Build or compilation errors**
   ```bash
   # Check TypeScript version compatibility
   npm list typescript
   ng version
   
   # Update Angular and dependencies
   ng update @angular/core @angular/cli
   
   # Check for peer dependency issues
   npm ls
   ```

6. **Firewall blocking connections**
   ```bash
   # Ubuntu (UFW)
   sudo ufw allow 4200/tcp
   
   # CentOS/RHEL/Fedora (firewalld)
   sudo firewall-cmd --permanent --add-port=4200/tcp
   sudo firewall-cmd --reload
   
   # Check firewall status
   sudo ufw status
   sudo firewall-cmd --list-all
   ```

7. **API connection issues**
   ```bash
   # Check if backend is running
   curl http://localhost:3000/health
   
   # Check proxy configuration
   cat proxy.conf.json
   
   # Test proxy endpoint
   curl http://localhost:4200/api/health
   
   # Check CORS settings in backend
   ```

### Environment Configuration

Check `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  version: '1.0.0'
};
```

## Development Tools for Linux

### Install useful development tools:
```bash
# Ubuntu/Debian
sudo apt install -y curl wget jq tree git

# CentOS/RHEL/Fedora
sudo dnf install -y curl wget jq tree git

# Arch Linux
sudo pacman -S curl wget jq tree git

# Install browsers for testing
# Ubuntu/Debian
sudo apt install -y firefox chromium-browser

# CentOS/RHEL/Fedora
sudo dnf install -y firefox chromium

# Install VS Code (optional)
# Ubuntu/Debian
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code
```

## Performance Optimization

### System Performance:
```bash
# Increase file watchers limit for Angular development
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

### Angular Performance:
```bash
# Build with optimization for production testing
ng build --configuration production

# Serve production build locally
npm install -g http-server
http-server dist/angular-18-todo-app -p 4200

# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/angular-18-todo-app/stats.json
```

## Next Steps

Once Angular is running successfully:
1. Test all user flows with sample data
2. Verify API integration
3. Test responsive design
4. Perform end-to-end testing
5. Check browser console for errors
6. Test performance and optimize

## Monitoring and Logging

### Application Monitoring:
```bash
# Monitor Angular process
ps aux | grep ng
top -p $(pgrep ng)

# Monitor file changes
inotifywait -m -r -e modify,create,delete ./src/

# Monitor network connections
ss -tulpn | grep :4200
netstat -tulpn | grep :4200

# Check system resources
free -h
df -h
iostat -x 1
```

### Log Management:
```bash
# View Angular development server logs
tail -f angular.log

# View system logs for Angular service (if using systemd)
sudo journalctl -u angular-todo.service -f

# Monitor error logs
tail -f /var/log/syslog | grep angular
```