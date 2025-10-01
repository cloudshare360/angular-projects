# Angular Frontend Setup for Mac ARM (Apple Silicon)

This guide will help you set up the Angular frontend application on Mac with Apple Silicon (M1/M2/M3) for the Todo Application.

## Prerequisites
- macOS 11.0 or later with Apple Silicon
- Node.js installed (see Express.js setup guide)
- Express.js API running
- MongoDB running
- Xcode Command Line Tools

## 1. Install Node.js (if not already installed)

### If Node.js is not installed, follow these steps:
```bash
# Using Homebrew (recommended for Apple Silicon)
brew install node

# Or using NVM for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install 18.17.0
nvm use 18.17.0

# Verify installation
node --version
npm --version
```

## 2. Install NVM (if not already installed)

### If NVM is not installed:
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Add to shell profile
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# Install and use Node.js 18.x for Angular 18
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0
```

## 3. Install Angular Dependencies

### Step 1: Install Angular CLI Globally
```bash
# Install Angular CLI globally
npm install -g @angular/cli

# For Apple Silicon, ensure native installation
arch -arm64 npm install -g @angular/cli

# Verify Angular CLI installation
ng version
which ng
```

### Step 2: Navigate to Frontend Directory
```bash
# Navigate to Angular app directory
cd "/path/to/your/project/Front-End/angular-18-todo-app"

# Or open in Finder
open "/path/to/your/project/Front-End/angular-18-todo-app"
```

### Step 3: Install Project Dependencies
```bash
# Install all dependencies
npm install

# For Apple Silicon optimization
npm install --platform=darwin --arch=arm64

# Install Angular Material (if not already included)
ng add @angular/material

# Install additional dependencies if needed
npm install @angular/cdk @angular/animations

# Verify installation
npm list
ng version
```

### Step 4: Handle ARM64 Specific Dependencies
```bash
# Rebuild native modules for ARM64
npm rebuild

# If you encounter issues with node-sass or similar
npm install sass --save-dev
npm uninstall node-sass

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

# Start with optimization for Apple Silicon
ng serve --optimization=false --source-map=false
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

### Method 3: Background Service (using PM2)
```bash
# Install PM2 globally if not installed
npm install -g pm2

# Start Angular as a service
pm2 start "ng serve" --name "angular-app"

# Check status
pm2 status

# View logs
pm2 logs angular-app
```

### Verify Angular is Running
```bash
# Test with curl
curl http://localhost:4200

# Open in default browser
open http://localhost:4200

# Check process
ps aux | grep ng
lsof -i :4200
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
lsof -i :4200

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Kill all node processes (use with caution)
killall node
```

### Method 3: Using PM2 (if used)
```bash
# Stop PM2 service
pm2 stop angular-app

# Delete from PM2
pm2 delete angular-app

# Stop all PM2 processes
pm2 stop all
```

### Method 4: Create Stop Script
```bash
# Create a stop script
cat > stop-angular.sh << 'EOF'
#!/bin/bash
echo "Stopping Angular development server..."
PID=$(lsof -ti :4200)
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

#### Step 1: User Registration and Login
```bash
# 1. Open browser and navigate to http://localhost:4200
open http://localhost:4200

# 2. Test registration flow:
# - Click on "Register" or navigate to /register
# - Fill in the registration form with test data above
# - After successful registration, login with the credentials
# - Verify redirect to dashboard
```

#### Step 2: Create Todo Lists
```bash
# Navigate through the application:
# 1. Navigate to dashboard
# 2. Click "Create New List"
# 3. Enter list title: "Work Tasks"
# 4. Enter description: "Tasks related to work projects"
# 5. Select a color
# 6. Save the list
```

#### Step 3: Add Todo Items
```bash
# Add todos to the list:
# 1. Open the created list
# 2. Click "Add Todo"
# 3. Enter todo details from sample data above
# 4. Set priority and due date
# 5. Save the todo item
# 6. Repeat for multiple items
```

#### Step 4: Test Todo Operations
```bash
# Test all CRUD operations:
# 1. Mark todos as completed/incomplete
# 2. Edit todo items
# 3. Delete todo items
# 4. Filter todos by priority/status
# 5. Search for specific todos
```

#### Step 5: Test User Profile
```bash
# Test user management:
# 1. Navigate to user profile
# 2. Update profile information
# 3. Change password
# 4. Upload profile picture (if feature exists)
```

#### Step 6: Test Admin Features (if logged in as admin)
```bash
# Test admin functionality:
# 1. Access admin dashboard
# 2. View all users
# 3. Manage user accounts
# 4. View system statistics
# 5. Export/import data
```

### 6.6 Browser Testing URLs

- **Homepage**: http://localhost:4200
- **Login**: http://localhost:4200/auth/login
- **Register**: http://localhost:4200/auth/register
- **Dashboard**: http://localhost:4200/dashboard
- **Profile**: http://localhost:4200/profile
- **Admin Panel**: http://localhost:4200/admin (admin only)

### 6.7 Testing with Different Browsers on macOS

```bash
# Test on multiple browsers
open -a "Google Chrome" http://localhost:4200
open -a "Safari" http://localhost:4200
open -a "Firefox" http://localhost:4200
open -a "Microsoft Edge" http://localhost:4200

