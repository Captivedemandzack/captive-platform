# Runbook: Palette Adjacency Workflow

Use this when the client already has colors, but the palette needs to become more designed.

## Core Idea

Industry references and palette references are different jobs.

For layout, sections, conversion patterns, and some typography, study businesses in the same or adjacent industry.

For color, start from the client's existing brand colors and find better-designed palettes with similar chromatic DNA. Those references can come from any industry if the palette is relevant.

## Workflow

1. Extract the client's current brand colors from the logo, existing site, or brief.
2. Normalize colors into roles:
   - base
   - surface
   - text
   - primary
   - accent
   - supporting accent
3. Search for sites with similar palette behavior, not necessarily similar business model.
4. Extract each candidate site's colors, fonts, and UI component treatment.
5. Compare palette distance against the client colors.
6. Rank candidates by:
   - palette adjacency
   - design quality
   - contrast/accessibility
   - premium fit
   - usefulness for web UI
7. Synthesize improved tokens for the client.

## Tools

### Best Automated Stack

- Brandfetch Brand API: useful for brand colors, logos, fonts, and official brand assets by domain.
- Firecrawl `branding` format: useful for webpage-level colors, fonts, typography, spacing, UI components, and visual personality.
- Playwright: useful for screenshots and visual verification.
- Webzooo: useful manually because it lets you search website inspiration by color or hex.

### Free Manual Stack

- Client logo screenshot.
- ColorZilla or browser eyedropper.
- Webzooo color search.
- Our Playwright screenshot hunter.
- Manual curation into `agency/refs/brand-hacks.md`.

## Important Rule

Do not force the palette to come from the client's industry.

For example, a premium black/gold/cream clinic site may borrow color logic from:

- luxury hospitality
- private aviation
- architecture studios
- premium wellness
- fashion
- financial advisory
- high-end skincare

The color reference only needs to solve the palette problem.

## Output

Save the final direction into:

```txt
agency/refs/palette-adjacent-brands.md
agency/refs/brand-hack-synthesis.md
agency/refs/design-variables.css
```

