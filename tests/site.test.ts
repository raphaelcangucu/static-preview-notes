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
    title: 'Macro Markets — Análises exclusivas com conta grátis',
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

  it('does not keep the legacy email sequence document at the root', () => {
    expect(existsSync(resolve('sequencia_emails.html'))).toBe(false);
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

  it('publishes the revised lead emails and their subject experiments', () => {
    const $ = loadRoute('sequencia_emails.html');
    const text = $('main').text();

    expect(text).toContain(
      'A rodada 24 começa amanhã — e só termina sábado',
    );
    expect(text).toContain('A tabela vai mentir até sábado');
    expect(text).toContain(
      'Cruzeiro × Flamengo, 21h: o que está em jogo',
    );
    expect(text).toContain(
      'O Mineirão responde o que a quarta deixou em aberto',
    );
    expect(text).toContain('Divisão aleatória 50/50');
    expect(text).not.toContain(
      'Rodada 24 em duas ondas — o mapa cabe num olhar',
    );
  });

  it('presents one institutional LP in navigation and source document', () => {
    const lp = loadRoute('pagina_lps_waitlist.html');
    const index = loadRoute('index.html');

    expect(
      lp(
        '[data-site-navigation] a[href="/static-preview-notes/pagina_lps_waitlist.html"]',
      )
        .text()
        .trim(),
    ).toBe('LP institucional');
    expect(index('main').text()).toContain('uma LP institucional');
    expect(index('main').text()).not.toContain('quatro LPs');
    expect(lp('main').text()).not.toContain('Quatro landings');
  });

  it.each([
    ['pagina_hub_campeonato.html', 'hub-overview'],
    ['pagina_hub_campeonato.html', 'hub-registration-teaser'],
    ['pagina_rodada.html', 'round-overview'],
    ['pagina_rodada.html', 'round-registration-teaser'],
    ['pagina_blog.html', 'article-methodology'],
    ['pagina_blog.html', 'blog-registration-teaser'],
  ])('publishes %s#%s exactly once', (routePath, anchor) => {
    const $ = loadRoute(routePath);
    expect($(`#${anchor}`)).toHaveLength(1);
  });

  it.each(routes)('renders one shared navigation with the active item', (route) => {
    const $ = loadRoute(route.path);
    const navigationLinks = $('[data-site-navigation] a');

    expect(navigationLinks).toHaveLength(routes.length);
    expect(
      navigationLinks.filter(`[href="${route.publicPath}"]`).attr('aria-current'),
    ).toBe('page');
  });

  it('resolves static campaign links independently of query parameters', () => {
    const href =
      '/static-preview-notes/pagina_rodada.html?utm_campaign=waitlist_value_nurture&utm_content=e1_deepening#round-overview';
    const parsed = new URL(href, 'https://preview.local');

    expect(parsed.pathname).toBe(
      '/static-preview-notes/pagina_rodada.html',
    );
    expect(parsed.hash).toBe('#round-overview');
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

        const parsed = new URL(
          href,
          `https://preview.local${route.publicPath}`,
        );
        const pathname = parsed.pathname;
        const fragment = parsed.hash.replace(/^#/, '');
        const targetRoute =
          pathname === `${basePath}/` || pathname === ''
            ? routes[0]
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

describe('round page conversion narrative', () => {
  it('surfaces a decision summary before asking for registration', () => {
    const $ = loadRoute('pagina_rodada.html');
    const anonymousPane = $('#p-a');
    const paneHtml = anonymousPane.html() || '';
    const registrationCtas = anonymousPane.find(
      '[data-round-cta="registration"]',
    );

    expect(anonymousPane.find('[data-round-summary="anonymous"]')).toHaveLength(1);
    expect(registrationCtas).toHaveLength(2);
    expect(registrationCtas.first().text()).toContain(
      'Criar conta grátis e ver a análise completa',
    );
    registrationCtas.each((_, cta) => {
      const destination = new URL($(cta).attr('href') || '');
      expect(destination.origin).toBe('https://macromarkets.com');
      expect(destination.pathname).toBe('/br/cadastro');
      expect(destination.searchParams.get('return_url')).toBe(
        '/br/brasileirao/rodada-24',
      );
    });
    expect(
      anonymousPane.find('[data-round-mobile-action="registration"]'),
    ).toHaveLength(1);
    expect(paneHtml.indexOf('data-round-summary="anonymous"')).toBeLessThan(
      paneHtml.indexOf('data-round-depth="anonymous"'),
    );
    expect(paneHtml.indexOf('data-round-cta-context="registration"')).toBeLessThan(
      paneHtml.indexOf('data-round-depth="anonymous"'),
    );
  });

  it('connects the free sample directly to the first-deposit offer', () => {
    const $ = loadRoute('pagina_rodada.html');
    const registeredPane = $('#p-b');
    const paneHtml = registeredPane.html() || '';
    const qfdCtas = registeredPane.find('[data-round-cta="qfd"]');
    const offerCopy = registeredPane.find('[data-round-offer="qfd"]').text();

    expect(registeredPane.find('[data-round-summary="registered"]')).toHaveLength(
      1,
    );
    expect(qfdCtas).toHaveLength(2);
    qfdCtas.each((_, cta) => {
      expect($(cta).text()).toContain(
        'Desbloquear os 10 vereditos desta rodada',
      );
      const destination = new URL($(cta).attr('href') || '');
      expect(destination.origin).toBe('https://macromarkets.com');
      expect(destination.pathname).toBe('/br/');
      expect(destination.searchParams.get('modal')).toBe('wallet');
      expect(destination.searchParams.get('tab')).toBe('deposit');
    });
    expect(
      registeredPane.find('[data-round-mobile-action="qfd"]'),
    ).toHaveLength(1);
    expect(paneHtml.indexOf('data-round-cta-context="qfd"')).toBeLessThan(
      paneHtml.indexOf('data-round-depth="registered"'),
    );
    expect(offerCopy).toContain('Primeiro depósito de R$ 50');
    expect(offerCopy).toContain('R$ 50 de bônus');
    expect(offerCopy).toContain('até 07/12/2026');
    expect(offerCopy).toContain('Consulte as condições');
  });

  it('keeps match-level depth available without expanding the round by default', () => {
    const $ = loadRoute('pagina_rodada.html');

    expect($('details[data-round-depth]')).toHaveLength(3);
    $('details[data-round-depth]').each((_, details) => {
      expect($(details).attr('open')).toBeUndefined();
      expect($(details).find('summary')).toHaveLength(1);
    });
  });

  it('keeps the Premium market action functional on desktop and mobile', () => {
    const $ = loadRoute('pagina_rodada.html');
    const premiumPane = $('#p-c');
    const marketCtas = premiumPane.find('[data-round-cta="market"]');

    expect(marketCtas).toHaveLength(2);
    marketCtas.each((_, cta) => {
      const destination = new URL($(cta).attr('href') || '');
      expect(destination.origin).toBe('https://macromarkets.com');
      expect(destination.pathname).toBe('/br/markets');
    });
    expect(premiumPane.find('[data-round-mobile-action="market"]')).toHaveLength(
      1,
    );
  });
});

describe('behavioral waitlist campaign', () => {
  it('renders the approved behavioral model and no four-email legacy', () => {
    const $ = loadRoute('sequencia_emails_waitlist.html');
    const text = $('main').text();

    expect($('[data-journey-matrix]')).toHaveLength(1);
    expect($('[data-frequency-cap]')).toHaveLength(1);
    expect($('[data-email-preview]')).toHaveLength(3);
    expect($('[data-instrumentation-catalog]')).toHaveLength(1);
    expect($('[data-attribution-model]')).toHaveLength(1);
    expect(text).toContain(
      'Abandono > Gate > 2+ > Rodada > Blog > Hub > Nunca viu',
    );
    expect(text).toContain('14 dias');
    expect(text).toContain('1 marketing / 24h');
    expect(text).toContain('5 / 7 dias');
    expect(text).toContain('block8_round_cycle');
    expect(text).toContain('waitlist_value_nurture');
    expect(text).not.toContain('Os quatro e-mails');
    expect(text).not.toContain('E-mail 4');
  });

  const journeyCases = [
    {
      state: 'never_viewed',
      destinations: [
        ['e1', 'pagina_hub_campeonato.html', '#hub-overview'],
        ['e2', 'pagina_lps_waitlist.html', '#lp-exclusive-comparison'],
        ['e3', 'pagina_blog.html', '#article-methodology'],
      ],
      suppression: 'Nenhuma além do cap.',
    },
    {
      state: 'viewed_hub',
      destinations: [
        ['e1', 'pagina_rodada.html', '#round-overview'],
        ['e2', 'pagina_lps_waitlist.html', '#lp-exclusive-comparison'],
        ['e3', 'pagina_blog.html', '#article-methodology'],
      ],
      suppression: 'Apresentação do Hub.',
    },
    {
      state: 'viewed_round',
      destinations: [
        ['e2', 'pagina_lps_waitlist.html', '#lp-exclusive-comparison'],
        ['e3_article', 'pagina_blog.html', '#article-methodology'],
        ['e3_registration', 'macromarkets.com/br/cadastro', 'return_url='],
      ],
      suppression: 'E1, calendário, jogos e introdução da Rodada.',
    },
    {
      state: 'viewed_blog',
      destinations: [
        ['e1', 'pagina_hub_campeonato.html', '#hub-overview'],
        ['e2', 'pagina_lps_waitlist.html', '#lp-exclusive-comparison'],
        ['e3', 'pagina_blog.html', '#article-methodology'],
      ],
      suppression: 'Apresentação genérica do Blog.',
    },
    {
      state: 'viewed_2_plus',
      destinations: [
        ['e2', 'pagina_lps_waitlist.html', '#lp-exclusive-demo'],
        ['e3', 'macromarkets.com/br/cadastro', 'return_url='],
      ],
      suppression: 'Descoberta e E1.',
    },
    {
      state: 'gate_intent',
      destinations: [
        ['recovery', 'macromarkets.com/br/cadastro', 'return_url='],
      ],
      suppression: 'Toda a sequência regular.',
    },
    {
      state: 'registration_abandonment',
      destinations: [
        ['recovery', 'macromarkets.com/br/cadastro', 'return_url='],
      ],
      suppression: 'Sequência regular e recuperação de gate.',
    },
  ] as const;

  it.each(journeyCases)(
    'renders every approved destination and suppression for $state',
    ({ state, destinations, suppression }) => {
      const $ = loadRoute('sequencia_emails_waitlist.html');
      const row = $(`[data-journey-state="${state}"]`);

      expect(row).toHaveLength(1);
      expect(row.find('[data-journey-suppression]').text()).toContain(
        suppression,
      );

      for (const [stage, pathname, context] of destinations) {
        const href =
          row
            .find(`[data-journey-destination="${stage}"]`)
            .attr('href') || '';
        const parsed = new URL(href, 'https://preview.local');

        expect(href).toContain(pathname);
        expect(href).toContain(context);
        expect(parsed.searchParams.get('utm_source')).toBe('mautic');
        expect(parsed.searchParams.get('utm_medium')).toBe('email');
        expect(parsed.searchParams.get('utm_campaign')).toBe(
          'waitlist_value_nurture',
        );
        expect(parsed.searchParams.get('utm_content')).not.toBe('');
        expect(parsed.searchParams.get('click_id')).toBe('{{click_id}}');
      }
    },
  );

  it.each([
    {
      state: 'viewed_round',
      stage: 'e3_registration',
      returnUrl:
        '/static-preview-notes/pagina_rodada.html#round-overview',
    },
    {
      state: 'viewed_2_plus',
      stage: 'e2',
      returnUrl: '{{return_url|url_encode}}',
    },
    {
      state: 'viewed_2_plus',
      stage: 'e3',
      returnUrl: '{{return_url|url_encode}}',
    },
    {
      state: 'gate_intent',
      stage: 'recovery',
      returnUrl: '{{return_url|url_encode}}',
    },
    {
      state: 'registration_abandonment',
      stage: 'recovery',
      returnUrl: '{{return_url|url_encode}}',
      resumeToken: '{{resume_token|url_encode}}',
    },
  ] as const)(
    'preserves the exact return surface for $state/$stage',
    ({ state, stage, returnUrl, resumeToken }) => {
      const $ = loadRoute('sequencia_emails_waitlist.html');
      const href =
        $(`[data-journey-state="${state}"]`)
          .find(`[data-journey-destination="${stage}"]`)
          .attr('href') || '';
      const parsed = new URL(href, 'https://preview.local');

      expect(parsed.searchParams.get('return_url')).toBe(returnUrl);
      if (resumeToken) {
        expect(parsed.searchParams.get('resume_token')).toBe(resumeToken);
      } else {
        expect(parsed.searchParams.has('resume_token')).toBe(false);
      }
    },
  );

  const variantCases = [
    {
      id: 'e1_discovery',
      previewId: 'email-preview-e1',
      subject: 'Sua conta grátis abre o que o e-mail não consegue mostrar',
      preview:
        'Comece pelo panorama do campeonato e veja onde a análise continua.',
      cta: 'Explorar o Hub',
      destination: 'pagina_hub_campeonato.html',
      utmContent: 'e1_discovery',
    },
    {
      id: 'e1_deepening_hub',
      previewId: 'email-preview-e1',
      subject: 'Você já viu o panorama. Agora veja o que muda na rodada.',
      preview:
        'O contexto aparece quando os dados saem da tabela e entram no confronto.',
      cta: 'Ver a análise da rodada',
      destination: 'pagina_rodada.html',
      utmContent: 'e1_deepening',
    },
    {
      id: 'e1_deepening_blog',
      previewId: 'email-preview-e1',
      subject: 'Os números por trás da análise estão no Hub',
      preview: 'Do artigo ao panorama atualizado do campeonato.',
      cta: 'Ver o panorama completo',
      destination: 'pagina_hub_campeonato.html',
      utmContent: 'e1_deepening',
    },
    {
      id: 'e2_discovery',
      previewId: 'email-preview-e2',
      subject: 'Por que as análises mais importantes não chegam por e-mail',
      preview:
        'Números exatos, histórico e contexto mudam; a plataforma mantém tudo atualizado.',
      cta: 'Ver o que a conta grátis libera',
      destination: 'pagina_lps_waitlist.html',
      utmContent: 'e2_discovery',
    },
    {
      id: 'e2_deepening',
      previewId: 'email-preview-e2',
      subject: 'O que estava por trás dos trechos que você abriu',
      preview:
        'Veja contexto, cenários e síntese sem perder o ponto em que você parou.',
      cta: 'Conhecer as análises exclusivas',
      destination: 'pagina_lps_waitlist.html',
      utmContent: 'e2_deepening',
      expectedReturnUrl: '{{return_url|url_encode}}',
    },
    {
      id: 'e3_discovery',
      previewId: 'email-preview-e3',
      subject: 'Veja uma análise completa antes de decidir',
      preview:
        'O artigo mostra o método; a conta abre os números e o histórico.',
      cta: 'Ler a análise',
      destination: 'pagina_blog.html',
      utmContent: 'e3_discovery',
    },
    {
      id: 'e3_deepening',
      previewId: 'email-preview-e3',
      subject: 'Retome exatamente de onde você parou',
      preview: 'Sua conta grátis abre a camada que você tentou consultar.',
      cta: 'Criar conta e continuar',
      destination: 'macromarkets.com/br/cadastro',
      utmContent: 'e3_deepening',
      expectedReturnUrl: '{{return_url|url_encode}}',
    },
    {
      id: 'gate_recovery',
      previewId: 'email-preview-e3',
      subject: 'A análise que você abriu continua disponível',
      preview: 'Crie a conta grátis e volte ao mesmo ponto.',
      cta: 'Continuar a análise',
      destination: 'macromarkets.com/br/cadastro',
      utmContent: 'gate_recovery_1',
      expectedReturnUrl: '{{return_url|url_encode}}',
    },
    {
      id: 'registration_recovery',
      previewId: 'email-preview-e3',
      subject: 'Seu cadastro ficou no meio do caminho',
      preview: 'Retome sem perder a análise que trouxe você até aqui.',
      cta: 'Retomar cadastro',
      destination: 'macromarkets.com/br/cadastro',
      utmContent: 'registration_recovery_1',
      expectedReturnUrl: '{{return_url|url_encode}}',
      expectedResumeToken: '{{resume_token|url_encode}}',
    },
  ] as const;

  it.each(variantCases)(
    'renders the complete approved contract for $id',
    ({
      id,
      previewId,
      subject,
      preview,
      cta,
      destination,
      utmContent,
      expectedReturnUrl,
      expectedResumeToken,
    }) => {
      const $ = loadRoute('sequencia_emails_waitlist.html');
      const variant = $(`[data-email-variant="${id}"]`);
      const emailPreview = variant.closest('[data-email-preview]');

      expect(variant).toHaveLength(1);
      expect(emailPreview).toHaveLength(1);
      expect(emailPreview.attr('aria-labelledby')).toBe(previewId);
      expect(
        emailPreview.find(`[data-email-variant="${id}"]`),
      ).toHaveLength(1);
      for (const field of [
        'subject',
        'preview',
        'argument',
        'cta',
        'destination',
        'suppression',
      ]) {
        const fieldElement = variant.find(`[data-variant-field="${field}"]`);

        expect(fieldElement).toHaveLength(1);
        expect(fieldElement.text().trim().length).toBeGreaterThan(0);
      }

      expect(variant.find('[data-variant-field="subject"]').text()).toContain(
        subject,
      );
      expect(variant.find('[data-variant-field="preview"]').text()).toContain(
        preview,
      );
      expect(variant.find('[data-variant-field="cta"]').text()).toContain(cta);

      const href =
        variant.find('[data-variant-field="destination"] a').attr('href') || '';
      const parsed = new URL(href, 'https://preview.local');

      expect(href).toContain(destination);
      expect(parsed.searchParams.get('utm_source')).toBe('mautic');
      expect(parsed.searchParams.get('utm_medium')).toBe('email');
      expect(parsed.searchParams.get('utm_campaign')).toBe(
        'waitlist_value_nurture',
      );
      expect(parsed.searchParams.get('utm_content')).toBe(utmContent);
      expect(parsed.searchParams.get('click_id')).toBe('{{click_id}}');
      if (expectedReturnUrl) {
        expect(parsed.searchParams.get('return_url')).toBe(expectedReturnUrl);
      } else {
        expect(parsed.searchParams.has('return_url')).toBe(false);
      }
      if (expectedResumeToken) {
        expect(parsed.searchParams.get('resume_token')).toBe(
          expectedResumeToken,
        );
      } else {
        expect(parsed.searchParams.has('resume_token')).toBe(false);
      }
    },
  );

  it('records journey exit before returning or starting onboarding', () => {
    const $ = loadRoute('sequencia_emails_waitlist.html');
    const steps = $('#registration-exit-flow li')
      .map((_, step) => $(step).text())
      .get();
    const exitIndex = steps.findIndex((step) =>
      step.includes('journey_exited'),
    );
    const returnIndex = steps.findIndex((step) => step.includes('return_url'));
    const onboardingIndex = steps.findIndex((step) =>
      step.includes('Iniciar onboarding'),
    );

    expect(steps[exitIndex]).toContain('registration_completed');
    expect(exitIndex).toBeGreaterThanOrEqual(0);
    expect(exitIndex).toBeLessThan(returnIndex);
    expect(exitIndex).toBeLessThan(onboardingIndex);
  });

  it('documents complete multi-touch attribution', () => {
    const $ = loadRoute('sequencia_emails_waitlist.html');
    const multiTouch = $('[data-attribution-touch="multi-touch"]').text();

    for (const property of [
      'campanha',
      'conteúdo',
      'variante',
      'click_id',
      'timestamp',
    ]) {
      expect(multiTouch).toContain(property);
    }
  });

  it('states the second gate recovery window without ambiguity', () => {
    const $ = loadRoute('sequencia_emails_waitlist.html');
    const gateRecovery = $('[data-email-variant="gate_recovery"]').text();

    expect(gateRecovery).toContain(
      '72 horas após a primeira recuperação',
    );
    expect(gateRecovery).not.toContain('até 72h');
  });

  it('keeps technical planning language outside email bodies', () => {
    const $ = loadRoute('sequencia_emails_waitlist.html');

    $('[data-email-body]').each((_, body) => {
      const copy = $(body).text();
      expect(copy).not.toMatch(
        /\b(Bloco 8|gate|journey_state|UTM|instrumentação)\b/i,
      );
    });
  });
});

describe('single institutional waitlist LP', () => {
  it('renders the approved ten-section conversion narrative', () => {
    const $ = loadRoute('pagina_lps_waitlist.html');
    const text = $('main').text();

    expect($('[data-institutional-lp]')).toHaveLength(1);
    expect($('#lp-exclusive-hero')).toHaveLength(1);
    expect($('[data-trust-row]')).toHaveLength(1);
    expect($('#lp-exclusive-comparison')).toHaveLength(1);
    expect($('#lp-exclusive-demo')).toHaveLength(1);
    expect($('[data-methodology-band]')).toHaveLength(1);
    expect($('[data-testimonials] article')).toHaveLength(3);
    expect($('[data-proof-metrics]')).toHaveLength(1);
    expect($('[data-ecosystem]')).toHaveLength(1);
    expect($('[data-faq] details')).toHaveLength(5);
    expect($('[data-final-cta]')).toHaveLength(1);
    expect(text).toContain('A análise que muda com os dados não cabe num e-mail.');
    expect(text).toContain('Criar conta grátis e ver as análises');
    expect(text).toContain('+12 mil leitores');
    expect(text).toContain('3 camadas exclusivas');
  });

  it('renders the ten approved sections in order and only one document h1', () => {
    const output = readFileSync(
      resolve(distDirectory, 'pagina_lps_waitlist.html'),
      'utf8',
    );
    const $ = cheerio.load(output);
    const orderedMarkers = [
      'id="lp-exclusive-hero"',
      'data-trust-row',
      'id="lp-exclusive-comparison"',
      'id="lp-exclusive-demo"',
      'data-methodology-band',
      'data-testimonials',
      'data-proof-metrics',
      'data-ecosystem',
      'data-faq',
      'data-final-cta',
    ];
    const positions = orderedMarkers.map((marker) => output.indexOf(marker));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect($('h1')).toHaveLength(1);
    expect($('#lp-exclusive-hero h2').text()).toBe(
      'A análise que muda com os dados não cabe num e-mail.',
    );
  });

  const testimonialCases = [
    {
      identity: 'Marina · Brasileirão',
      quote:
        'No e-mail eu já sabia o que estava em jogo. Na conta encontrei os cenários e a síntese que não cabiam na mensagem.',
    },
    {
      identity: 'Rafael · Copa do Brasil',
      quote:
        'O e-mail prepara. A conta entrega os números e o contexto completo.',
    },
    {
      identity: 'Camila · Libertadores',
      quote:
        'Criei a conta para comparar o recorte público com a análise completa. A diferença ficou evidente.',
    },
  ] as const;

  it.each(testimonialCases)(
    'renders the approved provisional testimonial from $identity',
    ({ identity, quote }) => {
      const $ = loadRoute('pagina_lps_waitlist.html');
      const testimonial = $('[data-testimonials] article').filter((_, card) =>
        $(card).text().includes(identity),
      );

      expect(testimonial).toHaveLength(1);
      expect(testimonial.find('blockquote').text()).toContain(quote);
    },
  );

  it('marks provisional proof internally without rendering the label', () => {
    const output = readFileSync(
      resolve(distDirectory, 'pagina_lps_waitlist.html'),
      'utf8',
    );
    const $ = cheerio.load(output);

    expect(output).toContain('[PROVISÓRIO]');
    expect($('body').text()).not.toContain('[PROVISÓRIO]');
    expect($('[data-testimonials]').text()).toContain('Marina');
    expect($('[data-testimonials]').text()).toContain('Rafael');
    expect($('[data-testimonials]').text()).toContain('Camila');
  });

  it('links the ecosystem and preserves return_url on registration CTAs', () => {
    const $ = loadRoute('pagina_lps_waitlist.html');
    const ecosystemHrefs = $('[data-ecosystem] a')
      .map((_, link) => $(link).attr('href'))
      .get();

    expect(ecosystemHrefs).toEqual(
      expect.arrayContaining([
        '/static-preview-notes/pagina_hub_campeonato.html#hub-overview',
        '/static-preview-notes/pagina_rodada.html#round-overview',
        '/static-preview-notes/pagina_blog.html#article-methodology',
      ]),
    );

    $('[data-registration-cta]').each((_, link) => {
      const href = $(link).attr('href') || '';
      expect(href).toContain('https://macromarkets.com/br/cadastro?');
      expect(href).toContain('return_url=');
      expect(href).toContain('utm_campaign=waitlist_value_nurture');
      expect(href).toContain('click_id=');
    });
  });

  it('avoids prohibited claims', () => {
    const $ = loadRoute('pagina_lps_waitlist.html');
    const text = $('main').text().toLowerCase();

    expect(text).not.toMatch(/taxa de acerto|lucro garantido|última chance/);
    expect(text).not.toMatch(/\b(aposte|stake)\b/);
  });
});

describe.each([
  'sequencia_emails_waitlist.html',
  'pagina_lps_waitlist.html',
])('campaign-wide prohibited copy in %s', (routePath) => {
  it('does not render prohibited claims or betting instructions', () => {
    const $ = loadRoute(routePath);
    const text = $('main').text().toLowerCase();

    expect(text).not.toMatch(
      /taxa de acerto|lucro garantido|última chance|ordem de aposta|stake recomendada/,
    );
    expect(text).not.toMatch(/\b(aposte|odds?|stakes?)\b/);
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
