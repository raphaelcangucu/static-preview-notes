import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';

const basePath = '/static-preview-notes';
const distDirectory = resolve('dist');
const sourceDirectory = resolve('src');

const routes = [
  {
    path: 'index.html',
    sourcePath: 'src/pages/index.astro',
    publicPath: `${basePath}/`,
    title: 'Macro Markets Futebol — Especificação Visual de Conteúdos e Telas',
  },
  {
    path: 'pagina_hub_campeonato.html',
    sourcePath: 'src/pages/pagina_hub_campeonato.astro',
    publicPath: `${basePath}/pagina_hub_campeonato.html`,
    title: 'Hub do Campeonato — Brasileirão Série A 2026 · /br/brasileirao',
  },
  {
    path: 'pagina_rodada.html',
    sourcePath: 'src/pages/pagina_rodada.astro',
    publicPath: `${basePath}/pagina_rodada.html`,
    title: 'Macro Markets — Página da Rodada 24 · três cenários de acesso',
  },
  {
    path: 'pagina_blog.html',
    sourcePath: 'src/pages/pagina_blog.astro',
    publicPath: `${basePath}/pagina_blog.html`,
    title: 'Macro Markets · Blog / seção de conteúdo — 3 cenários',
  },
  {
    path: 'sequencia_emails.html',
    sourcePath: 'src/pages/sequencia_emails.astro',
    publicPath: `${basePath}/sequencia_emails.html`,
    title: 'Macro Markets — Sequência de e-mails da rodada 24 · três trilhas',
  },
  {
    path: 'sequencia_emails_waitlist.html',
    sourcePath: 'src/pages/sequencia_emails_waitlist.astro',
    publicPath: `${basePath}/sequencia_emails_waitlist.html`,
    title: 'Macro Markets — Campanha Waitlist → Cadastro · Bloco 11',
  },
  {
    path: 'pagina_lps_waitlist.html',
    sourcePath: 'src/pages/pagina_lps_waitlist.astro',
    publicPath: `${basePath}/pagina_lps_waitlist.html`,
    title: 'Macro Markets — LPs da campanha Waitlist → Cadastro',
  },
] as const;

const loadRoute = (routePath: string) => {
  const outputPath = resolve(distDirectory, routePath);

  expect(existsSync(outputPath), `Missing generated route: ${routePath}`).toBe(true);

  return cheerio.load(readFileSync(outputPath, 'utf8'));
};

const readSourceTree = (directory: string): string => {
  return readdirSync(directory)
    .map((entry) => resolve(directory, entry))
    .map((entryPath) =>
      statSync(entryPath).isDirectory()
        ? readSourceTree(entryPath)
        : readFileSync(entryPath, 'utf8'),
    )
    .join('\n');
};

