# E2E Test Plan - Updated with Best Practices

## 📋 Test Plan Overview

### Test Execution Strategy
- **Sequential Execution**: Tests run one after another for better observation
- **Service Validation**: Mandatory pre-test validation of all services
- **Authentication Optimization**: Avoid redundant logins through state management
- **Inter-Test Delays**: 3-5 second delays between test cases
- **Responsive Testing**: Validate UI across multiple screen sizes

## 🔍 Pre-Test Validation Requirements

### Mandatory Service Check
Before ANY E2E test execution, the following script MUST pass:

```bash
./validate-services-before-e2e.sh
```

**Required Services Status:**
| Service | Port | Health Check | Expected Response |
|---------|------|--------------|------------------|
| MongoDB | 27017 | `netstat -ln \| grep :27017` | TCP LISTEN |
| Express.js | 3000 | `curl http://localhost:3000/health` | `{"data":{"message":"OK"}}` |
| Angular | 4200 | `curl -I http://localhost:4200` | `HTTP/1.1 200 OK` |

## 🎭 Test Cases with Optimized Flow

### Test Case 1: User Registration
**Objective**: Register new user and detect auto-authentication

**Steps:**
1. Navigate to registration page (2s observation delay)
2. Fill registration form with realistic delays (800ms per field)
3. Submit registration (4s processing delay)
4. **NEW**: Check if auto-authenticated to dashboard
5. **NEW**: Set `isAuthenticated = true` if redirected to dashboard

**Expected Result:**
- Registration successful
- Auto-authentication state detected and stored
- Dashboard accessible (if auto-authenticated)

**Responsive Testing:**
- ✅ Mobile (480px): Form layout stacks vertically
- ✅ Tablet (768px): Optimized spacing and inputs
- ✅ Desktop (1200px+): Standard two-column layout

### Test Case 2: User Login (Conditional)
**Objective**: Login only if not already authenticated

**Optimization:**
```typescript
if (isAuthenticated) {
  console.log('⏭️ User already authenticated, skipping login');
  // Verify dashboard access instead
  return;
}
```

**Steps (if login needed):**
1. Navigate to login page (2s observation delay)
2. Fill login credentials with delays (800ms per field)
3. Submit login (4s processing delay)
4. Verify dashboard redirection
5. Set authentication state

**Inter-Test Delay**: 5 seconds after completion

### Test Case 3: Dashboard Navigation
**Pre-conditions**: User authenticated (from registration or login)

**Steps:**
1. **NEW**: Start with 3s delay for stability
2. Access dashboard (verify authentication persists)
3. Test responsive navigation elements
4. Verify user welcome message display
5. **NEW**: End with 5s observation delay

**Responsive Validation:**
- Mobile: Navigation collapses to vertical stack
- Tablet: Reduced padding and font sizes
- Desktop: Full horizontal layout

### Test Case 4: Todo Operations
**Pre-conditions**: Authenticated user on dashboard

**Steps:**
1. **NEW**: 3s delay before starting operations
2. Create new todo with realistic input delays
3. Edit todo with form interaction delays
4. Mark todo complete/incomplete
5. Delete todo with confirmation
6. **NEW**: 5s delay between each operation for observation

**Responsive Testing:**
- Todo cards adapt to screen width
- Action buttons remain accessible on mobile
- Form modals responsive across devices

### Test Case 5: List Management
**Steps:**
1. **NEW**: 3s stabilization delay
2. Create new list with delays
3. Edit list properties
4. Add todos to specific list
5. Delete list with confirmation
6. **NEW**: 5s observation delay after each major action

### Test Case 6: Logout Flow
**Steps:**
1. **NEW**: 3s delay for final operations
2. Click logout button
3. Verify redirection to login page
4. **NEW**: Clear authentication state: `isAuthenticated = false`
5. Verify dashboard protection (should redirect to login)
6. **NEW**: 5s final delay for test suite completion

## ⚙️ Technical Configuration

### Playwright Configuration Updates
```typescript
export default defineConfig({
  fullyParallel: false, // Sequential execution
  workers: 1, // Single worker for observation
  timeout: 120000, // 2 minutes per test
  globalTimeout: 1800000, // 30 minutes total
  
  use: {
    headless: false, // Always visible for observation
    actionTimeout: 10000, // 10 seconds for actions
    navigationTimeout: 15000, // 15 seconds for navigation
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      headless: false,
      launchOptions: {
        slowMo: 1000, // 1 second between actions
      },
      viewport: { width: 1280, height: 720 },
    },
  }],
});
```

