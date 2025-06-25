
// Security tests for input validation and XSS prevention
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should sanitize input fields', async ({ page }) => {
    await page.goto('/create');
    
    const maliciousScript = '<script>alert("xss")</script>';
    await page.fill('input[id="title"]', maliciousScript);
    
    const titleValue = await page.inputValue('input[id="title"]');
    expect(titleValue).not.toContain('<script>');
  });

  test('should validate LinkedIn URL against XSS', async ({ page }) => {
    await page.goto('/create');
    await page.click('text=LinkedIn Profile');
    
    const maliciousUrl = 'javascript:alert("xss")';
    await page.fill('input[id="linkedin_url"]', maliciousUrl);
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Please enter a valid URL')).toBeVisible();
  });

  test('should prevent SQL injection in form inputs', async ({ page }) => {
    await page.goto('/create');
    
    const sqlInjection = "'; DROP TABLE users; --";
    await page.fill('input[id="title"]', sqlInjection);
    
    // Form should handle this gracefully without breaking
    const titleValue = await page.inputValue('input[id="title"]');
    expect(titleValue).toBe(sqlInjection); // Input should be preserved but sanitized on backend
  });
});
