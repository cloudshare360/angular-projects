# Platform Setup Guides for Angular Todo Full-Stack Application

This folder contains comprehensive setup guides for setting up the Angular Todo Full-Stack Application across different platforms and architectures.

## 📋 Setup Order

**IMPORTANT**: Follow the setup guides in this specific order:

1. **[0-nodejs-nvm-setup.md](0-nodejs-nvm-setup.md)** - Node.js and NVM setup (REQUIRED FIRST)
2. **[Platform]/1-setup-mongodb.md** - MongoDB database setup
3. **[Platform]/2-setup-expressjs.md** - Express.js backend API setup  
4. **[Platform]/3-setup-angular.md** - Angular frontend application setup

## 🖥️ Platform-Specific Guides

### Windows
- **[windows/1-setup-mongodb.md](windows/1-setup-mongodb.md)** - MongoDB setup for Windows
- **[windows/2-setup-expressjs.md](windows/2-setup-expressjs.md)** - Express.js setup for Windows
- **[windows/3-setup-angular.md](windows/3-setup-angular.md)** - Angular setup for Windows

### Mac ARM (Apple Silicon - M1/M2/M3)
- **[mac-arm/1-setup-mongodb.md](mac-arm/1-setup-mongodb.md)** - MongoDB setup for Apple Silicon
- **[mac-arm/2-setup-expressjs.md](mac-arm/2-setup-expressjs.md)** - Express.js setup for Mac ARM
- **[mac-arm/3-setup-angular.md](mac-arm/3-setup-angular.md)** - Angular setup for Mac ARM

### Linux (Ubuntu/Debian/CentOS/RHEL)
- **[linux/1-setup-mongodb.md](linux/1-setup-mongodb.md)** - MongoDB setup for Linux
- **[linux/2-setup-expressjs.md](linux/2-setup-expressjs.md)** - Express.js setup for Linux
- **[linux/3-setup-angular.md](linux/3-setup-angular.md)** - Angular setup for Linux

### Raspberry Pi ARM
- **[pi-arm/1-setup-mongodb.md](pi-arm/1-setup-mongodb.md)** - MongoDB setup for Raspberry Pi
- **[pi-arm/2-setup-expressjs.md](pi-arm/2-setup-expressjs.md)** - Express.js setup for Pi ARM
- **[pi-arm/3-setup-angular.md](pi-arm/3-setup-angular.md)** - Angular setup for Pi ARM

## 🚀 Quick Start

### 1. Choose Your Platform
Select the appropriate platform folder based on your system:
- **Windows**: Use `windows/` folder
- **Mac with Apple Silicon**: Use `mac-arm/` folder  
- **Linux**: Use `linux/` folder
- **Raspberry Pi**: Use `pi-arm/` folder

### 2. Follow the Setup Sequence
```bash
# Step 1: Set up Node.js and NVM (REQUIRED)
# Read: 0-nodejs-nvm-setup.md

# Step 2: Set up MongoDB
# Read: [platform]/1-setup-mongodb.md

# Step 3: Set up Express.js Backend
# Read: [platform]/2-setup-expressjs.md

# Step 4: Set up Angular Frontend
# Read: [platform]/3-setup-angular.md
```

### 3. Verify Complete Setup
After completing all guides, verify your full-stack application:

```bash
# Check MongoDB (should show database status)
docker ps | grep mongo

# Check Express.js API (should return health status)
curl http://localhost:3000/health

# Check Angular (should load the application)
curl http://localhost:4200
```

## 🔧 What Each Guide Covers

### Node.js & NVM Setup (Common)
- Platform-specific Node.js installation methods
- NVM (Node Version Manager) setup and configuration
- Version verification and troubleshooting
- Performance optimizations per platform

### MongoDB Setup
- Docker-based MongoDB installation
- MongoDB container configuration
- Database initialization and seeding
- Mongo Express web interface
- Connection testing and troubleshooting

### Express.js Backend Setup
- Express.js application installation
- Dependency management and configuration
- Environment variable setup
- API server startup and testing
- Production deployment considerations

### Angular Frontend Setup
- Angular CLI installation and configuration
- Project dependency installation
- Development server setup
- Build optimization per platform
- Testing and deployment

## 📊 Platform Comparison

