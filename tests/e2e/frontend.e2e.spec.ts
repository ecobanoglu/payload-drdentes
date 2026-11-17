import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('kök adres varsayılan dile (tr) yönlenir', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveURL(/\/tr$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
  })

  test('Arapça sayfa sağdan sola (rtl) render edilir', async ({ page }) => {
    await page.goto('http://localhost:3000/ar/posts')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })
})
