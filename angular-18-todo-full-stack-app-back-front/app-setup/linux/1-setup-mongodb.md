# MongoDB Setup for Linux

This guide will help you set up MongoDB using Docker on Linux for the Angular Todo Application.

## Prerequisites
- Linux distribution (Ubuntu 20.04+, Debian 10+, CentOS 8+, Fedora 34+, etc.)
- sudo privileges
- Internet connection

## 1. Install Docker

### For Ubuntu/Debian:
```bash
# Update package index
sudo apt update

# Install dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker --version
```

### For CentOS/RHEL/Fedora:
```bash
# Install dependencies
sudo dnf install -y dnf-plugins-core

# Add Docker repository
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo

# Install Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
sudo docker --version
```

### For Arch Linux:
```bash
# Install Docker
sudo pacman -S docker docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
sudo docker --version
```

### Add User to Docker Group (Optional but Recommended):
```bash
# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes (logout and login, or use newgrp)
newgrp docker

# Verify you can run docker without sudo
docker --version
docker ps
```

## 2. Install Docker Compose

### Method 1: Install via Package Manager (Recommended)
```bash
# Ubuntu/Debian
sudo apt install docker-compose-plugin

# CentOS/RHEL/Fedora
sudo dnf install docker-compose-plugin

# Arch Linux
sudo pacman -S docker-compose
```

### Method 2: Install Standalone Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Create symlink (optional)
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installation
docker-compose --version
```

## 3. Start MongoDB and MongoDB UI using Docker Compose

### Step 1: Navigate to Project Directory
```bash
# Navigate to MongoDB directory
cd "/path/to/your/project/data-base/mongodb"

# Check if docker-compose.yml exists
ls -la docker-compose.yml
```

### Step 2: Start MongoDB Services
```bash
# Start MongoDB and Mongo Express UI (with sudo if needed)
docker-compose up -d

# If you added user to docker group:
# docker-compose up -d

# Check if containers are running
docker-compose ps

# View container logs
docker-compose logs -f
```

### Step 3: Verify MongoDB is Running
```bash
# Check container status
docker ps

# Check MongoDB logs
docker-compose logs mongodb

# Check Mongo Express logs
docker-compose logs mongo-express

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"

# Check if ports are open
ss -tlnp | grep -E ':(27017|8081)'
```

### Access Points:
- **MongoDB**: `mongodb://localhost:27017`
- **MongoDB UI**: http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

### Step 4: Configure Firewall (if needed)
```bash
# For UFW (Ubuntu)
sudo ufw allow 27017/tcp
sudo ufw allow 8081/tcp

# For firewalld (CentOS/RHEL/Fedora)
sudo firewall-cmd --permanent --add-port=27017/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload

# For iptables (manual)
sudo iptables -A INPUT -p tcp --dport 27017 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
```

## 4. Stop MongoDB and MongoDB UI using Docker Compose

### Stop All Services
```bash
# Stop and remove containers
docker-compose down

# Stop containers but keep them for restart
docker-compose stop

# Restart stopped containers
docker-compose start

# View container status
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

# Remove all Docker data (use with extreme caution)
docker system prune -a --volumes
```

## Troubleshooting

### Common Issues:

