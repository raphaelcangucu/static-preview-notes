# Waitlist → Cadastro Behavioral Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected four-email/four-LP presentation with a three-message behavioral Waitlist → Cadastro campaign, one institutional conversion LP, valid links to the existing Hub/Rodada/Blog previews, and a visual planning model for instrumentation and attribution.

**Architecture:** Keep all seven Astro routes and preserve `pagina_lps_waitlist.html` as the stable URL for the single institutional LP. A typed static campaign contract defines states, priority, events, properties, attribution names, destinations, recency, and caps; page-specific Astro sections render the sequence, matrix, instrumentation, emails, and LP without client-side runtime. Vitest and Cheerio validate the generated HTML, canonical navigation, anchors, copy, provisional-proof metadata, UTMs, and return URLs.

**Tech Stack:** Astro 7, Tailwind CSS 4, TypeScript 6, Vitest 4, Cheerio 1, static HTML output.

## Global Constraints

- Follow `docs/superpowers/specs/2026-08-19-waitlist-cadastro-behavioral-design.md` as the copy and behavior source of truth.
- Do not implement Mautic automation, production analytics, registration, authentication, or API calls; this repository only renders planning mocks.
- Keep at most three Waitlist → Cadastro messages per contact, including regular and recovery messages.
- Keep Bloco 8 parallel and higher priority; never duplicate calendar, games, scores, matchday, or current-round content.
- Reuse Hub, Página da Rodada, and Blog/article as destinations.
- Keep the existing `pagina_lps_waitlist.html` route, but present it everywhere as one institutional LP.
- Use the approved hero headline, subheadline, CTA, ten-section order, testimonials, metrics, and cases verbatim.
- Mark provisional proof internally with `[PROVISÓRIO]` comments or metadata; never render that label as visible text.
- Do not invent accuracy rates, urgency, profit promises, odds, stakes, or betting imperatives.
- Preserve `noindex`, the GitHub Pages base `/static-preview-notes`, seven-route canonical navigation, access-state semantics, WCAG AA intent, mobile behavior, and reduced-motion support.
- Do not use React components from `cloubet/front`; reproduce the visual patterns in Astro and page-local CSS.
- Do not add `set:html`, iframes, legacy HTML imports, or unnecessary client-side JavaScript.
- Do not run a development server during automated implementation. The localhost:8899 review is a human-operated final check.
- Do not create a git commit as part of this plan.

---

## File Map

### Create

- `src/lib/waitlistCampaign.ts` — typed static contract for behavioral states, event names, properties, destinations, attribution, recency, and caps.
- `tests/waitlistCampaign.test.ts` — unit contracts for the static behavioral model.

### Modify

- `src/lib/documents.ts` — singular canonical label/title/description for the preserved LP route.
- `src/pages/sequencia_emails_waitlist.astro` — new three-stage header and timeline.
- `src/pages/pagina_lps_waitlist.astro` — single institutional LP composition; remove four-LP timeline.
- `src/components/pages/index/Section10.astro` — replace the four-email/four-LP source document presentation.
- `src/components/pages/sequencia_emails_waitlist/Section01.astro` — campaign rules, priority, behavioral matrix, and caps.
- `src/components/pages/sequencia_emails_waitlist/Section02.astro` — three email previews, recovery variants, events, properties, and attribution.
- `src/components/pages/pagina_lps_waitlist/Section01.astro` — hero and trust row.
- `src/components/pages/pagina_lps_waitlist/Section02.astro` — visitor/email versus free-account comparison and exclusive-analysis demo.
- `src/components/pages/pagina_lps_waitlist/Section03.astro` — methodology band and testimonials.
- `src/components/pages/pagina_lps_waitlist/Section04.astro` — provisional metrics, cases, and ecosystem links.
- `src/components/pages/pagina_lps_waitlist/Section05.astro` — FAQ and final CTA with `return_url`.
- `src/components/pages/pagina_hub_campeonato/Section01.astro` — stable Hub overview and registration-teaser anchors.
- `src/components/pages/pagina_rodada/Section01.astro` — stable round overview and registration-teaser anchors.
- `src/components/pages/pagina_blog/Section02.astro` — stable article/methodology and registration-teaser anchors.
- `src/styles/pages/sequencia_emails_waitlist.css` — responsive behavioral-planning and email-preview styles.
- `src/styles/pages/pagina_lps_waitlist.css` — responsive institutional LP patterns modeled after the front.
- `tests/site.test.ts` — route metadata, query-aware links, anchors, sequence, LP, copy, and provisional-proof output contracts.

---

### Task 1: Lock the behavioral contract

