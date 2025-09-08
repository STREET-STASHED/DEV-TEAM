import { test, expect } from '@playwright/test'

test('checkout empty cart message', async ({ page }) => {
  await page.goto('/buyer/checkout')
  await expect(page.getByRole('heading', { name: /Your Cart is Empty/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Continue Shopping/i })).toBeVisible()
})


