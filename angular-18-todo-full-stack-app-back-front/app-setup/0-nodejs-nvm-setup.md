# Node.js and NVM Setup Guide

This guide covers the installation of Node.js and NVM (Node Version Manager) which are required for both Express.js backend and Angular frontend applications across all platforms.

## What is Node.js?
Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine that allows you to run JavaScript on the server side.

## What is NVM?
NVM (Node Version Manager) allows you to install and manage multiple versions of Node.js on your system, making it easy to switch between different versions for different projects.

## Platform-Specific Installation

### Windows

#### Method 1: Using Node.js Official Installer (Recommended for beginners)
```powershell
# Download from https://nodejs.org/
# Choose LTS version (18.x or 20.x)
# Run the installer and follow the setup wizard

# Verify installation
node --version
npm --version
```

#### Method 2: Using Chocolatey Package Manager
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Verify installation
node --version
npm --version
```

#### Method 3: Using NVM for Windows
```powershell
# Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
# Install the nvm-setup.zip

# After installation, open new Command Prompt/PowerShell as Administrator
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0

# Verify installation
node --version
npm --version
nvm list
```

### Mac ARM (Apple Silicon - M1/M2/M3)

#### Method 1: Using Homebrew (Recommended)
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (ARM64 optimized)
brew install node@18

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
node --version
npm --version
```

#### Method 2: Using NVM (Recommended for version management)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload terminal or source profile
source ~/.zshrc

# Install Node.js 18.x (ARM64 optimized)
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0

# Verify installation
node --version
npm --version
nvm list
```

#### Method 3: Using Official Installer
```bash
# Download ARM64 version from https://nodejs.org/
# Choose "macOS Installer (.pkg)" for Apple Silicon

# Verify installation after install
node --version
npm --version
```

### Linux (Ubuntu/Debian/CentOS/RHEL)

#### Method 1: Using NVM (Recommended)
```bash
# Update system packages
sudo apt update  # Ubuntu/Debian
# OR
sudo yum update  # CentOS/RHEL

# Install curl if not installed
sudo apt install -y curl  # Ubuntu/Debian
# OR
sudo yum install -y curl  # CentOS/RHEL

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload bash profile
source ~/.bashrc

# Install Node.js
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0

# Verify installation
node --version
npm --version
nvm list
```

#### Method 2: Using NodeSource Repository
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

#### Method 3: Using Package Manager
```bash
# Ubuntu/Debian (Note: May have older version)
sudo apt update
sudo apt install -y nodejs npm

# CentOS/RHEL
sudo yum install -y nodejs npm

# Fedora
sudo dnf install -y nodejs npm

# Verify installation
node --version
npm --version
```

### Raspberry Pi ARM

#### Method 1: Using NVM (Recommended for Pi)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y curl build-essential

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js (ARM-compatible version)
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0

# Configure npm for Pi optimization
npm config set fund false
npm config set audit false
npm config set progress false

# Verify installation
node --version
npm --version
uname -m  # Should show armv7l or aarch64
```

#### Method 2: Using NodeSource (for Raspberry Pi OS)
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools for native modules
sudo apt install -y build-essential

# Verify installation
node --version
npm --version
```

#### Method 3: Using Pi-specific optimizations
```bash
# For older Pi models or memory constraints
sudo apt update
sudo apt install -y nodejs npm

# Increase swap space for npm operations
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Configure memory limits
echo 'export NODE_OPTIONS="--max-old-space-size=1024"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
node --version
npm --version
```

## Version Verification and Management

### Check Current Versions
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check NVM version (if installed)
nvm --version

# List installed Node.js versions (NVM)
nvm list
```

### Recommended Versions for This Project
- **Node.js**: 18.17.0 or later (LTS)
- **npm**: 9.x or later (comes with Node.js)

