import { test, expect } from '@playwright/test'

test('seller dashboard route responds without server error', async ({ page }) => {
  const res = await page.goto('/seller/seller-dashboard')
  expect(res).toBeTruthy()
  expect((res as any).status()).toBeLessThan(500)
})


