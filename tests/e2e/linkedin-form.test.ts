
// E2E tests for LinkedIn form functionality
import { test, expect } from '@playwright/test';

test.describe('LinkedIn Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Create');
    await page.click('text=LinkedIn Profile');
  });

  test('should validate LinkedIn URL format', async ({ page }) => {
    await page.fill('input[id="title"]', 'Test Podcast');
    await page.fill('input[id="linkedin_url"]', 'invalid-url');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Please enter a valid LinkedIn profile URL')).toBeVisible();
  });

  test('should accept valid LinkedIn URL', async ({ page }) => {
    await page.fill('input[id="title"]', 'Test Podcast');
    await page.fill('input[id="linkedin_url"]', 'https://linkedin.com/in/nicholasmoore');
    
    // Should not show validation error
    await expect(page.locator('text=Please enter a valid LinkedIn profile URL')).not.toBeVisible();
  });

  test('should submit form with valid data', async ({ page }) => {
    await page.fill('input[id="title"]', 'Nicholas Moore Professional Journey');
    await page.fill('input[id="linkedin_url"]', 'https://linkedin.com/in/nicholasmoore');
    
    // Mock the API call to prevent actual submission
    await page.route('**/functions/v1/generate-podcast', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ podcast: { id: 'test-id' } })
      });
    });
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Extracting Profile...')).toBeVisible();
  });
});
