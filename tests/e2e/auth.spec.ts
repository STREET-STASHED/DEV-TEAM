import { test, expect } from '@playwright/test'

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
})

test('signup page renders', async ({ page }) => {
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: /Join StreetStashed/i })).toBeVisible()
})


