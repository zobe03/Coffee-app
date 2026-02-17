import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: 'http://localhost:8081',
        headless: true,
        screenshot: 'only-on-failure',
    },
    webServer: undefined, // Der Expo Dev-Server muss manuell gestartet werden
});
