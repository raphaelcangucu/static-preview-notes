# UX 2026 Redesign Design

## Canonical visual reference

`Macro-Markets/world-cup-2026-simulator` is the canonical visual source for this redesign. The target remains an Astro/Tailwind site; only presentation patterns are ported. Business logic, tournament data, client-side state, authentication, routes, and APIs from the simulator are out of scope.

The reference is a framework-free static project with no package manifest and no license file. Its README explicitly limits reuse outside Macro Markets-controlled properties. This project is also a Macro Markets property, but the redesign will still avoid copying unused scripts and protected assets; the visual language is reproduced through focused tokens, CSS, and Astro components.

## Direction

The seven documents become a cohesive dark Macro Markets product family:

- near-black application canvas with restrained raised surfaces;
- compact, information-dense cards and panels;
- Inter-based typography with strong title weight and tabular numeric data;
- green as the primary action and selected state;
- blue as secondary information;
- small uppercase kickers, compact pills, fine dividers, and subtle shadows;
- responsive containers at 1400px desktop and 10px mobile gutters;
- no glassmorphism, large decorative gradients, neon, or dashboard chrome unrelated to the content.

The documents retain distinct compositions: long-form planning, championship data, round analysis, editorial discovery, email timelines/previews, and landing-page comparisons.

## Ported tokens

The target design system adapts these reference values:

- canvas `#111318`, modal `#181b21`, surface `#1b1e25`, raised surface `#212632`;
- divider `#3f434c`;
- primary `#22c55e`, hover `#5ee349`, primary contrast `#052e16`;
- secondary `#368bc9`, hover `#3e9dd6`;
- title `#f2f4f8`, body `#d8dbe4`, secondary text `#9ca0af`, hint `#707784`;
- radii 6/10/16/20px;
- restrained card and modal shadows;
- Inter/system body and tabular numeric treatment;
- `cubic-bezier(0.4, 0, 0.2, 1)` motion with complete reduced-motion fallback;
- 760px primary mobile breakpoint, plus content-specific grid breakpoints.

## Adapted semantic states

The existing access semantics are immutable:

- Active: solid green.
- Partial: dashed blue with reduced granularity and no paywall implication.
- Locked: dotted amber; amber/gold remains exclusive to paid content; labels stay readable and only values are veiled.
- Absent: ghosted gray.
- Premium: the same dark family with slightly higher contrast, not a separate product.

State borders, badges, progress bars, legends, and gated values use the same visual grammar across every route.

## Shared component boundaries

- `BaseLayout`: document metadata, skip link, shell, navigation, state legend, footer.
- `SiteNavigation`: sticky two-level product header with active document state and mobile horizontal navigation.
- `PageHeader`: compact simulator-style hero with kicker, title, description, and document status.
- `ScenarioTabs`: green selected chip and accessible scenario links.
- `Panel`: default and premium raised surfaces.
- `AccessState`: canonical state badge.
- `PremiumGate`: dark raised paid-content boundary with dotted amber interior.
- `Timeline`: responsive connected campaign steps.
- `StateLegend`: compact shared semantic key.
- Existing content sections remain source-of-truth for copy and are restyled through centralized semantic tokens plus focused page styles.

No abstraction is introduced unless at least two pages or repeated structures use it.

## Accessibility and behavior

- WCAG AA contrast is required for normal text (4.5:1) and large text/components (3:1).
- Every interactive element has a visible green focus ring and a minimum 42px target where practical.
- A skip link precedes navigation.
- Keyboard traversal follows visual order.
- Horizontal overflow is prohibited at 390px except intentionally scrollable tabs or dense tables contained in explicit scroll regions.
- No client-side JavaScript is added where semantic HTML and CSS suffice.

## Verification

Tests must fail before implementation and then cover route generation, active navigation, noindex, internal links, semantic tokens, reduced motion, skip link, shared component markers, and absence of legacy HTML mechanisms. Final verification includes Vitest, `astro check`, build, link/asset audit, measured contrast, desktop and 390px browser review for all routes, keyboard focus review, Pages deployment, and fresh HTTP 200 checks.