**Files:**
- Create: `tests/waitlistCampaign.test.ts`
- Create: `src/lib/waitlistCampaign.ts`

**Interfaces:**
- Consumes: approved names and limits from the behavioral design specification.
- Produces: `JOURNEY_PRIORITY`, `TRACKING_EVENTS`, `REQUIRED_EVENT_PROPERTIES`, `DESTINATIONS`, `ATTRIBUTION_CAMPAIGNS`, `RECENCY_DAYS`, `FREQUENCY_CAP`, `JourneyState`, and `EmailVariant`.

- [ ] **Step 1: Write the failing contract test**

Create `tests/waitlistCampaign.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  ATTRIBUTION_CAMPAIGNS,
  DESTINATIONS,
  FREQUENCY_CAP,
  JOURNEY_PRIORITY,
  RECENCY_DAYS,
  REQUIRED_EVENT_PROPERTIES,
  TRACKING_EVENTS,
} from '../src/lib/waitlistCampaign';

describe('waitlist behavioral campaign contract', () => {
  it('keeps the approved state priority and recency', () => {
    expect(JOURNEY_PRIORITY).toEqual([
      'registration_abandonment',
      'gate_intent',
      'viewed_2_plus',
      'viewed_round',
      'viewed_blog',
      'viewed_hub',
      'never_viewed',
    ]);
    expect(RECENCY_DAYS).toBe(14);
  });

  it('publishes every required event and property', () => {
    expect(TRACKING_EVENTS).toEqual(
      expect.arrayContaining([
        'content_viewed',
        'content_engaged',
        'access_teaser_viewed',
        'access_teaser_clicked',
        'registration_cta_clicked',
        'registration_started',
        'registration_completed',
        'registration_abandoned',
        'lp_exclusive_viewed',
        'email_queued',
        'email_sent',
        'email_delivered',
        'email_opened',
        'email_clicked',
        'email_bounced',
        'email_unsubscribed',
        'email_preferences_updated',
        'journey_exited',
      ]),
    );
    expect(REQUIRED_EVENT_PROPERTIES).toEqual(
      expect.arrayContaining([
        'event_id',
        'contact_id',
        'anonymous_id',
        'session_id',
        'surface',
        'content_id',
        'gate_id',
        'access_state',
        'source_campaign',
        'source_email',
        'email_variant',
        'journey_state',
        'league',
        'referrer',
        'return_url',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'click_id',
        'timestamp',
      ]),
    );
  });

  it('separates campaigns and fixes frequency limits', () => {
    expect(ATTRIBUTION_CAMPAIGNS).toEqual({
      block8: 'block8_round_cycle',
      waitlist: 'waitlist_value_nurture',
    });
    expect(FREQUENCY_CAP).toEqual({
      marketingPer24Hours: 1,
      marketingPer7Days: 5,
      staleAfterHours: 72,
      maxJourneyMessages: 3,
      block8HasPriority: true,
    });
  });

  it('uses only existing static documents as campaign surfaces', () => {
    expect(DESTINATIONS).toEqual({
      hub: '/static-preview-notes/pagina_hub_campeonato.html#hub-overview',
      round: '/static-preview-notes/pagina_rodada.html#round-overview',
      blog: '/static-preview-notes/pagina_blog.html#article-methodology',
      institutionalLp:
        '/static-preview-notes/pagina_lps_waitlist.html#lp-exclusive-hero',
      registration: 'https://macromarkets.com/br/cadastro',
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- tests/waitlistCampaign.test.ts
```

Expected: exit code `1` with module resolution failure for `src/lib/waitlistCampaign.ts`.

- [ ] **Step 3: Implement the immutable static contract**

Create `src/lib/waitlistCampaign.ts`:

