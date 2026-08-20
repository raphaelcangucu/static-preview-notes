# Astro Migration Design

## Goal

Migrate the seven published static documents to an Astro static site without changing their public `.html` URLs or the GitHub Pages project URL.

## Architecture

- Astro static output with `site` set to `https://raphaelcangucu.github.io` and `base` set to `/static-preview-notes`.
- Tailwind CSS provides shared layout, navigation, responsive behavior, accessibility helpers, and centralized design tokens.
- A shared `BaseLayout` owns document metadata, the mandatory `noindex, nofollow, noarchive` directive, navigation, and footer.
- A shared responsive navigation renders one route matrix, base-aware links, and an active item through `aria-current="page"`.
- Existing long-form mock content is migrated mechanically into structured Astro content modules so text and detailed visual examples remain intact.
- Reusable components cover navigation, segmented tabs, panels/cards, and the four semantic access states.
- Client JavaScript is avoided; tab interactions continue to use semantic HTML and CSS.

## Design System

- Active: solid green.
- Partial: dashed blue, reduced granularity, never a paid gate.
- Locked: dotted amber; amber/gold is reserved for paid content, labels remain readable, and only values are veiled.
- Absent: ghost gray.
- Premium: consistent dark canvas.
- Shared colors target WCAG AA: 4.5:1 for normal text and 3:1 for large text and UI components.

## Routes

- `/`
- `/pagina_hub_campeonato.html`
- `/pagina_rodada.html`
- `/pagina_blog.html`
- `/sequencia_emails.html`
- `/sequencia_emails_waitlist.html`
- `/pagina_lps_waitlist.html`

## Publishing

GitHub Pages remains at `https://raphaelcangucu.github.io/static-preview-notes/`. Deployment moves from legacy branch publishing to the official Pages Actions flow, uploading Astro's `dist/` artifact.

## Validation

Vitest audits generated HTML in `dist/` for the route matrix, titles, active navigation, noindex metadata, internal links, and semantic state tokens. Final validation also runs Astro Check, production build, local desktop/mobile browser review, and live HTTP checks after deployment.
