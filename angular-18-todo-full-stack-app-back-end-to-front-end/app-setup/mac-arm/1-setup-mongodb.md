# MongoDB Setup for Mac ARM (Apple Silicon)

This guide will help you set up MongoDB using Docker on Mac with Apple Silicon (M1/M2/M3) for the Angular Todo Application.

## Prerequisites
- macOS 11.0 or later with Apple Silicon (M1/M2/M3)
- Administrator privileges
- Internet connection

## 1. Install Docker Desktop

### Step 1: Download Docker Desktop for Mac ARM
1. Visit [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
2. Download Docker Desktop for Mac with Apple Silicon
3. Download the `.dmg` file

### Step 2: Install Docker Desktop
1. Open the downloaded `.dmg` file
2. Drag Docker to the Applications folder
3. Launch Docker from Applications
4. Complete the setup wizard
5. Grant necessary permissions when prompted

### Step 3: Verify Docker Installation
```bash
# Open Terminal and run:
docker --version
docker-compose --version

# Check Docker is running
docker info
```

## 2. Install Docker Compose

Docker Compose is included with Docker Desktop for Mac, so no separate installation is needed.

### Verify Docker Compose Installation
```bash
docker-compose --version
# or newer syntax
docker compose version
```

## 3. Start MongoDB and MongoDB UI using Docker Compose

### Step 1: Navigate to Project Directory
```bash
# Open Terminal and navigate to your project
cd "/path/to/your/project/data-base/mongodb"
```

### Step 2: Start MongoDB Services
```bash
# Start MongoDB and Mongo Express UI
docker-compose up -d

# Check if containers are running
docker-compose ps

# View container logs
docker-compose logs -f
```

### Step 3: Verify MongoDB is Running
```bash
# Check container logs
docker-compose logs mongodb
docker-compose logs mongo-express

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"

# Check running containers
docker ps
```

### Access Points:
- **MongoDB**: `mongodb://localhost:27017`
- **MongoDB UI**: http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

## 4. Stop MongoDB and MongoDB UI using Docker Compose

### Stop All Services
```bash
# Stop and remove containers
docker-compose down

# Stop containers but keep them for restart
docker-compose stop

# Restart stopped containers
docker-compose start

# View status
docker-compose ps
```

### Complete Cleanup (if needed)
```bash
# Remove containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Remove specific images (if needed)
docker image rm mongo:7.0 mongo-express:1.0.0
```

## Troubleshooting

### Common Issues:

1. **Docker Desktop not starting**
   ```bash
   # Check if Docker daemon is running
   docker info
   
   # Restart Docker Desktop
   # Use Spotlight: Cmd+Space, type "Docker Desktop"
   
   # Check system resources
   top -l 1 | grep CPU
   ```

2. **Port conflicts**
   ```bash
   # Check what's using port 27017
   lsof -i :27017
   
   # Kill process using the port
   sudo kill -9 <PID>
   
   # Check all Docker ports
   docker port $(docker ps -q)
   ```

3. **Permission issues**
   ```bash
   # Fix Docker socket permissions
   sudo chown $(whoami) /var/run/docker.sock
   
   # Or add user to docker group
   sudo dscl . -append /Groups/docker GroupMembership $(whoami)
   ```

4. **Apple Silicon compatibility issues**
   ```bash
   # Force ARM64 platform
   docker-compose up -d --platform linux/arm64
   
   # Check platform
   docker inspect mongodb | grep Architecture
   ```

5. **Memory issues on M1/M2**
   ```bash
   # Increase Docker memory in Docker Desktop preferences
   # Recommended: 4GB+ for development
   
   # Check memory usage
   docker stats
   ```

## ARM64 Specific Considerations

### MongoDB ARM64 Image
The MongoDB 7.0 image supports ARM64 natively. If you encounter issues:

```bash
# Explicitly pull ARM64 image
docker pull --platform linux/arm64 mongo:7.0

# Check image architecture
docker inspect mongo:7.0 | grep Architecture
```

### Performance Optimization for Apple Silicon
```bash
# Use native ARM64 images when possible
docker pull --platform linux/arm64 mongo:7.0
docker pull --platform linux/arm64 mongo-express:1.0.0

# Check container performance
docker stats --no-stream
```

## MongoDB Configuration

The MongoDB service uses these default configurations:
- **Database**: `tododb`
- **Username**: `admin`
- **Password**: `todopassword123`
- **Port**: `27017`
- **Platform**: `linux/arm64` (optimized for Apple Silicon)

## macOS Specific Commands

### Using Homebrew (Alternative Installation)
```bash
# Install Docker via Homebrew (if preferred)
brew install --cask docker

# Install Docker Compose separately (if needed)
brew install docker-compose
```

### Using Finder for Navigation
```bash
# Open project directory in Finder
open "/path/to/your/project/data-base/mongodb"

# Open current directory in Finder
open .
```

## Next Steps

Once MongoDB is running, you can proceed to:
1. Set up the Express.js backend
2. Configure the Angular frontend
3. Test the complete application stack

## Useful Commands

```bash
# View container status
docker-compose ps

# View container logs (follow mode)
docker-compose logs -f

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Restore database
docker-compose exec mongodb mongorestore /backup

# Check disk usage
docker system df

# Clean up unused resources
docker system prune

# Monitor resource usage
docker stats

# View Docker Desktop info
docker context ls
```

## Security Considerations for macOS

```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Allow Docker through firewall if needed
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Applications/Docker.app/Contents/MacOS/Docker

# Check Docker Desktop security settings
# Open Docker Desktop > Preferences > Advanced > Security
```

## Environment Variables for macOS

Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
# Docker environment
export DOCKER_HOST=unix:///var/run/docker.sock

# MongoDB connection string
export MONGODB_URI="mongodb://admin:todopassword123@localhost:27017/tododb?authSource=admin"
```

Reload your shell:
```bash
source ~/.zshrc
# or
source ~/.bash_profile
```