# Test responsive design
open -a "Google Chrome" --args --window-size=375,667 http://localhost:4200  # iPhone
open -a "Google Chrome" --args --window-size=768,1024 http://localhost:4200 # iPad
```

### 6.8 Automated Testing Script for macOS
```bash
#!/bin/bash
# Save as test-angular.sh

echo "🧪 Testing Angular Application..."

# Check if Angular is running
if curl -s http://localhost:4200 > /dev/null; then
    echo "✅ Angular development server is running"
else
    echo "❌ Angular development server is not running"
    echo "Starting Angular..."
    ng serve &
    sleep 10
fi

# Test main routes
routes=("/" "/auth/login" "/auth/register" "/dashboard")

for route in "${routes[@]}"; do
    url="http://localhost:4200$route"
    if curl -s "$url" > /dev/null; then
        echo "✅ Route $route is accessible"
    else
        echo "❌ Route $route is not accessible"
    fi
done

# Open in browser for manual testing
echo "🌐 Opening application in browser..."
open http://localhost:4200

echo "✅ Angular application testing completed!"
```

Make executable and run:
```bash
chmod +x test-angular.sh
./test-angular.sh
```

## Troubleshooting

### Common Issues on Apple Silicon:

1. **Port 4200 already in use**
   ```bash
   # Check what's using port 4200
   lsof -i :4200
   
   # Kill the process
   kill -9 <PID>
   
   # Or start on different port
   ng serve --port 4201
   ```

2. **Angular CLI not found**
   ```bash
   # Check if Angular CLI is in PATH
   which ng
   
   # Reinstall Angular CLI for ARM64
   npm uninstall -g @angular/cli
   arch -arm64 npm install -g @angular/cli@latest
   
   # Add to PATH if needed
   echo 'export PATH="$PATH:$(npm root -g)/.bin"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Node Sass or styling issues**
   ```bash
   # Switch to Dart Sass (recommended for Apple Silicon)
   npm uninstall node-sass
   npm install sass --save-dev
   
   # Update angular.json to use sass
   # Change "styleExt": "scss" in angular.json
   
   # Rebuild if needed
   npm rebuild
   ```

4. **Native dependencies compilation issues**
   ```bash
   # Install Python and build tools
   brew install python@3.11
   npm install -g node-gyp
   
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Memory issues during build**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=8192"
   
   # Or use in package.json scripts
   "start": "NODE_OPTIONS='--max-old-space-size=8192' ng serve"
   ```

6. **Proxy configuration issues**
   ```bash
   # Check proxy.conf.json
   cat proxy.conf.json
   
   # Verify backend is running
   curl http://localhost:3000/health
   
   # Test proxy
   curl http://localhost:4200/api/health
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

For production builds on Apple Silicon:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com',
  version: '1.0.0'
};
```

## Development Tools for macOS

### Recommended VS Code Extensions:
```bash
# Install VS Code via Homebrew
brew install --cask visual-studio-code

# Recommended extensions (install via VS Code marketplace):
# - Angular Language Service
# - Angular Snippets
# - TypeScript Importer
# - Prettier - Code formatter
# - GitLens
# - Auto Rename Tag
# - Bracket Pair Colorizer
```

### Browser Developer Tools:
- Chrome DevTools
- Angular DevTools extension
- Safari Web Inspector
- Firefox Developer Tools

### macOS Specific Development Tools:
```bash
# Install useful development tools
brew install --cask google-chrome firefox
brew install jq httpie tree
brew install --cask postman bruno

# Install Angular DevTools extension in browsers
```

## Performance Optimization for Apple Silicon

### Build Optimization
```bash
# Build for production with ARM64 optimization
ng build --configuration production --optimization

# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/angular-18-todo-app/stats.json

# Use differential loading for modern browsers
# (automatically enabled in Angular 18)
```

### Memory Management
```bash
# Monitor memory usage
top -pid $(pgrep node)

# Use memory-efficient development mode
ng serve --optimization=false --build-optimizer=false --source-map=false
```

### CPU Optimization
```bash
# Use multiple CPU cores for build
export NODE_OPTIONS="--max-old-space-size=8192"
ng build --parallel

# Monitor CPU usage
top -l 1 | grep CPU
```

## Next Steps

Once Angular is running successfully:
1. Test all user flows with sample data
2. Verify API integration
3. Test responsive design on different screen sizes
4. Perform end-to-end testing with Cypress or Playwright
5. Check browser console for any errors
6. Test performance with Lighthouse

## Production Deployment

### Build for Production
```bash
# Build production bundle
ng build --configuration production

# Serve production build locally for testing
npm install -g http-server
http-server dist/angular-18-todo-app -p 4200

# Test production build
open http://localhost:4200
```

### Performance Testing
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test performance
lighthouse http://localhost:4200 --output html --output-path ./lighthouse-report.html

# Open report
open lighthouse-report.html
```

## Useful macOS Commands

```bash
# System information
system_profiler SPHardwareDataType | grep "Chip"

# Check architecture
uname -m

# Monitor system resources
top -l 1

# Network diagnostics
netstat -an | grep LISTEN

# Clear DNS cache (if needed)
sudo dscacheutil -flushcache
```