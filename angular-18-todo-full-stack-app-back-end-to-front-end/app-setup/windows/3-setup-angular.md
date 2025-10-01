# Angular Frontend Setup for Windows

This guide will help you set up the Angular frontend application on Windows for the Todo Application.

## Prerequisites
- Windows 10/11
- Node.js installed (see Express.js setup guide)
- Express.js API running
- MongoDB running

## 1. Install Node.js (if not already installed)

### If Node.js is not installed, follow these steps:
```powershell
# Download from https://nodejs.org/
# Install the LTS version
# Verify installation
node --version
npm --version
```

## 2. Install NVM (if not already installed)

### If NVM is not installed:
```powershell
# Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
# Install and verify
nvm version

# Use Node.js 18.x for Angular 18
nvm install 18.17.0
nvm use 18.17.0
```

## 3. Install Angular Dependencies

### Step 1: Install Angular CLI Globally
```powershell
# Install Angular CLI globally
npm install -g @angular/cli

# Verify Angular CLI installation
ng version
```

### Step 2: Navigate to Frontend Directory
```powershell
# Navigate to Angular app directory
cd "path\to\your\project\Front-End\angular-18-todo-app"
```

### Step 3: Install Project Dependencies
```powershell
# Install all dependencies
npm install

# Install Angular Material (if not already included)
ng add @angular/material

# Verify installation
npm list
```

### Step 4: Check Angular Configuration
```powershell
# Verify Angular version and dependencies
ng version

# Check proxy configuration
type proxy.conf.json
```

## 4. Start Angular Application

### Method 1: Using Angular CLI
```powershell
# Start development server
ng serve

# Start with specific host and port
ng serve --host 0.0.0.0 --port 4200

# Start with proxy configuration
ng serve --proxy-config proxy.conf.json
```

### Method 2: Using NPM Scripts
```powershell
# Use npm scripts defined in package.json
npm start

# Start with development configuration
npm run start:dev
```

### Verify Angular is Running
```powershell
# Open browser and visit: http://localhost:4200
# Or use curl to test
curl http://localhost:4200
```

### Development Server Output:
```
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **

✔ Compiled successfully.
```

## 5. Stop Angular Application

### Method 1: Keyboard Interrupt
```powershell
# In the running terminal, press:
Ctrl + C
```

### Method 2: Kill Process by Port
```powershell
# Find process using port 4200
netstat -ano | findstr :4200

# Kill the process (replace PID with actual process ID)
taskkill /PID <process_id> /F
```

### Method 3: Using PowerShell Script
```powershell
# Create a stop script
$process = Get-Process -Name "node" | Where-Object {$_.ProcessName -eq "node"}
if ($process) {
    $process | Stop-Process -Force
    Write-Host "Angular development server stopped"
} else {
    Write-Host "No Angular process found"
}
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
```powershell
# 1. Open browser and navigate to http://localhost:4200
# 2. Click on "Register" or navigate to /register
# 3. Fill in the registration form with test data above
# 4. After successful registration, login with the credentials
# 5. Verify redirect to dashboard
```

#### Step 2: Create Todo Lists
```powershell
# 1. Navigate to dashboard
# 2. Click "Create New List"
# 3. Enter list title: "Work Tasks"
# 4. Enter description: "Tasks related to work projects"
# 5. Select a color
# 6. Save the list
```

#### Step 3: Add Todo Items
```powershell
# 1. Open the created list
# 2. Click "Add Todo"
# 3. Enter todo details from sample data above
# 4. Set priority and due date
# 5. Save the todo item
# 6. Repeat for multiple items
```

#### Step 4: Test Todo Operations
```powershell
# 1. Mark todos as completed/incomplete
# 2. Edit todo items
# 3. Delete todo items
# 4. Filter todos by priority/status
# 5. Search for specific todos
```

#### Step 5: Test User Profile
```powershell
# 1. Navigate to user profile
# 2. Update profile information
# 3. Change password
# 4. Upload profile picture (if feature exists)
```

#### Step 6: Test Admin Features (if logged in as admin)
```powershell
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

### 6.7 Testing with Different Browsers

```powershell
# Test on multiple browsers
start chrome http://localhost:4200
start msedge http://localhost:4200
start firefox http://localhost:4200
```

## Troubleshooting

### Common Issues:

1. **Port 4200 already in use**
   ```powershell
   # Check what's using port 4200
   netstat -ano | findstr :4200
   
   # Kill the process
   taskkill /PID <process_id> /F
   
   # Or start on different port
   ng serve --port 4201
   ```

2. **Angular CLI not found**
   ```powershell
   # Reinstall Angular CLI globally
   npm uninstall -g @angular/cli
   npm install -g @angular/cli@latest
   ```

3. **Node Sass or styling issues**
   ```powershell
   # Rebuild node-sass
   npm rebuild node-sass
   
   # Or clear cache and reinstall
   npm cache clean --force
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

4. **Proxy configuration issues**
   ```powershell
   # Check proxy.conf.json
   type proxy.conf.json
   
   # Verify backend is running on correct port
   curl http://localhost:3000/health
   ```

5. **API connection issues**
   - Ensure Express.js backend is running
   - Check CORS configuration
   - Verify API endpoints in Angular services

### Environment Configuration

Check `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  version: '1.0.0'
};
```

## Development Tools

### Recommended VS Code Extensions:
- Angular Language Service
- Angular Snippets
- TypeScript Importer
- Prettier - Code formatter
- GitLens

### Browser Developer Tools:
- Chrome DevTools
- Angular DevTools extension
- Redux DevTools (if using state management)

## Next Steps

Once Angular is running successfully:
1. Test all user flows with sample data
2. Verify API integration
3. Test responsive design on different screen sizes
4. Perform end-to-end testing
5. Check browser console for any errors

## Performance Tips

```powershell
# Build for production to test performance
ng build --prod

# Serve production build locally
npm install -g http-server
http-server dist/angular-18-todo-app

# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/angular-18-todo-app/stats.json
```