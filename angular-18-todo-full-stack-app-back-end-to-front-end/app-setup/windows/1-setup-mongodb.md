# MongoDB Setup for Windows

This guide will help you set up MongoDB using Docker on Windows for the Angular Todo Application.

## Prerequisites
- Windows 10/11 with administrator privileges
- Internet connection

## 1. Install Docker Desktop

### Step 1: Download Docker Desktop
1. Visit [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
2. Download Docker Desktop for Windows
3. Run the installer as administrator

### Step 2: Install Docker Desktop
1. Double-click the downloaded `.exe` file
2. Follow the installation wizard
3. Enable WSL 2 integration when prompted
4. Restart your computer when installation completes

### Step 3: Verify Docker Installation
```powershell
# Open PowerShell as administrator and run:
docker --version
docker-compose --version
```

## 2. Install Docker Compose

Docker Compose is included with Docker Desktop for Windows, so no separate installation is needed.

### Verify Docker Compose Installation
```powershell
docker-compose --version
```

## 3. Start MongoDB and MongoDB UI using Docker Compose

### Step 1: Navigate to Project Directory
```powershell
# Open PowerShell and navigate to your project
cd "path\to\your\project\data-base\mongodb"
```

### Step 2: Start MongoDB Services
```powershell
# Start MongoDB and Mongo Express UI
docker-compose up -d

# Check if containers are running
docker-compose ps
```

### Step 3: Verify MongoDB is Running
```powershell
# Check container logs
docker-compose logs mongodb
docker-compose logs mongo-express

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

### Access Points:
- **MongoDB**: `mongodb://localhost:27017`
- **MongoDB UI**: http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

## 4. Stop MongoDB and MongoDB UI using Docker Compose

### Stop All Services
```powershell
# Stop and remove containers
docker-compose down

# Stop containers but keep them for restart
docker-compose stop

# Restart stopped containers
docker-compose start
```

### Complete Cleanup (if needed)
```powershell
# Remove containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## Troubleshooting

### Common Issues:

1. **Docker Desktop not starting**
   - Ensure Hyper-V is enabled
   - Check Windows version compatibility
   - Restart Docker Desktop service

2. **Port conflicts**
   ```powershell
   # Check what's using port 27017
   netstat -ano | findstr :27017
   
   # Kill process using the port (replace PID)
   taskkill /PID <process_id> /F
   ```

3. **Permission issues**
   - Run PowerShell as administrator
   - Check Docker Desktop is running

4. **WSL 2 issues**
   ```powershell
   # Update WSL 2
   wsl --update
   
   # Set WSL 2 as default
   wsl --set-default-version 2
   ```

## MongoDB Configuration

The MongoDB service uses these default configurations:
- **Database**: `tododb`
- **Username**: `admin`
- **Password**: `todopassword123`
- **Port**: `27017`

## Next Steps

Once MongoDB is running, you can proceed to:
1. Set up the Express.js backend
2. Configure the Angular frontend
3. Test the complete application stack

## Useful Commands

```powershell
# View container status
docker-compose ps

# View container logs
docker-compose logs -f

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Restore database
docker-compose exec mongodb mongorestore /backup
```