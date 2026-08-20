import { expect, test, type Page, type TestInfo } from '@playwright/test';

const defaultBaseUrl = 'http://127.0.0.1:4173/static-preview-notes';
const baseUrl = (process.env.AUDIT_BASE_URL || defaultBaseUrl).replace(/\/$/, '');

const routes = [
  { path: '/', label: 'Índice' },
  { path: '/pagina_hub_campeonato.html', label: 'Hub' },
  { path: '/pagina_rodada.html', label: 'Rodada 24' },
  { path: '/pagina_blog.html', label: 'Blog' },
  { path: '/sequencia_emails.html', label: 'E-mails da rodada' },
  { path: '/sequencia_emails_waitlist.html', label: 'Waitlist → Cadastro' },
  { path: '/pagina_lps_waitlist.html', label: 'LPs Waitlist' },
] as const;

type BrowserIssue = {
  message: string;
  type: 'console' | 'page' | 'request' | 'response';
};

const routeUrl = (routePath: string) => `${baseUrl}${routePath}`;

const collectBrowserIssues = (page: Page) => {
  const issues: BrowserIssue[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.push({ message: message.text(), type: 'console' });
    }
  });
  page.on('pageerror', (error) => {
    issues.push({ message: error.message, type: 'page' });
  });
  page.on('requestfailed', (request) => {
    issues.push({
      message: `${request.method()} ${request.url()}: ${request.failure()?.errorText}`,
      type: 'request',
    });
  });
  page.on('response', (response) => {
    if (response.status() === 404) {
      issues.push({ message: response.url(), type: 'response' });
    }
  });

  return issues;
};

const findClippedElements = async (page: Page) =>
  page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const isScrollable = (element: Element) => {
      const style = window.getComputedStyle(element);
      return (
        ['auto', 'scroll'].includes(style.overflowX) &&
        element.scrollWidth > element.clientWidth
      );
    };
    const hasScrollableAncestor = (element: Element) => {
      let ancestor = element.parentElement;

      while (ancestor && ancestor !== document.body) {
        if (isScrollable(ancestor)) {
          return true;
        }

        ancestor = ancestor.parentElement;
      }

      return false;
    };

    return [...document.querySelectorAll('body *')]
      .filter((element) => {
        if (
          element.closest('[data-site-navigation]') ||
          element.getClientRects().length === 0 ||
          hasScrollableAncestor(element)
        ) {
          return false;
        }

        const rectangle = element.getBoundingClientRect();
        return rectangle.left < -1 || rectangle.right > viewportWidth + 1;
      })
      .slice(0, 20)
      .map((element) => {
        const rectangle = element.getBoundingClientRect();
        return {
          className: String(element.className).slice(0, 80),
          left: Math.round(rectangle.left),
          right: Math.round(rectangle.right),
          tagName: element.tagName,
        };
      });
  });

const expectPageContract = async (page: Page, route: (typeof routes)[number]) => {
  const issues = collectBrowserIssues(page);
  const response = await page.goto(routeUrl(route.path), {
    waitUntil: 'networkidle',
  });

  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-page-header]')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow, noarchive',
  );
  await expect(
    page.locator('[data-site-navigation] a[aria-current="page"]'),
  ).toHaveAttribute(
    'href',
    new URL(route.path.replace(/^\//, ''), `${defaultBaseUrl}/`).pathname,
  );
  expect(issues).toEqual([]);
};

test.describe('published route contracts', () => {
  for (const route of routes) {
    test(`${route.label} loads without browser or asset errors`, async ({ page }) => {
      await expectPageContract(page, route);
    });

    test(`${route.label} has no document overflow or clipped content`, async ({
      page,
    }) => {
      await page.goto(routeUrl(route.path), { waitUntil: 'networkidle' });

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      const clippedElements = await findClippedElements(page);

      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
      expect(clippedElements).toEqual([]);
    });
  }
});

test('all internal links resolve without 404 responses', async ({ page, request }) => {
  const internalUrls = new Set<string>();

  for (const route of routes) {
    await page.goto(routeUrl(route.path), { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('a[href]').evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => Boolean(href)),
    );

    for (const href of hrefs) {
      const url = new URL(href, page.url());

      if (url.origin === new URL(baseUrl).origin && url.pathname.startsWith('/static-preview-notes')) {
        url.hash = '';
        internalUrls.add(url.toString());
      }
    }
  }

  for (const url of internalUrls) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
  }
});

test('robots.txt blocks indexing for the complete preview site', async ({ request }) => {
  const response = await request.get(
    new URL('/static-preview-notes/robots.txt', baseUrl).toString(),
  );

  expect(response.status()).toBe(200);
  expect(await response.text()).toMatch(/User-agent:\s*\*\s+Disallow:\s*\//);
});

test('shared navigation remains sticky and preserves the active page', async ({
  page,
}) => {
  await page.goto(routeUrl('/pagina_blog.html'), { waitUntil: 'networkidle' });
  const activeLink = page.locator('[data-site-navigation] a[aria-current="page"]');

  await expect(activeLink).toHaveText('Blog');
  await page.evaluate(() => window.scrollTo(0, 1_200));

  const headerTop = await page.locator('body > .site-shell > header').evaluate((header) =>
    Math.round(header.getBoundingClientRect().top),
  );
  expect(headerTop).toBe(0);
});

test('mobile navigation keeps the active page inside the visible strip', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');

  await page.goto(routeUrl('/pagina_lps_waitlist.html'), {
    waitUntil: 'domcontentloaded',
  });

  const navigation = page.locator('[data-site-navigation]');
  const initialPositions = await navigation.evaluate((element) => {
    const activeLink = element.querySelector('a[aria-current="page"]');
    const navigationRectangle = element.getBoundingClientRect();
    const activeLinkRectangle = activeLink?.getBoundingClientRect();

    return {
      activeLeft: activeLinkRectangle?.left,
      activeRight: activeLinkRectangle?.right,
      navigationLeft: navigationRectangle.left,
      navigationRight: navigationRectangle.right,
      scrollLeft: element.scrollLeft,
    };
  });

  expect(initialPositions.scrollLeft).toBe(0);
  expect(initialPositions.activeLeft).toBeGreaterThanOrEqual(
    initialPositions.navigationLeft,
  );
  expect(initialPositions.activeRight).toBeLessThanOrEqual(
    initialPositions.navigationRight,
  );
});

