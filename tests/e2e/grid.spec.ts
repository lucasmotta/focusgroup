import { test, expect } from '@playwright/test';

test.describe('Grid focusgroup - basic navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/grid.html');
  });

  test('ArrowRight moves to next cell in row', async ({ page }) => {
    await page.click('#c00');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#c01')).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#c02')).toBeFocused();
  });

  test('ArrowLeft moves to previous cell in row', async ({ page }) => {
    await page.click('#c02');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#c01')).toBeFocused();
  });

  test('ArrowDown moves to same column in next row', async ({ page }) => {
    await page.click('#c01');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#c11')).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#c21')).toBeFocused();
  });

  test('ArrowUp moves to same column in previous row', async ({ page }) => {
    await page.click('#c21');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#c11')).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#c01')).toBeFocused();
  });

  test('ArrowRight at end of row stops (no wrap)', async ({ page }) => {
    await page.click('#c02');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#c02')).toBeFocused();
  });

  test('ArrowLeft at start of row stops (no wrap)', async ({ page }) => {
    await page.click('#c00');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#c00')).toBeFocused();
  });

  test('ArrowDown at last row stops (no wrap)', async ({ page }) => {
    await page.click('#c21');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#c21')).toBeFocused();
  });

  test('ArrowUp at first row stops (no wrap)', async ({ page }) => {
    await page.click('#c01');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#c01')).toBeFocused();
  });

  test('Home moves to first cell in row', async ({ page }) => {
    await page.click('#c12');
    await page.keyboard.press('Home');
    await expect(page.locator('#c10')).toBeFocused();
  });

  test('End moves to last cell in row', async ({ page }) => {
    await page.click('#c10');
    await page.keyboard.press('End');
    await expect(page.locator('#c12')).toBeFocused();
  });

  test('roving tabindex: only one cell has tabindex=0', async ({ page }) => {
    await expect(page.locator('#c00')).toHaveAttribute('tabindex', '0');
    await expect(page.locator('#c11')).toHaveAttribute('tabindex', '-1');

    await page.click('#c11');
    await expect(page.locator('#c00')).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#c11')).toHaveAttribute('tabindex', '0');
  });
});

test.describe('Grid focusgroup - wrap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/grid.html');
  });

  test('ArrowRight wraps within row', async ({ page }) => {
    await page.click('#w02');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#w00')).toBeFocused();
  });

  test('ArrowLeft wraps within row', async ({ page }) => {
    await page.click('#w00');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#w02')).toBeFocused();
  });

  test('ArrowDown wraps within column', async ({ page }) => {
    await page.click('#w21');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#w01')).toBeFocused();
  });

  test('ArrowUp wraps within column', async ({ page }) => {
    await page.click('#w01');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#w21')).toBeFocused();
  });
});

test.describe('Grid focusgroup - flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/grid.html');
  });

  test('ArrowRight at end of row flows to start of next row', async ({ page }) => {
    await page.click('#f02');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#f10')).toBeFocused();
  });

  test('ArrowLeft at start of row flows to end of previous row', async ({ page }) => {
    await page.click('#f10');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#f02')).toBeFocused();
  });

  test('ArrowRight at last cell of last row flows to first cell of first row', async ({ page }) => {
    await page.click('#f22');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#f00')).toBeFocused();
  });
});