```ts
export const JOURNEY_PRIORITY = [
  'registration_abandonment',
  'gate_intent',
  'viewed_2_plus',
  'viewed_round',
  'viewed_blog',
  'viewed_hub',
  'never_viewed',
] as const;

export type JourneyState = (typeof JOURNEY_PRIORITY)[number];

export const EMAIL_VARIANTS = [
  'discovery',
  'deepening',
  'gate_recovery',
  'registration_recovery',
] as const;

export type EmailVariant = (typeof EMAIL_VARIANTS)[number];

export const TRACKING_EVENTS = [
  'content_viewed',
  'content_engaged',
  'access_teaser_viewed',
  'access_teaser_clicked',
  'registration_cta_clicked',
  'registration_started',
  'registration_completed',
  'registration_abandoned',
  'lp_exclusive_viewed',
  'email_queued',
  'email_sent',
  'email_delivered',
  'email_opened',
  'email_clicked',
  'email_bounced',
  'email_unsubscribed',
  'email_preferences_updated',
  'journey_exited',
] as const;

export const REQUIRED_EVENT_PROPERTIES = [
  'event_id',
  'contact_id',
  'anonymous_id',
  'session_id',
  'surface',
  'content_id',
  'gate_id',
  'access_state',
  'source_campaign',
  'source_email',
  'email_variant',
  'journey_state',
  'league',
  'referrer',
  'return_url',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'click_id',
  'timestamp',
] as const;

export const DESTINATIONS = {
  hub: '/static-preview-notes/pagina_hub_campeonato.html#hub-overview',
  round: '/static-preview-notes/pagina_rodada.html#round-overview',
  blog: '/static-preview-notes/pagina_blog.html#article-methodology',
  institutionalLp:
    '/static-preview-notes/pagina_lps_waitlist.html#lp-exclusive-hero',
  registration: 'https://macromarkets.com/br/cadastro',
} as const;

export const ATTRIBUTION_CAMPAIGNS = {
  block8: 'block8_round_cycle',
  waitlist: 'waitlist_value_nurture',
} as const;

export const RECENCY_DAYS = 14;

export const FREQUENCY_CAP = {
  marketingPer24Hours: 1,
  marketingPer7Days: 5,
  staleAfterHours: 72,
  maxJourneyMessages: 3,
  block8HasPriority: true,
} as const;
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
npm test -- tests/waitlistCampaign.test.ts
```

Expected: exit code `0`; four tests pass.

---

### Task 2: Replace canonical four-LP metadata and index copy

**Files:**
- Modify: `tests/site.test.ts`
- Modify: `src/lib/documents.ts`
- Modify: `src/components/pages/index/Section10.astro`

**Interfaces:**
- Consumes: the preserved slug and filename `pagina_lps_waitlist` / `pagina_lps_waitlist.html`.
- Produces: one canonical nav item labeled `LP institucional`, one updated route title, and a Bloco 11 summary that links to the behavioral sequence and single LP.

- [ ] **Step 1: Update the route expectation and add singular-language assertions**

In the `pagina_lps_waitlist` route entry inside `tests/site.test.ts`, change the expected title to:

```ts
title: 'Macro Markets — Análises exclusivas com conta grátis',
```

Add to `generated route matrix`:

```ts
it('presents one institutional LP in navigation and source document', () => {
  const lp = loadRoute('pagina_lps_waitlist.html');
  const index = loadRoute('index.html');

  expect(
    lp('[data-site-navigation] a[href="/static-preview-notes/pagina_lps_waitlist.html"]')
      .text()
      .trim(),
  ).toBe('LP institucional');
  expect(index('main').text()).toContain('uma LP institucional');
  expect(index('main').text()).not.toContain('quatro LPs');
  expect(lp('main').text()).not.toContain('Quatro landings');
});
```

- [ ] **Step 2: Build and run the output test to verify it fails**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: exit code `1`; failures mention the old title, `LPs Waitlist`, `quatro LPs`, or `Quatro landings`.

- [ ] **Step 3: Update the canonical document definition**

Replace the `pagina_lps_waitlist` object in `src/lib/documents.ts` with:

```ts
{
  slug: 'pagina_lps_waitlist',
  filename: 'pagina_lps_waitlist.html',
  label: 'LP institucional',
  title: 'Macro Markets — Análises exclusivas com conta grátis',
  description:
    'Landing institucional da campanha waitlist para apresentar análises exclusivas e converter para uma conta grátis.',
},
```

- [ ] **Step 4: Replace the Bloco 11 source-document presentation**

Rewrite `src/components/pages/index/Section10.astro` so it contains:

- heading `Bloco 11 — Campanha comportamental de Waitlist → Cadastro`;
- statement that Bloco 8 runs in parallel and has priority;
- three rows: E1 Orientação, E2 Prova institucional, E3 Decisão/recuperação;
- the seven-state priority in the approved order;
- direct links to `sequencia_emails_waitlist.html` and the singular `pagina_lps_waitlist.html`;
- sentence `uma LP institucional, além de Hub, Rodada e Blog já existentes`;
- no reference to E4, Perfil, four emails, or four LPs.

Use this exact summary table content:

