
// Performance tests using Lighthouse metrics
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('homepage should meet performance benchmarks', async ({ page }) => {
    await page.goto('/');
    
    // Basic performance checks
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    const entries = JSON.parse(performanceEntries);
    const navigationEntry = entries[0];
    
    // Check that page loads within reasonable time (3 seconds)
    expect(navigationEntry.loadEventEnd - navigationEntry.fetchStart).toBeLessThan(3000);
  });

  test('create page should load efficiently', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should not have console errors on main pages', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.goto('/create');
    
    // Filter out expected errors (like network errors in test environment)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('net::ERR_INTERNET_DISCONNECTED') &&
      !error.includes('Failed to fetch')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
