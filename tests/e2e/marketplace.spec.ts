import { test, expect } from '@playwright/test'

test('marketplace loads and displays loading state', async ({ page }) => {
  await page.goto('/buyer/marketplace')
  await expect(page.getByText(/Loading marketplace/i)).toBeVisible()
})