```html
<tbody>
  <tr>
    <th>Peça</th>
    <th>Job</th>
    <th>Destino por comportamento</th>
  </tr>
  <tr>
    <td><b>E-mail 1</b><br />Orientação</td>
    <td>Apresentar somente a próxima superfície útil.</td>
    <td>Hub, Rodada ou supressão.</td>
  </tr>
  <tr>
    <td><b>E-mail 2</b><br />Prova institucional</td>
    <td>Demonstrar o valor da conta grátis.</td>
    <td>Uma LP institucional.</td>
  </tr>
  <tr>
    <td><b>E-mail 3</b><br />Decisão/recuperação</td>
    <td>Levar ao artigo ou retomar conteúdo/cadastro.</td>
    <td>Blog, cadastro com return_url ou retomada.</td>
  </tr>
</tbody>
```

- [ ] **Step 5: Rebuild and rerun the focused output test**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: the new title, singular nav label, and index assertions pass; LP body assertions may remain failing until Task 5.

---

### Task 3: Add stable destination and return anchors

**Files:**
- Modify: `tests/site.test.ts`
- Modify: `src/components/pages/pagina_hub_campeonato/Section01.astro`
- Modify: `src/components/pages/pagina_rodada/Section01.astro`
- Modify: `src/components/pages/pagina_blog/Section02.astro`

**Interfaces:**
- Consumes: existing visitor scenarios and registration teaser blocks.
- Produces: `#hub-overview`, `#hub-registration-teaser`, `#round-overview`, `#round-registration-teaser`, `#article-methodology`, and `#blog-registration-teaser` for campaign links and `return_url`.

- [ ] **Step 1: Add a generated-anchor contract**

Add to `tests/site.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the focused test to verify the anchors are absent**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: exit code `1`; each new anchor case reports length `0`.

- [ ] **Step 3: Add zero-height overview anchors**

Insert these markers immediately before the first visitor pane in each file:

```astro
<div id="hub-overview" class="scroll-mt-28" aria-hidden="true"></div>
```

in `src/components/pages/pagina_hub_campeonato/Section01.astro`;

```astro
<div id="round-overview" class="scroll-mt-28" aria-hidden="true"></div>
```

in `src/components/pages/pagina_rodada/Section01.astro`;

```astro
<div id="article-methodology" class="scroll-mt-28" aria-hidden="true"></div>
```

in `src/components/pages/pagina_blog/Section02.astro`.

- [ ] **Step 4: Add teaser anchors at the visitor registration CTAs**

Immediately before the first visitor “Criar conta grátis” block in each file, insert:

```astro
<div id="hub-registration-teaser" class="scroll-mt-28" aria-hidden="true"></div>
```

```astro
<div id="round-registration-teaser" class="scroll-mt-28" aria-hidden="true"></div>
```

```astro
<div id="blog-registration-teaser" class="scroll-mt-28" aria-hidden="true"></div>
```

Do not rename existing scenario IDs such as `p-a`, `p1`, `sc-a`, or `t1`.

- [ ] **Step 5: Rebuild and verify every anchor**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: all six anchor cases pass and existing scenario-link tests remain green.

---

### Task 4: Build the behavioral sequence planning page

**Files:**
- Modify: `tests/site.test.ts`
- Modify: `src/pages/sequencia_emails_waitlist.astro`
- Modify: `src/components/pages/sequencia_emails_waitlist/Section01.astro`
- Modify: `src/components/pages/sequencia_emails_waitlist/Section02.astro`
- Modify: `src/styles/pages/sequencia_emails_waitlist.css`

**Interfaces:**
- Consumes: `JOURNEY_PRIORITY`, `TRACKING_EVENTS`, `REQUIRED_EVENT_PROPERTIES`, `ATTRIBUTION_CAMPAIGNS`, `RECENCY_DAYS`, `FREQUENCY_CAP`, and destination anchors from Tasks 1 and 3.
- Produces: static markers `data-journey-matrix`, `data-frequency-cap`, `data-email-preview`, `data-instrumentation-catalog`, and `data-attribution-model`.

- [ ] **Step 1: Add failing generated-HTML contracts**

Add to `tests/site.test.ts`:

```ts
describe('behavioral waitlist campaign', () => {
  it('renders the approved behavioral model and no four-email legacy', () => {
    const $ = loadRoute('sequencia_emails_waitlist.html');
    const text = $('main').text();

    expect($('[data-journey-matrix]')).toHaveLength(1);
    expect($('[data-frequency-cap]')).toHaveLength(1);
    expect($('[data-email-preview]')).toHaveLength(3);
    expect($('[data-instrumentation-catalog]')).toHaveLength(1);
    expect($('[data-attribution-model]')).toHaveLength(1);
    expect(text).toContain('Abandono > Gate > 2+ > Rodada > Blog > Hub > Nunca viu');
    expect(text).toContain('14 dias');
    expect(text).toContain('1 marketing / 24h');
    expect(text).toContain('5 / 7 dias');
    expect(text).toContain('block8_round_cycle');
    expect(text).toContain('waitlist_value_nurture');
    expect(text).not.toContain('Os quatro e-mails');
    expect(text).not.toContain('E-mail 4');
  });

  it('keeps technical planning language outside email bodies', () => {
    const $ = loadRoute('sequencia_emails_waitlist.html');

    $('[data-email-body]').each((_, body) => {
      const copy = $(body).text();
      expect(copy).not.toMatch(/\b(Bloco 8|gate|journey_state|UTM|instrumentação)\b/i);
    });
  });
});
```

- [ ] **Step 2: Build and verify the new page contracts fail**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: exit code `1`; behavioral markers are missing and four legacy email content is still present.

- [ ] **Step 3: Replace the page header and timeline**

In `src/pages/sequencia_emails_waitlist.astro`:

- keep `BaseLayout`, `PageHeader`, `Timeline`, `documentBySlug`, both Section imports, and the page CSS;
- use title `Campanha Waitlist → Cadastro — comportamental`;
- use description `Evergreen, no máximo três mensagens e recalculada por comportamento. O Bloco 8 roda em paralelo, tem prioridade e não é duplicado aqui.`;
- render exactly three timeline items:

```astro
<Timeline
  items={[
    {
      label: 'E1',
      title: 'Orientação',
      description: 'Apresenta apenas a próxima superfície útil.',
    },
    {
      label: 'E2',
      title: 'Prova institucional',
      description: 'Mostra o que a conta grátis abre além do e-mail.',
    },
    {
      label: 'E3',
      title: 'Decisão / recuperação',
      description: 'Leva ao artigo ou retoma conteúdo e cadastro.',
    },
  ]}
