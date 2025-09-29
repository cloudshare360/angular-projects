# 🎯 Wireframes Demo - Quick Reference Guide

## 🚀 Starting the Demo

```bash
# In wireframes-and-design directory
./start-wireframes-demo.sh
```

✅ **Server will start on**: http://localhost:8080  
✅ **Browser opens automatically**  
✅ **Interactive navigation enabled**

## 🎮 Navigation Flow

### 🔄 Complete User Journey

```
🏠 Main Index
    ↓ [🚀 Start Interactive Demo]
🔐 Authentication Page
    ↓ [Select Role + Login]
    ├── 👤 User Dashboard ────→ 📝 Task Management
    └── 🔧 Admin Dashboard ───→ 👤 Switch to User
```

### 🎯 Quick Navigation

| From Any Page | Action | Result |
|---------------|--------|--------|
| Click **← Back to Overview** | Return to main index | 🏠 Main wireframes page |
| Click **Navigation Tabs** | Jump to any wireframe | Direct page access |
| Press **Alt + S** | Keyboard shortcut | 🚀 Start demo |
| Press **Alt + H** | Keyboard shortcut | ⬆️ Scroll to top |

## 🔗 Direct URLs

| Page | URL | Purpose |
|------|-----|---------|
| **🏠 Main** | http://localhost:8080/ | Overview & demo start |
| **🔐 Auth** | http://localhost:8080/wireframes/desktop/01-authentication.html | Login/register forms |
| **👤 User** | http://localhost:8080/wireframes/desktop/02-user-dashboard.html | User todo interface |
| **🔧 Admin** | http://localhost:8080/wireframes/desktop/03-admin-dashboard.html | Admin panel |
| **📝 Tasks** | http://localhost:8080/wireframes/desktop/04-task-management.html | Advanced todo features |

## 🎨 Interactive Features

### 🔐 Authentication Page
- **Role Selection**: Click User/Admin login tabs
- **Form Switching**: Toggle between Login/Registration
- **Smart Routing**: Login button detects role and navigates accordingly

### 👤 User Dashboard
- **Add Todo**: Click "Add Todo" → Opens Task Management
- **Edit Todo**: Click ✏️ buttons → Opens Task Management
- **Logout**: Click "Logout" → Returns to Authentication

### 🔧 Admin Dashboard
- **Switch Views**: Click "Switch to User" → User Dashboard
- **Quick Actions**: Click action cards for demos
- **Logout**: Click "Logout" → Returns to Authentication

### 📝 Task Management
- **Navigation Header**: Access all other wireframes
- **Back to Overview**: Return to main page

## 🛑 Stopping the Demo

```bash
# In wireframes-and-design directory
./stop-wireframes-demo.sh
```

✅ **Graceful server shutdown**  
✅ **Port 8080 freed**  
✅ **Log files preserved**

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Blank pages** | Use http://localhost:8080 (not file:// URLs) |
| **Port in use** | Run `./stop-wireframes-demo.sh` first |
| **Permission denied** | Run `chmod +x *.sh` |
| **Python not found** | Install Python 3 |
| **Browser not opening** | Manually visit http://localhost:8080 |

## 📊 Server Status Indicators

| Status | Meaning |
|--------|---------|
| ✅ **Server Running** | Demo fully functional |
| ❌ **File Mode** | Need to start server |
| ⚠️ **Unknown Status** | Check network/firewall |

## 🎯 Demo Highlights

### 🌟 Key Features to Explore
1. **Role-based Authentication** - Switch between User/Admin
2. **Interactive Navigation** - Seamless page transitions
3. **Form Validation** - Realistic input handling
4. **Dashboard Statistics** - Mock data visualization
5. **Task Management** - Advanced todo features
6. **Admin Controls** - User management interface

### 📱 Browser Compatibility
- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅

---

**🎮 Ready to start? Run `./start-wireframes-demo.sh` and explore!**