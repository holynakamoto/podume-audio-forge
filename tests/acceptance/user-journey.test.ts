
// Acceptance tests for complete user journeys
import { test, expect } from '@playwright/test';

test.describe('User Acceptance Tests', () => {
  test('complete LinkedIn podcast creation journey', async ({ page }) => {
    // Step 1: Navigate to create page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/podcast/i);
    
    await page.click('text=Create');
    await expect(page).toHaveURL(/\/create/);
    
    // Step 2: Switch to LinkedIn tab
    await page.click('text=LinkedIn Profile');
    await expect(page.locator('text=Create Podcast from LinkedIn Profile')).toBeVisible();
    
    // Step 3: Fill in form details
    await page.fill('input[id="title"]', 'Nicholas Moore Professional Journey');
    await page.fill('input[id="linkedin_url"]', 'https://linkedin.com/in/nicholasmoore');
    
    // Step 4: Select package type
    await page.click('input[value="premium"]');
    await expect(page.locator('input[value="premium"]')).toBeChecked();
    
    // Step 5: Verify form is ready for submission
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toContainText(/Create LinkedIn Podcast/i);
  });

  test('user can navigate between different creation modes', async ({ page }) => {
    await page.goto('/create');
    
    // Should start on create podcast tab
    await expect(page.locator('text=Create Your Podcast')).toBeVisible();
    
    // Switch to LinkedIn tab
    await page.click('text=LinkedIn Profile');
    await expect(page.locator('text=Create Podcast from LinkedIn Profile')).toBeVisible();
    
    // Switch to PDF to Speech tab
    await page.click('text=PDF to Speech');
    await expect(page.locator('text=Upload PDF')).toBeVisible();
    
    // Back to create podcast
    await page.click('text=Create Podcast');
    await expect(page.locator('text=Create Your Podcast')).toBeVisible();
  });

  test('form validation provides clear feedback', async ({ page }) => {
    await page.goto('/create');
    await page.click('text=LinkedIn Profile');
    
    // Try to submit with invalid URL
    await page.fill('input[id="title"]', 'Test');
    await page.fill('input[id="linkedin_url"]', 'not-a-url');
    await page.click('button[type="submit"]');
    
    // Should show validation message
    await expect(page.locator('text=Please enter a valid')).toBeVisible();
    
    // Fix the URL
    await page.fill('input[id="linkedin_url"]', 'https://linkedin.com/in/test');
    
    // Validation error should disappear
    await expect(page.locator('text=Please enter a valid')).not.toBeVisible();
  });
});
