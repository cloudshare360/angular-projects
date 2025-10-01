# MongoDB Setup for Raspberry Pi ARM

This guide will help you set up MongoDB using Docker on Raspberry Pi (ARM architecture) for the Angular Todo Application.

## Prerequisites
- Raspberry Pi 4 (recommended) or Raspberry Pi 3B+ with ARM architecture
- Raspberry Pi OS (64-bit recommended for better performance)
- sudo privileges
- Internet connection
- At least 4GB RAM recommended
- MicroSD card with at least 32GB

## System Preparation

### Step 1: Update System
```bash
# Update package lists and system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim nano htop

# Check system information
uname -a
cat /proc/cpuinfo | grep "model name"
free -h
df -h
```

### Step 2: Enable cgroups (required for Docker)
```bash
# Edit boot configuration
sudo nano /boot/firmware/cmdline.txt

# Add the following to the end of the line (on the same line):
# cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1

# Example:
# console=serial0,115200 console=tty1 root=PARTUUID=12345678-02 rootfstype=ext4 fsck.repair=yes rootwait cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1

# Reboot to apply changes
sudo reboot
```

## 1. Install Docker

### Step 1: Install Docker using convenience script
```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
docker info
```

### Step 2: Optimize Docker for Raspberry Pi
```bash
# Create Docker daemon configuration
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# Restart Docker
sudo systemctl restart docker
```

## 2. Install Docker Compose

### Method 1: Install via pip (Recommended for Pi)
```bash
# Install Python3 and pip
sudo apt install -y python3-pip python3-dev libffi-dev libssl-dev

# Install Docker Compose
sudo pip3 install docker-compose

# Verify installation
docker-compose --version
```

### Method 2: Install precompiled binary
```bash
# Download Docker Compose for ARM
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Create symlink
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installation
docker-compose --version
```

## 3. ARM-Specific MongoDB Configuration

### Step 1: Modify docker-compose.yml for ARM
```bash
# Navigate to MongoDB directory
cd "/path/to/your/project/data-base/mongodb"

# Backup original docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Create ARM-optimized docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MongoDB Database - ARM64 optimized
  mongodb:
    image: mongo:7.0
    platform: linux/arm64
    container_name: angular-todo-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: todopassword123
      MONGO_INITDB_DATABASE: tododb
    volumes:
      - ./data:/data/db
      - ./seed-data:/docker-entrypoint-initdb.d
    networks:
      - todo-network
    # ARM-specific optimizations
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # MongoDB Express UI - ARM64 optimized
  mongo-express:
    image: mongo-express:1.0.0
    platform: linux/arm64
    container_name: angular-todo-mongo-ui
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: todopassword123
      ME_CONFIG_MONGODB_URL: mongodb://admin:todopassword123@mongodb:27017/
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin123
    depends_on:
      - mongodb
    networks:
      - todo-network
    # ARM-specific optimizations
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

networks:
  todo-network:
    driver: bridge

volumes:
  mongodb_data:
EOF
```

### Step 2: Pre-pull ARM64 Images
```bash
# Pre-pull ARM64 MongoDB images
docker pull --platform linux/arm64 mongo:7.0
docker pull --platform linux/arm64 mongo-express:1.0.0

# Verify images are ARM64
docker inspect mongo:7.0 | grep Architecture
docker inspect mongo-express:1.0.0 | grep Architecture
```

## 4. Start MongoDB and MongoDB UI

### Step 1: Start Services
```bash
# Navigate to MongoDB directory
cd "/path/to/your/project/data-base/mongodb"

# Start MongoDB services
docker-compose up -d

# Monitor startup (ARM might be slower)
docker-compose logs -f

# Check container status
docker-compose ps
docker stats --no-stream
```

### Step 2: Verify MongoDB is Running
```bash
# Check container health
docker-compose ps
docker inspect angular-todo-mongodb | grep "Status"

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"

# Check if ports are accessible
ss -tlnp | grep -E ':(27017|8081)'

# Test from host
curl -I localhost:8081
```

### Step 3: Performance Monitoring on Pi
```bash
# Monitor system resources
htop

# Monitor temperature (important for Pi)
vcgencmd measure_temp

# Monitor Docker container resources
docker stats

# Check memory usage
free -h
```

### Access Points:
- **MongoDB**: `mongodb://localhost:27017`
- **MongoDB UI**: http://[PI_IP_ADDRESS]:8081
  - Username: `admin`
  - Password: `admin123`

## 5. Stop MongoDB and MongoDB UI

### Stop Services
```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove with volumes (caution: deletes data)
docker-compose down -v
```

### Complete Cleanup
```bash
# Remove all containers and images
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a

# Check disk space
df -h
```

## Raspberry Pi Specific Optimizations

### 1. Memory Management
```bash
# Increase swap size for better performance
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile

# Change CONF_SWAPSIZE to 2048 (or higher if you have space)
# CONF_SWAPSIZE=2048

sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Verify swap
free -h
```

### 2. Storage Optimization
```bash
# Use external USB drive for Docker data (recommended)
# Format USB drive
sudo fdisk -l  # Find your USB drive (e.g., /dev/sda1)
sudo mkfs.ext4 /dev/sda1

# Mount USB drive
sudo mkdir -p /mnt/usb-storage
sudo mount /dev/sda1 /mnt/usb-storage

# Add to fstab for permanent mounting
echo '/dev/sda1 /mnt/usb-storage ext4 defaults 0 0' | sudo tee -a /etc/fstab

# Move Docker root to USB drive
sudo systemctl stop docker
sudo mv /var/lib/docker /mnt/usb-storage/
sudo ln -s /mnt/usb-storage/docker /var/lib/docker
sudo systemctl start docker
```