/>
```

- [ ] **Step 4: Replace Section01 with campaign rules and matrix**

`src/components/pages/sequencia_emails_waitlist/Section01.astro` must import the static contract and render:

1. a top note that Bloco 8 has priority;
2. a priority banner with exact visible copy `Abandono > Gate > 2+ > Rodada > Blog > Hub > Nunca viu`;
3. a seven-row `data-journey-matrix` table using the destinations and suppressions from specification section 6;
4. discovery/deepening/recovery cards;
5. a `data-frequency-cap` panel with `14 dias`, `1 marketing / 24h`, `5 / 7 dias`, stale `>72h`, and lifetime maximum `3`;
6. an exit panel for registration, opt-out, bounce, and complaint.

The seven visible row labels must be:

```ts
[
  'Abandonou cadastro',
  'Tocou gate',
  'Viu 2+',
  'Viu Rodada',
  'Viu Blog',
  'Viu Hub',
  'Nunca viu',
]
```

- [ ] **Step 5: Replace Section02 with three email previews and instrumentation**

`src/components/pages/sequencia_emails_waitlist/Section02.astro` must render exactly three top-level elements with `data-email-preview`. Each contains:

- a planning header with stage, state, variant, timing, job, CTA, destination, and suppression;
- one `data-email-body` that shows only recipient-facing subject, preview, argument, CTA, opt-out, and compliance footer;
- discovery and deepening variants from specification section 7;
- recovery variants inside E3, not as a fourth top-level preview.

After the previews, render:

- `data-instrumentation-catalog` with all 18 event names and all 23 required properties from `src/lib/waitlistCampaign.ts`;
- deduplication notes for `event_id`, `session_id + gate_id`, and `click_id`;
- `data-attribution-model` with first touch, last meaningful touch, multi-touch, `block8_round_cycle`, and `waitlist_value_nurture`;
- an example UTM:

```text
utm_source=mautic
utm_medium=email
utm_campaign=waitlist_value_nurture
utm_content=e2_deepening
click_id={{click_id}}
```

- the registration exit flow: cancel waitlist, preserve attribution, validate `return_url`, return to content, start onboarding.

- [ ] **Step 6: Replace page CSS with responsive dark planning patterns**

In `src/styles/pages/sequencia_emails_waitlist.css`:

- alias existing global tokens instead of restoring old light colors;
- style matrix tables with an explicit horizontal scroll wrapper under 760px;
- style priority, variant, cap, exit, instrumentation, and attribution cards;
- keep email clients at `max-width: 640px`;
- give every CTA at least 44px height;
- preserve `prefers-reduced-motion` from global CSS;
- ensure no horizontal body overflow at 390px.

Required selectors:

```css
.journey-priority {}
.journey-matrix {}
.variant-grid {}
.frequency-cap {}
.email-preview {}
.instrumentation-grid {}
.attribution-grid {}
.exit-flow {}
```

- [ ] **Step 7: Build and run campaign output tests**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: the behavioral campaign describe block passes; no “E-mail 4” or “Os quatro e-mails” remains in the generated sequence page.

---

### Task 5: Replace four landing previews with one institutional LP

**Files:**
- Modify: `tests/site.test.ts`
- Modify: `src/pages/pagina_lps_waitlist.astro`
- Modify: `src/components/pages/pagina_lps_waitlist/Section01.astro`
- Modify: `src/components/pages/pagina_lps_waitlist/Section02.astro`
- Modify: `src/components/pages/pagina_lps_waitlist/Section03.astro`
- Modify: `src/components/pages/pagina_lps_waitlist/Section04.astro`
- Modify: `src/components/pages/pagina_lps_waitlist/Section05.astro`
- Modify: `src/styles/pages/pagina_lps_waitlist.css`

**Interfaces:**
- Consumes: stable route metadata from Task 2, Hub/Rodada/Blog anchors from Task 3, and the approved proof/copy in the specification.
- Produces: one `data-institutional-lp` document with the ten ordered sections and final registration URL carrying `return_url`.

- [ ] **Step 1: Add failing LP output contracts**

Add to `tests/site.test.ts`:

```ts
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
```

- [ ] **Step 2: Build and verify LP contracts fail**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: exit code `1`; institutional markers are missing and the old four-LP composition remains.

- [ ] **Step 3: Convert the page shell to one LP**

In `src/pages/pagina_lps_waitlist.astro`:

- remove `Timeline` import and timeline markup;
- keep `PageHeader`, `BaseLayout`, `documentBySlug`, five Section imports, and page CSS;
- use title `Análises exclusivas com conta grátis`;
- use description `Uma única landing institucional para demonstrar o valor que permanece atualizado na plataforma e devolver cada leitor ao conteúdo que motivou o cadastro.`;
- wrap the five sections in:

```astro
<article class="astro-document" data-institutional-lp>
  <div class="wrap">
    <Section01 />
    <Section02 />
    <Section03 />
    <Section04 />
    <Section05 />
  </div>