describe('Astro source architecture', () => {
  it.each(routes)('implements $publicPath as a dedicated Astro page', (route) => {
    expect(existsSync(resolve(route.sourcePath)), `Missing ${route.sourcePath}`).toBe(
      true,
    );
  });

  it('does not render or import legacy HTML documents', () => {
    const source = readSourceTree(sourceDirectory);

    expect(source).not.toMatch(/LegacyDocument/);
    expect(source).not.toMatch(/set:html/);
    expect(source).not.toMatch(/<iframe\b/i);
    expect(source).not.toMatch(/\?raw/);
    expect(source).not.toMatch(/from\s+['"][^'"]+\.html/);
  });

  it('builds dist before running output contract tests', () => {
    const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    const checkScript = packageJson.scripts.check as string;

    expect(checkScript.indexOf('astro build')).toBeLessThan(
      checkScript.indexOf('vitest run'),
    );
  });
});

describe('generated route matrix', () => {
  it.each(routes)('generates $publicPath with preserved metadata', (route) => {
    const $ = loadRoute(route.path);

    expect($('title').text()).toBe(route.title);
    expect($('meta[name="robots"]').attr('content')).toBe(
      'noindex, nofollow, noarchive',
    );
    expect($('html').attr('lang')).toBe('pt-BR');
  });

  it.each(routes)('renders one shared navigation with the active item', (route) => {
    const $ = loadRoute(route.path);
    const navigationLinks = $('[data-site-navigation] a');

    expect(navigationLinks).toHaveLength(routes.length);
    expect(
      navigationLinks.filter(`[href="${route.publicPath}"]`).attr('aria-current'),
    ).toBe('page');
  });

  it('keeps every generated internal document link valid', () => {
    for (const route of routes) {
      const $ = loadRoute(route.path);

      $('a[href]').each((_, link) => {
        const href = $(link).attr('href');

        expect(href).toBeDefined();

        if (!href || href === '#' || /^(https?:|mailto:|tel:)/.test(href)) {
          return;
        }

        const [pathname, fragment] = href.split('#');
        const targetRoute =
          pathname === ''
            ? route
            : routes.find((candidate) => candidate.publicPath === pathname);

        expect(targetRoute, `Broken internal link: ${route.publicPath} → ${href}`).toBeDefined();

        if (targetRoute && fragment) {
          const targetPage = loadRoute(targetRoute.path);
          expect(
            targetPage(`#${fragment}`),
            `Missing anchor: ${route.publicPath} → ${href}`,
          ).toHaveLength(1);
        }
      });
    }
  });
});

describe('shared design system', () => {
  it('renders the accessible shared shell and component boundaries', () => {
    for (const route of routes) {
      const $ = loadRoute(route.path);

      expect($('[data-site-shell]')).toHaveLength(1);
      expect($('a[href="#main-content"].skip-link')).toHaveLength(1);
      expect($('[data-page-header]')).toHaveLength(1);
      expect($('[data-state-legend]')).toHaveLength(1);
    }

    for (const routePath of [
      'pagina_hub_campeonato.html',
      'pagina_rodada.html',
      'pagina_blog.html',
    ]) {
      const $ = loadRoute(routePath);

      expect($('[data-scenario-tabs]')).toHaveLength(1);
      expect($('[data-premium-gate]')).toHaveLength(1);
    }
  });

  it('publishes the four semantic states and premium canvas tokens', () => {
    const $ = loadRoute('index.html');
    const html = $.html();
    const assetDirectory = resolve(distDirectory, '_astro');
    const generatedCss = readdirSync(assetDirectory)
      .filter((filename) => filename.endsWith('.css'))
      .map((filename) => readFileSync(resolve(assetDirectory, filename), 'utf8'))
      .join('\n');

    expect(generatedCss).toContain('--state-active');
    expect(generatedCss).toContain('--state-partial');
    expect(generatedCss).toContain('--state-locked');
    expect(generatedCss).toContain('--state-absent');
    expect(generatedCss).toContain('--canvas-premium');
    expect(generatedCss).toContain('--surface-raised:#212632');
    expect(generatedCss).toContain('--color-primary:#22c55e');
    expect(generatedCss).toContain('--color-secondary:#368bc9');
    expect(generatedCss).toContain('--radius-panel:20px');
    expect(generatedCss).toContain('prefers-reduced-motion:reduce');
    expect(html).toContain('data-state="active"');
    expect(html).toContain('data-state="partial"');
    expect(html).toContain('data-state="locked"');
    expect(html).toContain('data-state="absent"');
  });

  it('keeps access state borders semantically distinct', () => {
    const assetDirectory = resolve(distDirectory, '_astro');
    const generatedCss = readdirSync(assetDirectory)
      .filter((filename) => filename.endsWith('.css'))
      .map((filename) => readFileSync(resolve(assetDirectory, filename), 'utf8'))
      .join('\n');

    expect(generatedCss).toMatch(
      /\.access-state\[data-state=active\][^{]*\{[^}]*border-style:solid/,
    );
    expect(generatedCss).toMatch(
      /\.access-state\[data-state=partial\][^{]*\{[^}]*border-style:dashed/,
    );
    expect(generatedCss).toMatch(
      /\.access-state\[data-state=locked\][^{]*\{[^}]*border-style:dotted/,
    );
    expect(generatedCss).toMatch(
      /\.access-state\[data-state=absent\][^{]*\{[^}]*opacity:/,
    );
  });

  it('preserves the complete planning document at the root', () => {
    const $ = loadRoute('index.html');
    const text = $('main').text();

    expect(text).toContain('Macro Markets Futebol — Especificação Visual');
    expect(text).toContain('Bloco 14 — Catálogo de conteúdo');
    expect(text.length).toBeGreaterThan(20_000);
  });
});
