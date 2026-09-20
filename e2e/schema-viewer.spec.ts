import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const fixtureUrl = '/e2e-fixtures/schema.json';

async function openFixture(page: Page) {
  await page.goto(`/view/%23?url=${encodeURIComponent(fixtureUrl)}`);
  await expect(page.getByRole('heading', { name: 'Smoke Schema', exact: true })).toBeVisible();
}

test('loads a local schema, follows a reference, and renders an example', async ({ page }) => {
  await openFixture(page);

  await expect(page.getByText('A local smoke schema with Markdown.')).toBeVisible();
  await expect(page.locator('script').filter({ hasText: 'window.__smokeXss' })).toHaveCount(0);
  expect(await page.evaluate(() => Boolean((window as Window & { __smokeXss?: boolean }).__smokeXss))).toBe(false);

  await page.getByRole('link', { name: 'Address', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Address', exact: true })).toBeVisible();
  await expect(page.getByText('City name.')).toBeVisible();

  await page.getByRole('tab', { name: 'Example (JSON)' }).click();
  await expect(page.locator('code.language-json')).toContainText('"city"');

  await page.goto('/docs/introduction');
  await expect(page.getByRole('heading', { name: 'Introduction', exact: true })).toBeVisible();
});

test('renders the schema journey on a compact viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFixture(page);

  await expect(page.getByText('A local smoke schema with Markdown.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Smoke Schema', exact: true })).toBeVisible();
});