### Updated NPM Scripts
```json
{
  "test:e2e": "../../validate-services-before-e2e.sh && playwright test",
  "test:e2e:headed": "../../validate-services-before-e2e.sh && playwright test --headed",
  "test:e2e:mobile": "../../validate-services-before-e2e.sh && playwright test --project=mobile",
  "test:e2e:tablet": "../../validate-services-before-e2e.sh && playwright test --project=tablet",
  "validate:services": "../../validate-services-before-e2e.sh"
}
```

## 📱 Responsive Design Test Matrix

### Breakpoint Testing Requirements
| Device Category | Screen Width | Components to Test | Expected Behavior |
|-----------------|--------------|-------------------|------------------|
| Mobile | 320px-480px | Auth forms, Navigation, Todo cards | Vertical stacking, touch-friendly buttons |
| Tablet | 481px-768px | Dashboard grid, Lists view | Reduced columns, optimized spacing |
| Desktop | 769px+ | Full layout, All components | Standard responsive grid |

### Component-Specific Responsive Tests
1. **Authentication Forms**:
   - Mobile: Single column, larger touch targets
   - Tablet: Centered with adequate margins
   - Desktop: Standard two-column for name fields

2. **Dashboard Layout**:
   - Mobile: Single column stack
   - Tablet: Two-column responsive grid
   - Desktop: Multi-column with sidebar

3. **Navigation**:
   - Mobile: Collapsible/hamburger menu
   - Tablet: Horizontal with reduced spacing
   - Desktop: Full horizontal navigation

## 🔄 Test Execution Workflow

### Step 1: Pre-Test Validation
```bash
# Automatic validation (included in npm scripts)
npm run validate:services

# Manual validation if needed
./validate-services-before-e2e.sh
```

### Step 2: Execute Test Suite
```bash
# Standard execution with all optimizations
npm run test:e2e:headed

# Debug specific test with delays
npx playwright test --grep "registration" --headed --debug
```

### Step 3: Cross-Device Testing
```bash
# Test mobile responsiveness
npm run test:e2e:mobile

# Test tablet responsiveness  
npm run test:e2e:tablet
```

### Step 4: Results Analysis
- Review test execution videos
- Verify responsive behavior screenshots
- Analyze performance metrics
- Check authentication state transitions

## 📊 Success Criteria

### Functional Requirements
- ✅ All services validated before test execution
- ✅ No redundant login operations
- ✅ Authentication state properly managed
- ✅ 3-5 second delays between test cases
- ✅ Realistic user interaction simulation

### Performance Requirements
- ✅ Test suite completes within 30 minutes
- ✅ Individual tests timeout at 2 minutes maximum
- ✅ Smooth visual execution for observation
- ✅ Proper error handling and reporting

### Responsive Requirements
- ✅ Mobile layout (320px-480px) works correctly
- ✅ Tablet layout (481px-768px) optimized
- ✅ Desktop layout (769px+) full functionality
- ✅ Touch-friendly interactions on mobile
- ✅ Readable text and accessible buttons

## 🐛 Troubleshooting Guide

### Service Validation Failures
```bash
# If MongoDB not running
sudo docker-compose up -d mongodb

# If Backend not responding
./start-dev.sh

# If Frontend not accessible
cd Front-End/angular-18-todo-app && npm start
```

### Authentication Issues
- Clear browser local storage
- Restart all services
- Verify user test data exists
- Check authentication token expiration

### Responsive Design Issues
- Test on actual devices when possible
- Use browser dev tools device simulation
- Verify CSS media queries are correct
- Check viewport meta tag configuration

### Performance Issues
- Increase timeout values if needed
- Check network connectivity
- Monitor system resources during testing
- Reduce parallel execution if conflicts occur

## 📈 Metrics and Reporting

### Test Metrics to Track
- Total execution time
- Individual test case duration
- Authentication success rate
- Responsive layout compliance
- Error and retry rates

### Reporting Outputs
- HTML test report with screenshots
- Video recordings of test execution
- Performance timing data
- Responsive design compliance matrix
- Service health validation logs