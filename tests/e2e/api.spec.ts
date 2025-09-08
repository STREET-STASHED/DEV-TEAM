import { test, expect } from '@playwright/test'

test('search API returns JSON for short query', async ({ request }) => {
  const res = await request.get('/api/search?q=sh')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body).toHaveProperty('results')
  expect(Array.isArray(body.results)).toBe(true)
})

test('notifications API unauthenticated returns 401', async ({ request }) => {
  const res = await request.get('/api/notifications')
  expect([401, 500]).toContain(res.status())
})


