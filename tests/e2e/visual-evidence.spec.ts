import { mkdir } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

import { test } from '@playwright/test';

const outputDirectory = process.env.VISUAL_AUDIT_DIR;
const defaultBaseUrl = 'http://127.0.0.1:4173/static-preview-notes';
const baseUrl = (process.env.AUDIT_BASE_URL || defaultBaseUrl).replace(/\/$/, '');

const routes = [
  { path: '/', slug: 'index' },
  { path: '/pagina_hub_campeonato.html', slug: 'pagina_hub_campeonato' },
  { path: '/pagina_rodada.html', slug: 'pagina_rodada' },
  { path: '/pagina_blog.html', slug: 'pagina_blog' },
  { path: '/sequencia_emails.html', slug: 'sequencia_emails' },
  {
    path: '/sequencia_emails_waitlist.html',
    slug: 'sequencia_emails_waitlist',
  },
  { path: '/pagina_lps_waitlist.html', slug: 'pagina_lps_waitlist' },
] as const;

test.skip(!outputDirectory, 'VISUAL_AUDIT_DIR is required for evidence capture.');

for (const route of routes) {
  test(`captures ${route.slug}`, async ({ page }, testInfo) => {
    if (!outputDirectory) {
      throw new Error('VISUAL_AUDIT_DIR is required.');
    }

    const absoluteOutputDirectory = isAbsolute(outputDirectory)
      ? outputDirectory
      : resolve(outputDirectory);
    const viewport = testInfo.project.name;

    await mkdir(absoluteOutputDirectory, { recursive: true });
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.screenshot({
      animations: 'disabled',
      path: resolve(
        absoluteOutputDirectory,
        `${route.slug}-${viewport}-top.png`,
      ),
    });
    await page.screenshot({
      animations: 'disabled',
      fullPage: true,
      path: resolve(
        absoluteOutputDirectory,
        `${route.slug}-${viewport}-full.png`,
      ),
    });
  });
}

test('captures scenario keyboard focus', async ({ page }, testInfo) => {
  if (!outputDirectory) {
    throw new Error('VISUAL_AUDIT_DIR is required.');
  }

  const absoluteOutputDirectory = isAbsolute(outputDirectory)
    ? outputDirectory
    : resolve(outputDirectory);
  const viewport = testInfo.project.name;

  await mkdir(absoluteOutputDirectory, { recursive: true });
  await page.goto(`${baseUrl}/pagina_rodada.html`, {
    waitUntil: 'networkidle',
  });

  const radio = page.locator('#sc-b');
  const label = page.locator('label[for="sc-b"]');
  await label.scrollIntoViewIfNeeded();
  await radio.focus();
  await page.screenshot({
    animations: 'disabled',
    path: resolve(
      absoluteOutputDirectory,
      `pagina_rodada-${viewport}-focus.png`,
    ),
  });
});
