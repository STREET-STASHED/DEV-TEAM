import { test, expect } from '@playwright/test'

test('stylist dashboard route responds without server error', async ({ page }) => {
  const res = await page.goto('/stylist/dashboard')
  expect(res).toBeTruthy()
  expect((res as any).status()).toBeLessThan(500)
})