| Feature | Windows | Mac ARM | Linux | Pi ARM |
|---------|---------|---------|-------|--------|
| **Performance** | High | Very High | High | Moderate |
| **Memory Usage** | 4GB+ | 4GB+ | 2GB+ | 1GB+ |
| **Docker Support** | Docker Desktop | Docker Desktop | Native | Native |
| **Build Speed** | Fast | Very Fast | Fast | Slow |
| **Development Experience** | Excellent | Excellent | Excellent | Good |

## 🎯 Platform-Specific Optimizations

### Windows Optimizations
- PowerShell script execution policies
- Windows Defender exclusions for development folders
- WSL2 integration for better Docker performance
- Visual Studio Code integration

### Mac ARM Optimizations
- Rosetta 2 compatibility for legacy packages
- Homebrew ARM64 package prioritization
- Xcode command line tools integration
- M1/M2/M3 specific performance tuning

### Linux Optimizations
- systemd service configuration
- UFW firewall rules for development ports
- Package manager integration (apt/yum/dnf)
- Memory and swap optimization

### Raspberry Pi ARM Optimizations
- Memory-constrained compilation settings
- Temperature monitoring during builds
- ARM64 vs ARMv7 compatibility
- Power management and cooling considerations

## 🚨 Common Issues and Solutions

### Port Conflicts
```bash
# Check what's using your ports
netstat -tulpn | grep :3000  # Express.js
netstat -tulpn | grep :4200  # Angular
netstat -tulpn | grep :27017 # MongoDB

# Kill processes if needed
sudo kill -9 $(lsof -t -i:3000)
```

### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Check available memory
free -h  # Linux/Pi
vm_stat  # Mac
```

### Docker Issues
```bash
# Restart Docker service
sudo systemctl restart docker  # Linux
# Or restart Docker Desktop (Windows/Mac)

# Check Docker status
docker --version
docker ps
```

## 🧪 Testing Your Setup

### Automated Testing Scripts
Each platform folder includes testing scripts:
- `test-mongodb-[platform].sh` - MongoDB connectivity test
- `test-express-[platform].sh` - Express.js API test
- `test-angular-[platform].sh` - Angular application test

### Manual Testing Checklist
- [ ] Node.js and npm versions are correct
- [ ] MongoDB container is running and accessible
- [ ] Express.js API responds to health checks
- [ ] Angular development server starts successfully
- [ ] Full-stack integration works (frontend → API → database)

## 📱 Mobile and Network Access

### Network Configuration
All guides include network accessibility setup:
- **Local access**: `http://localhost:[port]`
- **Network access**: `http://[your-ip]:[port]`
- **Mobile testing**: QR codes for easy mobile access

### Firewall Configuration
Platform-specific firewall rules for development ports:
- **3000**: Express.js API
- **4200**: Angular development server
- **27017**: MongoDB (if external access needed)
- **8081**: Mongo Express web interface

## 🔄 Updates and Maintenance

### Keeping Dependencies Updated
```bash
# Update Node.js via NVM
nvm install node --latest-npm
nvm use node

# Update Angular CLI
npm update -g @angular/cli

# Update project dependencies
npm update
```

### Platform-Specific Updates
- **Windows**: Windows Update, Docker Desktop updates
- **Mac**: macOS updates, Homebrew updates (`brew update && brew upgrade`)
- **Linux**: System package updates (`sudo apt update && sudo apt upgrade`)
- **Pi**: Raspberry Pi OS updates, temperature monitoring

## 📚 Additional Resources

### Documentation Links
- [Node.js Official Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Angular Documentation](https://angular.io/docs)
- [Docker Documentation](https://docs.docker.com/)

### Community and Support
- [Stack Overflow](https://stackoverflow.com/questions/tagged/mean-stack)
- [Angular Community](https://angular.io/community)
- [MongoDB Community](https://www.mongodb.com/community)
- [Node.js Community](https://nodejs.org/en/community)

## 🤝 Contributing

If you encounter issues or have improvements for these setup guides:
1. Document the issue with your platform and environment details
2. Test the solution thoroughly
3. Update the relevant platform guide
4. Submit changes for review

## 📄 License

These setup guides are part of the Angular Todo Full-Stack Application project and follow the same licensing terms.

---

**Happy Coding!** 🎉

Choose your platform above and start with the Node.js setup guide, then follow the numbered sequence for your specific platform.