### 3. CPU Governor Settings
```bash
# Set CPU governor to performance (for development)
echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Or make it permanent
echo 'GOVERNOR="performance"' | sudo tee -a /etc/default/cpufrequtils
```

### 4. Temperature Monitoring
```bash
# Create temperature monitoring script
cat > monitor-temp.sh << 'EOF'
#!/bin/bash
while true; do
    temp=$(vcgencmd measure_temp | cut -d= -f2 | cut -d\' -f1)
    echo "$(date): CPU Temperature: ${temp}°C"
    if (( $(echo "$temp > 75" | bc -l) )); then
        echo "WARNING: High temperature detected!"
    fi
    sleep 60
done
EOF

chmod +x monitor-temp.sh

# Run in background
nohup ./monitor-temp.sh > temp.log 2>&1 &
```

## Troubleshooting

### Common Issues on Raspberry Pi:

1. **Out of memory errors**
   ```bash
   # Check memory usage
   free -h
   cat /proc/meminfo
   
   # Increase swap size
   sudo dphys-swapfile swapoff
   sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   
   # Add memory limits to containers
   # See docker-compose.yml modifications above
   ```

2. **ARM64 vs ARM32 architecture issues**
   ```bash
   # Check architecture
   uname -m
   dpkg --print-architecture
   
   # Force ARM64 platform
   docker pull --platform linux/arm64 mongo:7.0
   
   # If using 32-bit Pi OS, use ARM32 images
   docker pull --platform linux/arm/v7 mongo:4.4
   ```

3. **Slow container startup**
   ```bash
   # This is normal on Pi, be patient
   # Monitor startup progress
   docker-compose logs -f mongodb
   
   # Check if containers are still starting
   docker-compose ps
   ```

4. **SD card corruption**
   ```bash
   # Check filesystem
   sudo fsck -f /dev/mmcblk0p2
   
   # Use high-quality SD card (Class 10, A2 rating)
   # Consider using USB SSD for better performance
   ```

5. **Network connectivity issues**
   ```bash
   # Check Docker network
   docker network ls
   docker network inspect mongodb_todo-network
   
   # Check if ports are accessible from other devices
   nmap -p 27017,8081 [PI_IP_ADDRESS]
   ```

6. **Power supply issues**
   ```bash
   # Check for under-voltage warnings
   dmesg | grep voltage
   vcgencmd get_throttled
   
   # Use official Pi power supply (5V, 3A for Pi 4)
   ```

### Performance Tuning for Raspberry Pi

1. **Docker optimizations**:
   ```bash
   # Limit log file sizes
   sudo tee /etc/docker/daemon.json > /dev/null <<EOF
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     },
     "storage-driver": "overlay2"
   }
   EOF
   
   sudo systemctl restart docker
   ```

2. **System optimizations**:
   ```bash
   # Disable unnecessary services
   sudo systemctl disable bluetooth
   sudo systemctl disable cups
   
   # Optimize GPU memory split
   echo 'gpu_mem=16' | sudo tee -a /boot/firmware/config.txt
   
   # Reboot to apply changes
   sudo reboot
   ```

## Monitoring and Maintenance

### System Health Monitoring
```bash
# Create monitoring script
cat > pi-monitor.sh << 'EOF'
#!/bin/bash
echo "=== Raspberry Pi System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Temperature: $(vcgencmd measure_temp)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h / | tail -1)"
echo "Docker: $(docker ps --format 'table {{.Names}}\t{{.Status}}')"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo "==============================="
EOF

chmod +x pi-monitor.sh

# Run monitoring
./pi-monitor.sh

# Schedule regular monitoring
echo "*/15 * * * * /path/to/pi-monitor.sh >> /var/log/pi-monitor.log" | crontab -
```

### Backup and Recovery
```bash
# Backup MongoDB data
docker-compose exec mongodb mongodump --out /backup

# Copy backup from container
docker cp angular-todo-mongodb:/backup ./mongodb-backup

# Create system backup script
cat > backup-system.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/mnt/usb-storage/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup MongoDB data
docker-compose -f /path/to/docker-compose.yml exec -T mongodb mongodump --out /backup
docker cp angular-todo-mongodb:/backup "$BACKUP_DIR/mongodb"

# Backup project files
cp -r /path/to/your/project "$BACKUP_DIR/project"

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x backup-system.sh
```

## Next Steps

Once MongoDB is running on your Raspberry Pi:
1. Set up the Express.js backend (see next guide)
2. Configure the Angular frontend
3. Test the complete application stack
4. Set up remote access if needed
5. Configure automatic backups

## Remote Access Configuration

### Access from other devices on network:
```bash
# Find Pi IP address
hostname -I
ip addr show

# Configure firewall (if needed)
sudo ufw allow 27017/tcp
sudo ufw allow 8081/tcp

# Test from another device
curl http://[PI_IP_ADDRESS]:8081
```

### Useful Raspberry Pi Commands

```bash
# System information
cat /proc/cpuinfo
vcgencmd version
vcgencmd get_config int

# Temperature and performance
vcgencmd measure_temp
vcgencmd measure_volts
vcgencmd get_throttled

# Memory and storage
free -h
df -h
lsblk

# Docker on Pi
docker system info
docker system df
docker stats --no-stream
```