1. **Permission denied when accessing Docker**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   
   # Or use sudo for docker commands
   sudo docker-compose up -d
   ```

2. **Port conflicts**
   ```bash
   # Check what's using ports 27017 and 8081
   sudo ss -tlnp | grep -E ':(27017|8081)'
   sudo netstat -tlnp | grep -E ':(27017|8081)'
   
   # Kill process using the port
   sudo kill -9 <PID>
   
   # Or stop existing MongoDB
   sudo systemctl stop mongod
   ```

3. **Docker daemon not running**
   ```bash
   # Start Docker daemon
   sudo systemctl start docker
   
   # Enable Docker to start on boot
   sudo systemctl enable docker
   
   # Check Docker status
   sudo systemctl status docker
   ```

4. **SELinux issues (CentOS/RHEL)**
   ```bash
   # Check SELinux status
   sestatus
   
   # Set SELinux to permissive (temporary)
   sudo setenforce 0
   
   # Or configure SELinux for Docker
   sudo setsebool -P container_manage_cgroup on
   ```

5. **Memory/disk space issues**
   ```bash
   # Check disk space
   df -h
   
   # Check memory
   free -h
   
   # Clean up Docker resources
   docker system prune -a
   ```

6. **Network connectivity issues**
   ```bash
   # Check Docker network
   docker network ls
   
   # Inspect MongoDB network
   docker network inspect mongodb_todo-network
   
   # Test container connectivity
   docker-compose exec mongodb ping mongo-express
   ```

## MongoDB Configuration for Linux

The MongoDB service uses these default configurations:
- **Database**: `tododb`
- **Username**: `admin`
- **Password**: `todopassword123`
- **Port**: `27017`
- **Data Directory**: `./data` (mounted volume)

### Custom Configuration (if needed):
```bash
# Edit docker-compose.yml to customize settings
nano docker-compose.yml

# Environment variables you can modify:
# MONGO_INITDB_ROOT_USERNAME
# MONGO_INITDB_ROOT_PASSWORD
# MONGO_INITDB_DATABASE
```

## Security Considerations for Linux

### Firewall Configuration:
```bash
# Ubuntu/Debian (UFW)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 27017/tcp comment "MongoDB"
sudo ufw allow 8081/tcp comment "Mongo Express"

# CentOS/RHEL/Fedora (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-port=27017/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload
```

### SELinux Configuration (CentOS/RHEL):
```bash
# Allow Docker containers to access network
sudo setsebool -P container_manage_cgroup on
sudo setsebool -P container_use_cgroup on

# Allow Docker to access files
sudo setsebool -P container_manage_cgroup on
```

### Docker Security:
```bash
# Run containers with limited privileges (add to docker-compose.yml)
# security_opt:
#   - no-new-privileges:true
# read_only: true (for read-only containers)

# Check container security
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock docker/docker-bench-security
```

## System Service Configuration

### Create systemd service for MongoDB (optional):
```bash
# Create service file
sudo tee /etc/systemd/system/mongodb-todo.service > /dev/null <<EOF
[Unit]
Description=MongoDB Todo Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/your/project/data-base/mongodb
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable mongodb-todo.service

# Start service
sudo systemctl start mongodb-todo.service

# Check status
sudo systemctl status mongodb-todo.service
```

## Performance Tuning for Linux

### System Configuration:
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Configure kernel parameters for MongoDB
echo "vm.swappiness = 1" | sudo tee -a /etc/sysctl.conf
echo "vm.dirty_ratio = 15" | sudo tee -a /etc/sysctl.conf
echo "vm.dirty_background_ratio = 5" | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -p
```

### Docker Performance:
```bash
# Use faster storage driver (if available)
# Add to /etc/docker/daemon.json:
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker
sudo systemctl restart docker
```

## Next Steps

Once MongoDB is running, you can proceed to:
1. Set up the Express.js backend
2. Configure the Angular frontend
3. Test the complete application stack

## Useful Linux Commands

```bash
# System information
cat /etc/os-release
uname -a
lscpu
free -h
df -h

# Docker management
docker ps -a
docker logs <container_name>
docker exec -it <container_name> bash
docker stats

# Process management
ps aux | grep docker
systemctl status docker
journalctl -u docker.service

# Network diagnostics
ss -tlnp
netstat -tlnp
iptables -L
curl localhost:27017

# File operations
find /var/lib/docker -name "*.log" -type f
du -sh /var/lib/docker/
```

## Monitoring and Logging

### Container Monitoring:
```bash
# Monitor container resources
docker stats

# View container logs
docker-compose logs -f mongodb
docker-compose logs -f mongo-express

# Export logs
docker-compose logs mongodb > mongodb.log
```

### System Monitoring:
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs  # Ubuntu/Debian
sudo dnf install htop iotop nethogs  # CentOS/RHEL/Fedora

# Monitor system resources
htop
iotop
nethogs

# Check disk I/O
iostat -x 1
```