import { test, expect } from '@playwright/test'

test('stashers (driver) dashboard route responds without server error', async ({ page }) => {
  const res = await page.goto('/driver/driver-dashboard')
  expect(res).toBeTruthy()
  expect((res as any).status()).toBeLessThan(500)
})


