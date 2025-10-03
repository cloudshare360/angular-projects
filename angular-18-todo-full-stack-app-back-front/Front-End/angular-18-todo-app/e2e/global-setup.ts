import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('🚀 Starting global setup for Playwright tests...');

    // Start browser for authentication setup if needed
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Wait for services to be ready
    try {
        console.log('⏳ Waiting for frontend to be ready...');
        await page.goto('http://localhost:4200', { waitUntil: 'networkidle', timeout: 60000 });
        console.log('✅ Frontend is ready');

        console.log('⏳ Checking backend API...');
        const response = await page.request.get('http://localhost:3000/api/health');
        if (response.ok()) {
            console.log('✅ Backend API is ready');
        } else {
            throw new Error('Backend API not responding');
        }

        // Create a test user for authenticated tests
        console.log('⏳ Setting up test user...');
        const timestamp = Date.now();
        const testUser = {
            username: `e2etest${timestamp}`,
            email: `e2etest${timestamp}@example.com`,
            password: 'testpass123',
            confirmPassword: 'testpass123',
            firstName: 'E2E',
            lastName: 'Test'
        };

        const registerResponse = await page.request.post('http://localhost:3000/api/auth/register', {
            data: testUser
        });

        if (registerResponse.ok()) {
            const userData = await registerResponse.json();
            console.log('✅ Test user created successfully');

            // Store user credentials for tests
            process.env['E2E_TEST_EMAIL'] = testUser.email;
            process.env['E2E_TEST_PASSWORD'] = testUser.password;
            process.env['E2E_TEST_USERNAME'] = testUser.username;
        } else {
            console.log('⚠️ Test user creation failed, will use existing user');
            // Fallback to default test credentials
            process.env['E2E_TEST_EMAIL'] = 'admin@example.com';
            process.env['E2E_TEST_PASSWORD'] = 'admin123';
            process.env['E2E_TEST_USERNAME'] = 'admin';
        }

    } catch (error) {
        console.error('❌ Global setup failed:', error);
        throw error;
    } finally {
        await browser.close();
    }

    console.log('✅ Global setup completed successfully');
}

export default globalSetup;