</article>
```

- [ ] **Step 4: Implement Section01 — hero and trust row**

`Section01.astro` must render:

- `id="lp-exclusive-hero"`;
- headline `A análise que muda com os dados não cabe num e-mail.`;
- subheadline `A conta grátis abre números exatos, histórico, contexto e análises exclusivas atualizadas na plataforma.`;
- CTA `Criar conta grátis e ver as análises`;
- registration URL with:

```text
https://macromarkets.com/br/cadastro
?return_url={{return_url|url_encode}}
&utm_source=mautic
&utm_medium=email
&utm_campaign=waitlist_value_nurture
&utm_content=lp_hero
&click_id={{click_id}}
```

Render the query on one line in the actual `href`.

Under `data-trust-row`, render exactly:

- `Conta grátis`;
- `Sem cartão`;
- `Análises atualizadas`.

Use an Astro-native stat badge for `+12 mil leitores` and place this directly before it:

```html
<!-- [PROVISÓRIO] Métrica de leitores deve ser substituída por número auditável antes de publicação externa. -->
```

- [ ] **Step 5: Implement Section02 — comparison and exclusive demo**

Render `id="lp-exclusive-comparison"` with two columns:

```text
Visitante / e-mail
Orientação
Recorte público
Fatos e contexto resumido

Conta grátis
Números exatos
Histórico
Contexto aprofundado
Cenários
Síntese
```

Render `id="lp-exclusive-demo"` with:

- public email excerpt;
- account view with the three exclusive layers;
- a completed-analysis retrospective that explicitly shows `O que se confirmou` and `O que não se confirmou`;
- no accuracy percentage;
- visible note that the example is illustrative planning content.

Place this comment before the retrospective:

```html
<!-- [PROVISÓRIO] Substituir pelo retrospecto publicado e autorizado antes de publicação externa. -->
```

- [ ] **Step 6: Implement Section03 — methodology and testimonials**

Render `data-methodology-band` as a static Astro grid inspired by the front’s `MethodologyBand`:

- `Dados`;
- `Contexto`;
- `Tendências`;
- result `Leitura de cenário`.

Do not import or copy React JSX.

Render `data-testimonials` with three `<article>` elements and abstract initial avatars. Place this comment before the grid:

```html
<!-- [PROVISÓRIO] Depoimentos de planejamento; substituir por prova autorizada antes de publicação externa. -->
```

Use exact content:

```text
Marina · Brasileirão
“No e-mail eu já sabia o que estava em jogo. Na conta encontrei os cenários e a síntese que não cabiam na mensagem.”