### NVM Common Commands
```bash
# List available Node.js versions
nvm list-remote

# Install specific version
nvm install 18.17.0

# Use specific version for current session
nvm use 18.17.0

# Set default version
nvm alias default 18.17.0

# Install latest LTS
nvm install --lts
nvm use --lts

# Switch between versions
nvm use 16.20.0
nvm use 18.17.0
```

## npm Configuration and Optimization

### Basic npm Configuration
```bash
# Update npm to latest version
npm install -g npm@latest

# Configure npm registry (if needed)
npm config set registry https://registry.npmjs.org/

# Configure cache directory
npm config set cache ~/.npm-cache

# Disable funding messages
npm config set fund false

# Disable audit warnings during install
npm config set audit false
```

### Platform-Specific Optimizations

#### Windows Optimizations
```powershell
# Set npm cache location
npm config set cache C:\npm-cache

# Configure for Windows long path support
npm config set scripts-prepend-node-path true

# Set maximum memory for npm operations
$env:NODE_OPTIONS="--max-old-space-size=4096"
```

#### Mac ARM Optimizations
```bash
# Configure for Apple Silicon
npm config set target_arch arm64
npm config set target_platform darwin

# Set memory limits for compilation
export NODE_OPTIONS="--max-old-space-size=4096"
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.zshrc
```

#### Linux Optimizations
```bash
# Set memory limits
export NODE_OPTIONS="--max-old-space-size=4096"
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc

# Configure for better performance
npm config set progress false
npm config set loglevel warn
```

#### Raspberry Pi Optimizations
```bash
# Conservative memory settings for Pi
export NODE_OPTIONS="--max-old-space-size=1024"
echo 'export NODE_OPTIONS="--max-old-space-size=1024"' >> ~/.bashrc

# Disable unnecessary features
npm config set fund false
npm config set audit false
npm config set progress false
npm config set optional false
```

## Troubleshooting Common Issues

### Permission Issues (Linux/Mac)
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Or use sudo (not recommended)
sudo chown -R $(whoami) ~/.npm
```

### Windows Path Issues
```powershell
# Add Node.js to PATH manually
$env:PATH += ";C:\Program Files\nodejs"

# Or add permanently through System Properties > Environment Variables
```

### Version Conflicts
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall Node.js
nvm uninstall 18.17.0
nvm install 18.17.0

# Or for non-NVM installations, download fresh installer
```

### ARM Architecture Issues (Pi/Mac ARM)
```bash
# Force architecture-specific installation
npm config set target_arch arm64  # Mac ARM
npm config set target_arch arm    # Raspberry Pi

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Testing Your Installation

### Create a Test Script
```bash
# Create test file
cat > test-node-setup.js << 'EOF'
console.log('Node.js Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Memory Usage:', process.memoryUsage());

// Test npm
const { execSync } = require('child_process');
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log('npm Version:', npmVersion);
    console.log('✅ Node.js and npm are working correctly!');
} catch (error) {
    console.error('❌ npm test failed:', error.message);
}
EOF

# Run test
node test-node-setup.js
```

### Expected Output
```
Node.js Version: v18.17.0
Platform: linux (or darwin, win32)
Architecture: x64 (or arm64, arm)
Memory Usage: { rss: 123456, heapTotal: 789012, heapUsed: 345678, external: 901234, arrayBuffers: 567890 }
npm Version: 9.6.7
✅ Node.js and npm are working correctly!
```

## Next Steps

After completing this Node.js and NVM setup:

1. **For Express.js Backend**: Proceed to your platform-specific `2-setup-expressjs.md` guide
2. **For Angular Frontend**: Proceed to your platform-specific `3-setup-angular.md` guide

Both Express.js and Angular require Node.js and npm to be properly installed and configured as covered in this guide.

## Additional Resources

- [Node.js Official Documentation](https://nodejs.org/docs/)
- [NVM GitHub Repository](https://github.com/nvm-sh/nvm)
- [npm Documentation](https://docs.npmjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

Your Node.js and NVM environment is now ready for Express.js and Angular development!