for (const routePath of ['/', '/sequencia_emails.html'] as const) {
  test(`${routePath} keeps wide tables in local scroll containers`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile');

    await page.goto(routeUrl(routePath), {
      waitUntil: 'networkidle',
    });

    const scrollableTables = await page
      .locator('.astro-document table')
      .evaluateAll(
        (tables) =>
          tables.filter((table) => {
            let element: Element | null = table;

            while (element?.closest('.astro-document')) {
              const style = getComputedStyle(element);

              if (
                ['auto', 'scroll'].includes(style.overflowX) &&
                element.scrollWidth > element.clientWidth
              ) {
                return true;
              }

              element = element.parentElement;
            }

            return false;
          }).length,
      );

    expect(scrollableTables).toBeGreaterThan(0);
  });
}

test('skip link becomes visible when it receives keyboard focus', async ({ page }) => {
  await page.goto(routeUrl('/pagina_rodada.html'), {
    waitUntil: 'domcontentloaded',
  });
  const skipLink = page.locator('.skip-link');

  await skipLink.focus();
  const rectangle = await skipLink.boundingBox();

  expect(rectangle).not.toBeNull();
  expect(rectangle?.y).toBeGreaterThanOrEqual(0);
});

for (const scenarioControl of [
  {
    path: '/',
    paneSelector: '#p-hb-b',
    radioSelector: '#hb-b',
  },
  {
    path: '/pagina_hub_campeonato.html',
    paneSelector: '#p-b',
    radioSelector: '#sc-b',
  },
  {
    path: '/pagina_rodada.html',
    paneSelector: '#p-b',
    radioSelector: '#sc-b',
  },
  {
    path: '/pagina_blog.html',
    paneSelector: '#p2',
    radioSelector: '#t2',
  },
  {
    path: '/sequencia_emails.html',
    paneSelector: '#p-b',
    radioSelector: '#tr-b',
  },
] as const) {
  test(`${scenarioControl.path} scenario controls show focus and switch panes`, async ({
    page,
  }) => {
    await page.goto(routeUrl(scenarioControl.path), {
      waitUntil: 'domcontentloaded',
    });
    const radio = page.locator(scenarioControl.radioSelector);
    const radioId = await radio.getAttribute('id');

    expect(radioId).toBeTruthy();

    const label = page.locator(`label[for="${radioId}"]`);
    await expect(label).toBeVisible();
    await radio.focus();
    await expect(radio).toBeFocused();
    await expect(label).toHaveCSS('outline-style', 'solid');

    await label.click();
    await expect(radio).toBeChecked();
    await expect(page.locator(scenarioControl.paneSelector)).toBeVisible();
  });
}

test('round conversion action remains visible while scrolling on mobile', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');

  await page.goto(routeUrl('/pagina_rodada.html'), {
    waitUntil: 'domcontentloaded',
  });

  for (const scenario of [
    { action: 'registration', control: '#sc-a' },
    { action: 'qfd', control: '#sc-b' },
    { action: 'market', control: '#sc-c' },
  ]) {
    await page.locator(`label[for="${scenario.control.slice(1)}"]`).click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.7));

    const action = page.locator(
      `[data-round-mobile-action="${scenario.action}"]`,
    );
    await expect(action).toBeVisible();

    const actionBox = await action.boundingBox();
    const viewport = page.viewportSize();

    expect(actionBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(actionBox?.y).toBeGreaterThanOrEqual(0);
    expect((actionBox?.y || 0) + (actionBox?.height || 0)).toBeLessThanOrEqual(
      viewport?.height || 0,
    );
  }
});

test('legacy state legends do not overlap the shared sticky navigation', async ({
  page,
}) => {
  await page.goto(routeUrl('/pagina_blog.html'), {
    waitUntil: 'domcontentloaded',
  });

  const legacyLegend = page.locator('.astro-document .lgd').first();
  await expect(legacyLegend).toBeVisible();
  expect(await legacyLegend.evaluate((element) => getComputedStyle(element).position)).toBe(
    'static',
  );
});

test('scenario anchor navigation reaches its target', async ({ page }) => {
  await page.goto(routeUrl('/pagina_hub_campeonato.html'), {
    waitUntil: 'domcontentloaded',
  });
  const targetLink = page.locator('[data-scenario-tabs] a').nth(1);
  const targetHash = await targetLink.getAttribute('href');

  await targetLink.click();

  expect(targetHash).toBeTruthy();
  expect(new URL(page.url()).hash).toBe(targetHash);
  await expect(page.locator(targetHash || '#missing')).toBeAttached();
});
