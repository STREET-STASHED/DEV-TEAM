import { test, expect } from '@playwright/test'

test('home page renders and navigates to marketplace', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/StreetStashed/i)

  // Hero and primary CTA exists
  await expect(page.getByRole('button', { name: /Shop Now/i })).toBeVisible()

  // Navigate to marketplace
  await page.getByRole('button', { name: /Shop Now/i }).click()
  await expect(page).toHaveURL(/\/buyer\/marketplace/)
})


