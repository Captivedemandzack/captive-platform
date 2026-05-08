# Runbook: Reference Kickoff Workflow

Use this when you want to give the system a brief and generate the first design mockup packet.

## What It Does

The reference kickoff reads a structured brief and generates:

- Brand-hack synthesis.
- Starting design variables.
- Reference packets for the first two pages.
- Page mockup plans.
- Cursor-ready section prompts.

It does not scaffold a full app and does not overwrite the Captive Studio architecture.

## Command

```bash
node cd-kickoff-system/reference-kickoff.js cd-kickoff-system/brief.json .
```

## Live Internet Reference Hunt

Use this when you want the system to fetch and analyze reference sites from the internet.

```bash
node cd-kickoff-system/live-reference-hunter.js cd-kickoff-system/brief.json .
```

The live hunter generates:

```txt
agency/refs/live-reference-latest.md
agency/refs/live-hunt/<timestamp>/candidate-catalog.md
agency/refs/live-hunt/<timestamp>/candidates.json
agency/refs/live-hunt/<timestamp>/search-queries.md
agency/refs/live-hunt/<timestamp>/screenshots/
```

The screenshot pass captures:

- Full-page screenshots.
- Multiple relevant internal pages per reference site.
- Whole section screenshots where possible.
- A screenshot index mapping each PNG to site, page, URL, inferred section type, and text sample.

### Discovery Modes

Without search API keys, it uses curated seed URLs from the brief and vertical.

With one of these environment variables, it can do open-ended web discovery:

```txt
BRAVE_SEARCH_API_KEY
BING_SEARCH_API_KEY
SERPAPI_API_KEY
```

### Screenshot Mode

For automatic screenshots, install Playwright:

```bash
npm install -D playwright
npx playwright install chromium
```

If Playwright is not installed, the script writes a screenshot queue so the references can still be captured manually.

### Screenshot Limits

Use these environment variables to control the capture size:

```bash
MAX_REFERENCE_SITES=6 \
MAX_REFERENCE_PAGES_PER_SITE=4 \
MAX_SECTIONS_PER_PAGE=10 \
node cd-kickoff-system/live-reference-hunter.js cd-kickoff-system/brief.json .
```

For a quick test:

```bash
MAX_REFERENCE_SITES=2 \
MAX_REFERENCE_PAGES_PER_SITE=3 \
MAX_SECTIONS_PER_PAGE=6 \
node cd-kickoff-system/live-reference-hunter.js cd-kickoff-system/brief.json .
```

## Input

```txt
cd-kickoff-system/brief.json
```

The brief should include:

- Client name.
- Industry.
- Positioning.
- Anti-positioning.
- Locations.
- Services.
- Primary CTA.
- Compliance notes.
- Reference brands.
- Pages to build.

## Outputs

```txt
agency/refs/brand-hack-synthesis.md
agency/refs/design-variables.css
agency/refs/reference-kickoff-summary.md
agency/refs/section-packets/<page>/<section>.md
agency/specs/<page>-mockup-plan.md
.cursor/prompts/<page>-design-mockup.md
```

## How To Use The Outputs

1. Review `agency/refs/brand-hack-synthesis.md`.
2. Review `agency/refs/design-variables.css`.
3. Open `.cursor/prompts/homepage-design-mockup.md`.
4. Run one section prompt at a time.
5. After each section, inspect and refine before continuing.

## Important Boundary

The script generates reference direction and prompts. The build must still follow:

- Next.js owns design, layout, animation, and interaction.
- JSON owns editable text, images, alt text, metadata, and safe CTA fields.
- Captive Studio field wrappers are required for client-editable content.