Rafael · Copa do Brasil
“O e-mail prepara. A conta entrega os números e o contexto completo.”

Camila · Libertadores
“Criei a conta para comparar o recorte público com a análise completa. A diferença ficou evidente.”
```

- [ ] **Step 7: Implement Section04 — metrics, cases, and ecosystem**

Render `data-proof-metrics` with:

- `+12 mil leitores`;
- `3 camadas exclusivas`;
- labels `Contexto aprofundado`, `Cenários`, and `Síntese`;
- case `O que chegou por e-mail × o que ficou disponível na conta`;
- case `Retrospecto encerrado: o que confirmou e o que não confirmou`.

Precede the reader metric and both cases with `[PROVISÓRIO]` comments.

Render `data-ecosystem` with exactly three valid links:

```html
<a href="/static-preview-notes/pagina_hub_campeonato.html#hub-overview">Hub do Campeonato</a>
<a href="/static-preview-notes/pagina_rodada.html#round-overview">Página da Rodada</a>
<a href="/static-preview-notes/pagina_blog.html#article-methodology">Blog e análises</a>
```

- [ ] **Step 8: Implement Section05 — FAQ and final CTA**

Render `data-faq` with five semantic `<details>` elements:

1. `A conta é grátis?` — `Sim. O cadastro não exige cartão.`
2. `Vou receber palpites?` — `Não. A Macro Markets organiza dados, contexto, tendências e cenários; não manda odd, stake ou ordem de aposta.`
3. `Por que a análise não vem inteira no e-mail?` — `Porque números, histórico e contexto mudam. A plataforma mantém a versão atualizada.`
4. `O que acontece depois do cadastro?` — `Você volta ao conteúdo de origem e começa um onboarding curto.`
5. `Isso é o Premium?` — `Não. Esta página apresenta apenas o que a conta grátis libera.`

Render `data-final-cta` and `data-registration-cta` with:

- CTA `Criar conta grátis e ver as análises`;
- the same registration base URL;
- `return_url={{return_url|url_encode}}`;
- `utm_content=lp_final`;
- `click_id={{click_id}}`;
- fallback copy `Sem origem válida, você volta para o Hub do Campeonato.`

- [ ] **Step 9: Replace LP CSS with Astro-native front patterns**

In `src/styles/pages/pagina_lps_waitlist.css`, implement:

- mobile-first one-column hero, progressing to two columns at 800px;
- dark stat badges inspired by `HeroStatBadge`;
- three-item trust row;
- comparison cards with clear free-account emphasis;
- exclusive-demo split;
- methodology band with three factor cells and one highlighted result;
- testimonial cards in one column, then three at desktop;
- metrics/cases grid;
- three ecosystem cards;
- FAQ details with visible focus;
- final CTA panel;
- 44px minimum CTA height;
- 390px overflow protection;
- no decorative urgency, countdown, or animated social-proof toast.

Required selectors:

```css
.lp-hero {}
.hero-stat-badge {}
.trust-row {}
.comparison-grid {}
.exclusive-demo {}
.methodology-band {}
.testimonial-grid {}
.proof-grid {}
.ecosystem-grid {}
.faq-list {}
.final-cta {}
```

- [ ] **Step 10: Build and run LP output tests**

Run:

```bash
npm run build && npm test -- tests/site.test.ts
```

Expected: all single-institutional-LP tests pass; output contains internal `[PROVISÓRIO]` comments, but the label is absent from visible body text.

---

### Task 6: Make internal-link validation query-aware

**Files:**
- Modify: `tests/site.test.ts`

**Interfaces:**
- Consumes: campaign links with UTMs, `click_id`, `return_url`, and fragments.
- Produces: canonical path-and-anchor validation that ignores query strings while still failing broken static routes and missing anchors.

- [ ] **Step 1: Add a regression case with query parameters**

Add a unit case near the internal-link audit:

```ts
it('resolves static campaign links independently of query parameters', () => {
  const href =
    '/static-preview-notes/pagina_rodada.html?utm_campaign=waitlist_value_nurture&utm_content=e1_deepening#round-overview';
  const parsed = new URL(href, 'https://preview.local');

  expect(parsed.pathname).toBe('/static-preview-notes/pagina_rodada.html');
  expect(parsed.hash).toBe('#round-overview');
});
```

- [ ] **Step 2: Update the shared internal-link parser**

Replace the current `href.split('#')` logic with:

```ts
const parsed = new URL(href, 'https://preview.local');
const pathname = parsed.pathname;
const fragment = parsed.hash.replace(/^#/, '');
const targetRoute =
  pathname === `${basePath}/` || pathname === ''
    ? routes[0]
    : routes.find((candidate) => candidate.publicPath === pathname);
```

Keep external `http:`, `https:`, `mailto:`, and `tel:` links excluded before parsing. Continue loading the target page and asserting one matching ID when `fragment` is non-empty.

- [ ] **Step 3: Build and run the complete test suite**

Run:

```bash
npm run build && npm test
```

Expected: exit code `0`; all Vitest suites pass and every campaign link resolves to a canonical static route/anchor or an intentionally external registration URL.

---

### Task 7: Verify type safety, build output, content, and manual presentation

**Files:**
- Inspect: all files listed in this plan.
- Modify: only the directly failing file if a reproducible verification issue is found.

**Interfaces:**
- Consumes: final source and generated `dist/`.
- Produces: green automated checks and a recorded manual review result; no deployment or commit.

- [ ] **Step 1: Run the project’s canonical check**

Run:

```bash
npm run check
```

Expected: exit code `0`; `astro check` reports no errors, Astro generates all seven pages, and Vitest reports all tests passing.

- [ ] **Step 2: Scan source and generated content for rejected concepts**

Run:

```bash
rg -n "Quatro landings|quatro LPs|Os quatro e-mails|E-mail 4|waitlist_profile_survey" src dist
```

Expected: no output.

- [ ] **Step 3: Confirm required copy and markers**

Run:

```bash
rg -n "A análise que muda com os dados não cabe num e-mail|Criar conta grátis e ver as análises|\\[PROVISÓRIO\\]|waitlist_value_nurture|block8_round_cycle" src dist
```

Expected: matches in the institutional LP and behavioral sequence sources and generated HTML; `[PROVISÓRIO]` appears only in source/comments or non-visible metadata.

- [ ] **Step 4: Confirm no prohibited claims**

Run:

```bash
rg -ni "taxa de acerto|lucro garantido|última chance|aposte agora|stake recomendada" src/components/pages/sequencia_emails_waitlist src/components/pages/pagina_lps_waitlist
```

Expected: no output.

- [ ] **Step 5: Review the final diff without staging**

Run:

```bash
git status --short && git diff --check && git diff --stat
```

Expected: only files from this plan plus the approved spec/plan are changed; `git diff --check` produces no output and exits `0`.

- [ ] **Step 6: Perform the human-operated localhost review**

The human operator, not the agent, starts:

```bash
npm run dev -- --host 127.0.0.1 --port 8899
```

Expected terminal output: Astro reports a local URL on `http://localhost:8899`.

Review:

- `http://localhost:8899/static-preview-notes/sequencia_emails_waitlist.html`
- `http://localhost:8899/static-preview-notes/pagina_lps_waitlist.html`
- `http://localhost:8899/static-preview-notes/`
- `http://localhost:8899/static-preview-notes/pagina_hub_campeonato.html#hub-overview`
- `http://localhost:8899/static-preview-notes/pagina_rodada.html#round-overview`
- `http://localhost:8899/static-preview-notes/pagina_blog.html#article-methodology`

Expected manual results:

- navigation displays `LP institucional` on every page;
- active navigation state remains correct;
- sequence shows three email previews, seven behavioral states, caps, events, properties, and attribution;
- technical terminology does not appear inside recipient-facing email bodies;
- LP sections appear in the approved ten-part order;
- testimonial and metric proof looks natural and does not visibly show `[PROVISÓRIO]`;
- CTA URLs retain `return_url`, campaign UTMs, variant content, and `click_id`;
- Hub/Rodada/Blog cards and campaign email links reach the correct anchors;
- 390px layout has no unintended horizontal overflow;
- keyboard focus is visible and order follows the page;
- no console error or missing asset is observed.

- [ ] **Step 7: Stop the human-operated server after review**

Use `Ctrl+C` in the same terminal.

Expected: the localhost:8899 process exits cleanly.

---

## Task Interfaces Summary

1. Task 1 defines the immutable names and limits used by all visual planning components.
2. Task 2 makes the preserved route singular in canonical metadata and removes the rejected parent-document narrative.
3. Task 3 establishes the exact destination/return anchors consumed by email and ecosystem links.
4. Task 4 renders the behavioral decision model and recipient-facing emails using Tasks 1 and 3.
5. Task 5 renders the single institutional LP and its ecosystem/registration links using Tasks 2 and 3.
6. Task 6 ensures UTMs and `return_url` do not weaken static link validation.
7. Task 7 verifies the integrated result without deployment, server automation, staging, or commit creation.
