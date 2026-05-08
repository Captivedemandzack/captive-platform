# The Captive Demand Operating System
### An end-to-end agentic web design & development playbook for Zachary Creasy and the Shore Capital portfolio rollout

---

## TL;DR

- **Build one Turborepo "captive-starter" monorepo on Next.js 16 + Tailwind v4 + shadcn/ui, deploy on Vercel, drive with Cursor + Claude Code sub-agents, and theme each Shore portco via CSS-variable design tokens.** This single decision compounds across BioDesign and the next 49 builds. Anything that doesn't fit this skeleton (CMS choice, content editing tool, image pipeline) plugs into it as a module — never the other way around.
- **For BioDesign specifically: ship a unified `biodesignclinic.com` on Next.js 16 with file-based MDX content (no headless CMS yet), a complete 301 redirect map from `biodesignmen.com`/`biodesignwomen.com`, programmatic city × peptide landing pages, MedicalClinic + Physician + FAQ JSON-LD on every page, and a Podium webhook handler that preserves the existing lead flow.** Total elapsed time: 8 weeks. SiteEdit goes in Phase 2 after launch, not before — don't block the migration on a tool you're still building.
- **Replace the manual 11-step intake-to-launch process with a six-stage agentic pipeline** (Intake → Audit → Brief → Build → Review → Launch), each stage backed by a named Claude Code sub-agent and a deterministic file artifact in `/brief`, `/audit`, `/refs`, `/specs`. This is the primitive that lets one operator credibly run 20–50 builds/month within 12 months — not "more AI," but a system where each AI call has a tightly scoped prompt and writes to a known location.

---

## Key Findings

1. **The "starter template + Turborepo" debate has a clear answer for an agency at this volume: you need both, layered.** A single private monorepo (`captive-platform`) hosts shared packages (`@cd/ui`, `@cd/tokens`, `@cd/seo`, `@cd/tracking`, `@cd/siteedit`) plus a `templates/portco-marketing` app that gets copied into a new repo per client. Turborepo gives you remote caching across packages; per-client repos give you blast-radius isolation, simpler client handoff, and clean billing per Vercel project. Mixing all 50 sites into apps inside one Turborepo will eventually break — Vercel monorepo limits, build minutes, and credential leakage all compound at scale.

2. **Cursor 2.x + Claude Code in a hybrid configuration is the right harness.** Use Cursor for foreground design-in-code work and the heavy lifting on staging links. Use Claude Code (CLI) for sub-agent orchestration — site audits, content generation, redirect map generation, schema extraction — because its sub-agent architecture (separate context windows, returns summary only) is materially better than Cursor background agents for parallelizable, well-scoped work. Cursor background agents are real but expensive (~$4–$5/run, MAX-mode only) and worth reserving for long refactors, not for the 30+ small parallel jobs each project generates.

3. **The View Transitions API is now the right default for page and section transitions in 2026; Framer Motion is the right default for in-component motion (hover, scroll-reveal, layout shifts).** Don't pick one — use the native API for navigations and layered/expanded sections (zero JS, no bundle cost), and Motion (formerly Framer Motion) only where you need interruptible, gesture-driven, or shared-element animations. This decision alone shaves ~30–50KB from every portco bundle.

4. **For BioDesign and 90% of Shore portcos, file-based MDX content is correct — not a headless CMS.** Sanity and Payload are both excellent, but for a 39-page medical clinic site that will get edited 3–8 times a month, the right answer is MDX in `/content` + SiteEdit for inline marketer edits + Git for versioning. A CMS becomes correct when (a) the client has a marketing team editing weekly, (b) there are >5 contributors, or (c) there's a content-publishing cadence (a blog or news section). Apply Payload CMS — self-hosted alongside the Next.js app — when you cross that threshold. Skip Sanity for portfolio work; the per-seat pricing scales badly across 50 sites.

5. **LegitScript suspension changes what you ship, not just what you say.** No shirtless imagery, no bodybuilding/performance-enhancement framing, no claim language ("cure," "guaranteed," "anti-aging" tied to disease), and BPC-157 / Thymosin Beta-4 specifically are on the FDA dangerous-substances list and need extra editorial review. Build a `legitscript.mdc` Cursor rule that runs on every content edit and flags violations. The reapplication window (~6 weeks) is also a constraint on launch — you don't want to relaunch with non-compliant content the day before re-review.

---

## Details

### 1) File system and project structure for 20–50 sites/month

**The recommendation: one `captive-platform` Turborepo for shared infrastructure + a `portco-marketing` template that's cloned per client into its own repo.**

Why not one mega-monorepo with 50 apps: Vercel's per-project build budgets, cleaner client handoff, environment-variable isolation, and the ability to give a client GitHub access to *their* repo without exposing the platform. Why not 50 standalone clones: shared design system updates would require 50 PRs.

**`captive-platform` (private, Captive Demand-owned):**

```
captive-platform/
├── apps/
│   ├── docs/                    # Internal Next.js docs site for the system
│   └── playground/              # Where you preview design-system components
├── packages/
│   ├── ui/                      # @cd/ui — shadcn-based primitives + blocks
│   │   ├── components/          # atoms: button, input, badge
│   │   ├── blocks/              # molecules: hero, trust-bar, faq, location-map
│   │   └── patterns/            # full-page patterns: medspa-home, clinic-locations
│   ├── tokens/                  # @cd/tokens — CSS variable tokens (default + presets)
│   ├── seo/                     # @cd/seo — generateMetadata, JSON-LD generators, OG image factory
│   ├── tracking/                # @cd/tracking — GA4, GTM, conversion event helpers
│   ├── forms/                   # @cd/forms — RHF + Zod + Resend webhook router
│   ├── siteedit/                # @cd/siteedit — your inline editor (markup conventions)
│   └── tsconfig/, eslint-config/
├── templates/
│   └── portco-marketing/        # The skeleton you clone for new clients
├── turbo.json
├── pnpm-workspace.yaml
└── .cursor/rules/               # Captive Demand-wide Cursor rules
```

**Per-client repo (e.g., `biodesign-clinic`):**

```
biodesign-clinic/
├── app/
│   ├── (marketing)/             # Public-facing routes (Men's, Women's, locations)
│   │   ├── page.tsx             # Home (split: Men's | Women's hero choose-your-path)
│   │   ├── men/
│   │   ├── women/
│   │   ├── locations/[city]/
│   │   ├── peptides/[slug]/
│   │   ├── services/[slug]/
│   │   └── [service]/[city]/    # Programmatic SEO: testosterone/tampa, etc.
│   ├── api/
│   │   ├── lead/route.ts        # Form submission → Podium webhook
│   │   └── webhook/podium/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── opengraph-image.tsx
│   └── layout.tsx
├── content/                     # MDX content (peptides, services, policies)
│   ├── peptides/
│   ├── services/
│   ├── locations/
│   └── policies/
├── components/                  # Project-specific components (rare — most live in @cd/ui)
├── lib/
│   ├── tokens.ts                # Imports @cd/tokens, overrides BioDesign brand
│   └── mdx.ts                   # MDX loader/renderer
├── public/
│   └── images/                  # Composed final images (Lummi → Gemini → here)
├── brief/                       # Intake-form output, dropped here at project kickoff
├── audit/                       # Site audit output (Lighthouse, GSC, GA4 export)
├── refs/                        # Reference site analysis (Firecrawl branding extracts)
├── specs/                       # Spec Kit specs per page/feature
├── redirects.json               # Redirect map from biodesignmen.com + biodesignwomen.com
├── .cursor/rules/
│   ├── project.mdc              # BioDesign-specific rules
│   ├── legitscript.mdc          # Compliance constraints
│   └── voice-and-tone.mdc       # Jimmy's editorial voice
├── AGENTS.md                    # Single source of truth for what agents may do
└── CLAUDE.md                    # Sub-agent definitions and workflows
```

**Branching:** `main` is what's live. `staging` is what's on the staging URL. Feature branches per phase (`phase-1-foundation`, `phase-2-locations`, `phase-3-peptides`). Cursor background agents always work on a separate branch and PR back. Don't get cute with Git Flow — for solo + AI work, trunk-based with short-lived branches is faster.

**When does a new client get a new repo vs. a folder?** New repo every time. Always. The five minutes saved by using a folder costs you days when you need to revoke access, transfer ownership, or hand off the codebase.

---

### 2) Agentic orchestration: Cursor + Claude Code + sub-agents

**The harness:** Cursor 2.x as your primary IDE (Plan Mode by default — Shift+Tab into it before any non-trivial change), Claude Code (CLI) as your sub-agent orchestrator running in a separate terminal, and MCP servers for tool access. **Don't try to do everything in Cursor** — Claude Code's sub-agent model with separate context windows is materially better for the parallel scoped work that fills your day (audits, content drafts, redirect generation, QA reports).

**Sub-agents to define in `.claude/agents/`** (these are Markdown files with YAML frontmatter):

- `audit-analyst` (Read, Grep, WebFetch, MCP: firecrawl, pagespeed) — runs the full audit pipeline against a URL, returns a structured Markdown report
- `reference-hunter` (WebFetch, MCP: firecrawl) — given a vertical, returns 5 strong reference URLs with extracted color palettes, typography, and section patterns (Firecrawl's `branding` format does this in one call)
- `copy-writer` (Read, Write) — drafts conversion-focused copy from the brief; system prompt forbids "AI slop" patterns ("unlock," "elevate your," "in today's fast-paced," "comprehensive solutions")
- `schema-generator` (Read, Write) — emits LocalBusiness/MedicalClinic/Physician/FAQ JSON-LD per page from a YAML data file
- `redirect-mapper` (Read, Bash) — given an old sitemap.xml and a new sitemap, generates `redirects.json` and `next.config.ts` redirect entries
- `qa-reviewer` (Read, Grep, MCP: chrome-devtools, axe-core) — runs accessibility, Lighthouse, link checks; returns prioritized issue list
- `legitscript-reviewer` (Read, Grep) — scans content for non-compliant claims, imagery references, and peptide content flagged on FDA lists

These run in separate context windows. The orchestrator (you, in Cursor) stitches their outputs into the build.

**MCP servers worth wiring up (recommended order of installation):**

1. **`next-devtools-mcp`** — runtime errors, route inspection, build errors. Free, official, install per-project: `{"mcpServers": {"next-devtools": {"command": "npx", "args": ["-y", "next-devtools-mcp@latest"]}}}` in `.mcp.json`.
2. **`firecrawl-mcp`** — site crawling, branding extraction, competitor research. Paid (~$20/mo for the volume you'll need), but the `branding` format alone justifies it because it returns colors, typography, spacing, and UI components from any URL in one call.
3. **`chrome-devtools-mcp`** — Lighthouse + performance traces in-editor. Free.
4. **GitHub MCP** — issue/PR/branch management.
5. **Vercel MCP** — deployment status, env vars, project listing.
6. **Sentry MCP** (after launch) — error and issue retrieval.
7. **GA4 + GSC** — via `google-analytics-mcp` (community) for monthly reporting agents.

Skip Linear/Notion MCPs initially. They're useful at scale but add noise solo. Use a single Notion database (or Airtable — see §10) as the index of truth and let the agents write status into it via the Notion MCP later.

**Cursor rules architecture (`.cursor/rules/*.mdc`):** Five files, each scoped, total under 2,000 tokens of "alwaysApply" content:

- `core.mdc` (alwaysApply: true) — coding standards, "never use try-catch as flow control," "TypeScript strict," "use server components by default, mark client with `'use client'`"
- `framework.mdc` (globs: `**/*.{ts,tsx}`) — Next.js 16 App Router conventions, server actions patterns, generateMetadata, sitemap.ts
- `design-system.mdc` (globs: `components/**`, `app/**`) — only use `@cd/ui` primitives, never raw Tailwind colors (always tokens), button hierarchy, risk-reversal under primary CTAs
- `seo-tracking.mdc` (globs: `app/**`, `lib/seo/**`) — every page exports generateMetadata, every entity gets JSON-LD, every CTA fires a GA4 event
- `legitscript.mdc` (globs: `content/**`, `app/**`) — banned phrases, banned imagery descriptors, peptide content disclaimer requirement

**Spec-driven development: adopt GitHub Spec Kit, not BMAD.** BMAD is for teams running a simulated agile process; Spec Kit is closer to "here's a constitution, here's a spec, generate code." For a solo operator running 20–50 builds, Spec Kit's `/constitution → /specify → /plan → /tasks → /implement` flow is exactly the level of structure you need without becoming process for its own sake. Every non-trivial feature gets a spec in `/specs/<feature>.md` before code; AI implementation is generated against the spec, not against a prompt.

**Plan Mode discipline:** never start a multi-file change in Cursor without Plan Mode. Plans are saved to `.cursor/plans/` automatically — these become your project memory. When you resume work after a week, reading the plan is faster than reading the code.

---

### 3) Intake and audit automation

**Intake form: Tally, served from `intake.captivedemand.com`.** It's free, has unlimited responses, native MCP support (so an agent can manage forms), Stripe payments built in if you ever take deposits, and the document-style editor takes 10 minutes to build a 30-question intake. Typeform is prettier and not worth $50/month at this scale. Don't build a custom form on captivedemand.com until you're at 10+ intakes/month — Tally → Zapier → GitHub issue gets you 90% of the value with zero maintenance.

**Intake → project metadata flow:**

1. Tally form submission triggers a Zapier (or n8n self-hosted) webhook
2. Webhook creates a new GitHub repo from `templates/portco-marketing`
3. Form responses are written to `/brief/intake.md` (Markdown, structured) and `/brief/intake.json` (machine-readable)
4. Cursor opens the repo; the orchestrator agent reads `/brief/intake.md` to begin work

The `/brief` folder becomes the durable context. Markdown for AI readability, JSON for structured fields the build needs (brand colors, fonts, primary CTA copy).

**Automated site audit pipeline** (run once per project at kickoff, output to `/audit/`):

| Layer | Tool | Output |
|---|---|---|
| Performance | PageSpeed Insights API (Lighthouse 13) | `audit/lighthouse.json` |
| Crawl + content | Firecrawl `/crawl` + `/branding` | `audit/crawl.json`, `audit/branding.json` |
| Accessibility | axe-core via Playwright | `audit/a11y.md` |
| SEO | Sitemap + robots check + JSON-LD audit (custom script) | `audit/seo.md` |
| Tracking | GA4 + GSC API pulls (last 90 days) | `audit/analytics.md` |
| Schema | Schema.org validator API | `audit/schema.md` |
| Broken links | `linkinator` CLI | `audit/links.json` |

Wrap this in a single bash script (`scripts/run-audit.sh`) that takes a URL and writes everything to `/audit/`. Then have the `audit-analyst` sub-agent synthesize all of those files into `/audit/SUMMARY.md` — a 1-page client-presentable document with the top 10 findings, severity, and the remediation each maps to in your build.

**Skip Screaming Frog and Sitebulb** for now. They're great desktop tools, but Firecrawl's crawl + your own Lighthouse + axe-core pipeline gets you 80% of the value and is fully agentic — no human clicking through a desktop UI.

The audit document doubles as the strategy-call deck. Don't make a separate slide deck.

---

### 4) Reference gathering and brand-hacking workflow

**The single most valuable upgrade to your manual process: Firecrawl's `/scrape` with the `branding` format.**

```bash
firecrawl scrape https://hims.com --formats branding
```

returns a structured JSON with logo URL, color palette (hex), font families, spacing scale, and UI component styles. One API call replaces an hour of manual color-picking and DevTools archaeology.

**The reference workflow, codified:**

1. `reference-hunter` sub-agent receives "vertical: men's longevity clinic, premium positioning, telehealth-friendly"
2. Returns 5 URLs with one-line rationale each (Hims, Hone Health, Maximus, Marek Health, Eden — adjust per vertical)
3. For each URL: Firecrawl `/scrape` with `["branding", "markdown", "screenshot"]` formats
4. Output written to `/refs/<domain>/branding.json`, `/refs/<domain>/page.md`, `/refs/<domain>/screenshot.png`
5. The orchestrator (you, in Cursor) reviews; then prompts the design-system agent: "Synthesize a brand token preset from these 5 refs that fits the client brief. Output to `lib/tokens.ts`."

**Internal pattern library: a private Next.js gallery at `gallery.captivedemand.com`** that pulls from your own monorepo's `packages/ui/blocks` directory. Don't use Notion (search is bad), don't use Sanity (overkill for internal use). The gallery has filters (vertical, section type, density, palette). When you ship a new block on a project, you tag it and PR it back into `@cd/ui/blocks` so it's available next time.

**Color and typography extraction:** Firecrawl's branding format covers it. Realtimecolors and Coolors are useful for human-eye palette refinement after the agent gives you a starting point. Fontshare is your default font CDN — variable fonts, real typographic depth, no pricing/licensing friction. Skip Adobe Fonts (per-project licensing creates downstream issues at portfolio scale).

**Brand-hack agent prompt template** (lives at `.claude/agents/reference-hunter.md`):

> Given the client brief at /brief/intake.md and the 5 reference scrapes in /refs/, identify:
> 1. The 3 layout patterns that consistently work in this vertical (e.g., "split men's/women's hero with separate CTA stacks")
> 2. A token preset (palette, type scale, spacing) that fits the brief's positioning
> 3. The trust-cue density (logos, ratings, certifications) typical for this vertical
> 4. The peptide/service depth-page pattern when applicable
> Output as `/refs/SYNTHESIS.md` with concrete component-level recommendations.

---

### 5) Image and content production pipeline

**Lummi → Gemini Nano Banana Pro → composed in code.** Codify the chain:

1. `image-director` agent reads the page brief and outputs an `images.yml` listing every image needed: hero, secondary, supporting, peptide cards, location photos, etc., each with role, dimensions, mood, subject.
2. For each image, search Lummi first (free, royalty-free, AI-stock; fast). If a Lummi result fits, save URL to `images.yml`.
3. For images Lummi can't satisfy (location-specific, peptide-specific custom illustration, brand-customized variants), generate via Gemini 3 Pro Image (`gemini-3-pro-image-preview`, aka Nano Banana Pro). This model has 4K output, accurate text rendering, and consistent character/subject across edits — critical for a "same model wearing scrubs in 4 locations" type of need.
4. Run images through Sharp for next/image-friendly sizing in `scripts/optimize-images.ts`.
5. Reference in components via `next/image` with proper `sizes` prop.

**Visual cohesion across a site:** the trick is to fix lighting, color grade, and perspective in the *prompt*, not after generation. Maintain a `image-style-guide.md` in `/brief/` that all image prompts reference: "cool clinical lighting, slight desaturation, eye-level perspective, shallow depth of field." Gemini 3 Pro Image follows complex prompts well; you'll get cohesive output if you're disciplined about the style guide.

**Wire Gemini into the build via a Cursor MCP tool, not a custom agent.** A simple MCP server wrapping `@google/genai` means the agent can generate images directly into `/public/images/` while writing components. There are community Gemini MCP servers; for production, build a thin internal one (50 lines of TS) so you control rate limiting and watermarking handling (SynthID is added to all Gemini-generated images — disclose this in your AI policy).

**Content generation for SEO depth pages without slop:**

The recommendation is **Cursor Composer + Claude Sonnet 4.x against MDX templates**, not Surfer/Frase/Clearscope. Those tools optimize for keyword density and SERP scoring, but they push toward formulaic, fluff-heavy content that does worse in 2026's AI-overview-driven SERPs than tight, expert-tone prose. Your competitive moat is Jimmy's medical expertise + your editorial discipline, not a topical-coverage score.

The production pattern for the BioDesign peptide pages (Jimmy's "thin intro + deep dive"):

- MDX file `/content/peptides/<slug>.mdx` with frontmatter (name, schedule, mechanisms, common protocols, contraindications, pricing) and two body sections: `<ThinIntro>` and `<DeepDive>`
- Page component renders ThinIntro by default, DeepDive behind a "Want the science?" expand
- Content drafted by `copy-writer` sub-agent against this template, then editorially reviewed by Jimmy on the staging URL via SiteEdit (or BugHerd in the interim)
- `legitscript-reviewer` runs on every PR that touches `/content/peptides/`; blocks merge if banned phrases found

**The no-AI-slop guardrails (codify as `.cursor/rules/voice-and-tone.mdc`):**

- Banned: "unlock," "elevate," "harness the power of," "in today's fast-paced," "cutting-edge solutions," "comprehensive," "streamline," "seamlessly," "tapestry," "navigate the landscape"
- Required: every claim has a citation or is reframed as a question; every CTA has risk-reversal text below it; no sentence over 25 words; vary sentence length (rhythm)
- Voice anchor: write like a confident specialist talking to an interested patient, not like a marketing agency

**For LegitScript-regulated content specifically:** every peptide page needs a "research use" or FDA-approval disclaimer where applicable. BPC-157 and Thymosin Beta-4 fragment are on the FDA dangerous-substances list — pages mentioning them need extra editorial care, no efficacy claims, and ideally a redirect to a consultation CTA rather than a product description.

---

### 6) Design system and component library

**Foundation: shadcn/ui (registry: `new-york`) + Tailwind v4 + Radix. Not MagicUI, not Aceternity, not Tailark.** Those libraries optimize for visual flash; they don't compose well into a token-based design system you'll theme across 50 sites. shadcn copies code into your repo (you own it), uses CVA for variants, and Tailwind v4's `@theme` directive is purpose-built for the multi-brand pattern you need.

**Token strategy:** Tailwind v4 with CSS variables. Default tokens live in `@cd/tokens` (`packages/tokens/src/default.css`). Each client gets a brand override file that imports defaults and overrides:

```css
/* lib/tokens.ts (exported as a CSS module) */
@import "@cd/tokens/default.css";

:root {
  --color-primary: oklch(0.55 0.18 250);  /* BioDesign blue */
  --color-primary-foreground: oklch(0.98 0 0);
  --color-accent: oklch(0.78 0.14 60);    /* warm gold for women's section */
  --font-sans: "Inter Variable";
  --font-display: "Fraunces Variable";
  --radius-base: 0.5rem;
}

[data-section="women"] {
  --color-primary: oklch(0.65 0.16 350);  /* Switch palette inside women's pages */
}
```

That last block — the section-level override — is how you handle BioDesign's men's/women's split without two separate sites or two separate component libraries.

**Components to ship in every portco starter** (`packages/ui/blocks/`):

- `<Hero />` (variants: split, full-bleed, video-bg, location-aware)
- `<TrustBar />` (logos, ratings, certifications, "as seen in")
- `<FeatureGrid />` (3-up, 4-up, alternating image/copy)
- `<Testimonial />` (single, carousel, video)
- `<LocationMap />` (Mapbox-based, multi-location with filtering)
- `<ServiceCard />` and `<PeptideCard />` (variants for grid and detail)
- `<PricingCard />` (with risk-reversal text slot)
- `<FAQ />` (accordion, schema-injected automatically)
- `<CTA />` (with required `riskReversal` prop — the system enforces it)
- `<StickyNav />`, `<Footer />`, `<Modal />`, `<ContactForm />`, `<LocationFinder />`

Every block ships with: a TypeScript prop interface, three variants minimum, a Storybook story (no, see below), a JSON-LD generator if appropriate, and at least one a11y test.

**Component documentation: skip Storybook. Use a private Next.js docs site** (`apps/docs` in the platform monorepo) that imports the components and renders them with editable props via a controls panel built with `react-hook-form`. Storybook is heavy (build minutes, dependency churn) and solo you won't keep stories up to date. A simple Next.js gallery does the job and is dogfooding your own stack.

**Animation strategy:** View Transitions API for navigations and section morphs (zero bundle, native, 2026-baseline). Framer Motion (now "Motion") for in-component motion, hover gestures, scroll-revealed elements, layout animations. CSS `@property` + scroll-driven animations for parallax and progress effects. **Default to "no motion" until you have a specific reason** — a fast site with restrained motion converts better than a site with a Lottie on every section.

---

### 7) SEO and tracking instrumentation (baked into the build)

**`@cd/seo` package exports:**

```ts
// All consumed by app/layout.tsx and per-page generateMetadata
export { generateMetadata } from "./metadata";
export { OGImage } from "./og";  // built on next/og
export { JsonLd } from "./jsonld";  // typed schema generators
export { sitemap, robots } from "./files";
```

**JSON-LD library** (`@cd/seo/jsonld`) — typed generators for: `Organization`, `LocalBusiness`, `MedicalBusiness`, `MedicalClinic`, `MedicalProcedure`, `Physician`, `Person`, `Article`, `BreadcrumbList`, `FAQPage`, `Service`. Each generator takes a typed input and emits a valid JSON-LD `<script>` element. The schema-generator sub-agent reads page data and calls these.

**For BioDesign specifically:** the homepage gets `MedicalClinic` (parent) with `subOrganization` references to each of the 4 location pages. Each `app/locations/[city]/page.tsx` gets its own `MedicalClinic` with a unique `address`, `geo`, `parentOrganization` back-link, and `physician` listings. Each peptide page gets `MedicalProcedure` (or `Drug` for FDA-approved compounds). FAQs get `FAQPage`. Use schema.org's nested `@id` references to build a clean knowledge graph.

**Redirect strategy** (`next.config.ts`):

```ts
// Generated by redirect-mapper agent from /redirects.json
import redirects from "./redirects.json";

export default {
  async redirects() {
    return redirects.map(r => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
  },
};
```

Maintain `redirects.json` as the single source of truth. For BioDesign, this file has 60+ entries: `biodesignmen.com/*` → `biodesignclinic.com/men/*`, `biodesignwomen.com/*` → `biodesignclinic.com/women/*`, plus per-page mappings for the 39 existing pages. The agent generates the initial map by diffing the old sitemap against the new; you review and approve.

**Tracking template (lives in `@cd/tracking`):**

- GA4 + GTM bootstrap via `@next/third-parties/google`
- A `<Track>` HOC that fires `lead_submit`, `cta_click`, `peptide_view`, `location_view` automatically
- HubSpot Forms wrapper that pipes both GA4 and HubSpot
- Podium webhook handler (server action at `app/api/lead/route.ts`) that POSTs form data to Podium's webhook URL, triggering the existing email→SMS→scheduler→EMR flow without changing the lead path

**Performance defaults baked in:**

- `next/image` with explicit `sizes` props (lint rule enforces it)
- `next/font` with subsetting; Fontshare via `next/font/local`
- Edge runtime for marketing pages (faster TTFB, lower cost on Vercel Fluid Compute)
- ISR with `revalidate: 3600` for content pages, full SSG for marketing pages (`generateStaticParams` returns all peptide and city slugs at build time)
- Route-level `export const dynamic = "force-static"` for everything that doesn't need request-time data

**Programmatic city × service landing pages (BioDesign specific):**

```ts
// app/[service]/[city]/page.tsx
export async function generateStaticParams() {
  const services = await getServices();        // testosterone, peptide-therapy, weight-loss, hormone-replacement
  const cities = await getCities();             // tampa, orlando, melbourne, lake-mary
  return services.flatMap(s =>
    cities.map(c => ({ service: s.slug, city: c.slug }))
  );
  // Generates 16 pages at build time; each gets unique content, schema, OG image
}
```

Each generated page gets unique copy (composed from a template + city-specific data + service-specific data — not duplicate content), unique JSON-LD, a unique OG image (via `next/og`), and unique testimonials filtered to that city. This is the right pattern for medspa/clinic SEO at scale; it's what Hims and Hone Health do.

---

### 8) Client review and feedback loops

**Pick BugHerd. Not Pastel, not Userback, not Marker.io, not custom.** BugHerd's no-login client experience, point-click annotations, automatic browser/OS metadata, Kanban task board, and Trello/ClickUp/Linear integrations make it the lowest-friction option for non-technical clients (Jimmy, Ian, Lacie). $33/month for 5 members covers your whole portfolio. Custom-built feedback in SiteEdit can come later — it's a 6-month build and BugHerd is $33/month.

**Feedback → Cursor task list pipeline:**

1. Client leaves point-click feedback on staging URL via BugHerd
2. BugHerd webhook creates a GitHub issue with screenshot, URL, viewport, console logs
3. A Claude Code sub-agent (`feedback-triager`) runs on a cron (every 4 hours), reads new issues, and writes `/feedback/v<n>.md` summarizing all items grouped by severity
4. You read the summary, push back where appropriate (codified creative direction is a feature — see below), and prompt the orchestrator: "Implement items 1–7 from `/feedback/v2.md`"

**Versioning: numbered drafts, sign-off in writing, never verbal.**

- `staging.biodesignclinic.com/v1` — 2-page mockup
- `staging.biodesignclinic.com/v2` — full first draft
- `staging.biodesignclinic.com/v3` — final draft
- Each version requires a Tally form sign-off ("approve to proceed to next phase") before work continues

**When to push back vs. accept:** codify it. Push back when feedback (a) violates conversion-focused hierarchy (client wants to demote primary CTA), (b) violates LegitScript compliance, (c) violates accessibility (contrast, focus states), or (d) introduces visual chaos (more colors than the token preset allows). Accept everything else. When you push back, do it once, in writing, with a one-paragraph rationale. Then accept the client's call.

---

### 9) Deployment, handoff, and post-launch

**Vercel, not Netlify.** Reasons specific to your situation:

- You're committed to Next.js. Vercel's edge runtime, Fluid Compute, ISR, and Image Optimization are first-class on Next.js; Netlify gets to feature parity but always lags on experimental features.
- BioDesign and SiteEdit will benefit from Vercel's `next/og` and Edge Functions.
- At 50 sites, Vercel Pro at $20/seat + per-project usage is more predictable than Netlify's credit system since the September 2025 pricing overhaul.
- Vercel MCP exists; Netlify's is weaker.

**Per-site cost estimate (Vercel Pro, conservative):** Pro plan $20/mo flat for the seat, $0.40 per 1M function invocations, $0.40/GB bandwidth after the included 1TB. For a typical Shore portco at 50K visitors/month: ~$2–$5/site/month in usage. Build into your monthly maintenance retainer; charge $50–100/month/site to clients.

**Domain transfer / DNS cutover playbook (BioDesign and every migration):**

1. **T-7 days:** Reduce TTL on `biodesignmen.com` and `biodesignwomen.com` to 300s
2. **T-3 days:** Final QA pass on staging; Lighthouse green; redirect map verified end-to-end with `linkinator`
3. **T-1 day:** Schedule cutover for low-traffic window (Tuesday 2am ET ≈ lowest medspa traffic)
4. **T-0 (cutover):** Update Namecheap A/CNAME records to Vercel; update wellness site redirects (the parallel-running `biodesignwellness.com` stays live untouched — owned by prior owners)
5. **T+0 → T+24h:** Monitor Sentry, Vercel logs, GSC; submit new sitemap to GSC; verify 301s working with `curl -I`
6. **T+30 days:** Compare GA4 organic traffic vs. baseline; if down >15%, root cause investigation

**Post-launch monitoring (per site):**

- **Sentry** — error tracking + uptime monitor (1 free per project, $1/extra). $26/month/team plan covers 50 projects.
- **Vercel Analytics** — Core Web Vitals from real users
- **Google Search Console** — indexing, crawl errors, search performance
- A monthly `monitoring-agent` sub-agent compiles a 1-page report per site from Sentry + Vercel + GSC + GA4 and posts to a Slack channel

**Maintenance workflow at 50 sites:** triage issues into the right repo via labels; small changes (copy tweaks, image swaps) are 15-minute Cursor tasks; component-level changes flow through `@cd/ui` PRs that propagate. Bigger asks become billable change orders. Use a single Linear workspace with one project per portco to keep visibility.

**Environment management: Doppler.** Recommendation over Infisical and 1Password specifically because: Doppler is the lowest-friction option ($0–$15/user/month), has the cleanest CLI (`doppler run -- pnpm dev`), syncs natively to Vercel (no manual env var copying when you onboard a new project), and supports environment branching (dev/preview/prod) without you thinking about it. Infisical is great if you ever need self-hosted; you don't, today. 1Password CLI is for human credentials, not application secrets.

---

### 10) Build vs. buy decisions

**SiteEdit: keep building it. But ship BioDesign without it.** SiteEdit is your moat — proprietary inline editing for marketers on custom builds is genuinely differentiated (Builder.io and Plasmic are close but heavyweight). For BioDesign specifically, ship MDX content first, integrate SiteEdit in Phase 2 (60 days post-launch). Don't gate the migration on a tool you're still completing.

**CMS for portfolio scale: file-based MDX as default; Payload self-hosted as the upgrade path.** Concretely:

- **Tier 1 (default):** MDX in `/content/`. ~80% of Shore portcos will live here forever. Marketers edit via SiteEdit; structural changes happen in PRs.
- **Tier 2 (when client has a marketing team editing weekly):** Payload CMS, self-hosted in the same Next.js app, Postgres on Neon or Supabase. Payload's local API removes the network hop and keeps performance. MIT-licensed, no per-seat pricing, full data ownership.
- **Skip Sanity** — per-seat pricing scales badly across 50 sites and you don't need real-time collaboration.
- **Skip Strapi, Contentful, Builder.io, Hygraph, TinaCMS, Decap** — none beats Payload on the dimensions that matter to you (DX, ownership, cost, Next.js integration).

**Internal agency dashboard: one Airtable base, not Notion or a custom build.** Columns: portco name, phase, current week, blockers, GA4 trend, Lighthouse score, last deploy, primary contact, redirect-map status. A weekly cron-triggered Claude Code agent updates the data fields from GA4/Vercel/Sentry. Build a custom dashboard at month 9 if Airtable cracks; not before.

**Form/lead infrastructure: build with React Hook Form + Zod + Resend + a webhook router.** Don't use HubSpot Forms even though HubSpot is in the stack — HubSpot Forms add 100KB+ to the bundle and reduce conversion. Submit to your own API route, then fan out to HubSpot, Podium, GA4, and Slack via the webhook router pattern.

**AI infrastructure for production features inside client sites:** Anthropic API direct (Claude Sonnet 4.x) via `@ai-sdk/anthropic`. Vercel AI Gateway for routing. Don't use OpenRouter or Together for production client-facing features — direct Anthropic gives you reliability and Anthropic's model evaluation wins for 95% of marketing-site use cases.

---

### 11) BioDesign: concrete next steps

**Current state to act from:**
- WordPress 6.9.4 + Hello Elementor + Elementor Pro 4.0.1 admin secured ✓
- Namecheap registrar access secured ✓
- Awaiting Big Step Marketing handoff for GA4/GSC/GBP/GTM (chase Lacie this week)
- LegitScript suspension active (~6 weeks to reapplication)
- Spencer approved Cursor build pivot from the signed Elementor SOW; Lacie being notified

**The unified `biodesignclinic.com` IA:**

```
biodesignclinic.com/
├── /                         (Choose-your-path: Men's | Women's hero, with shared trust bar)
├── /men/
│   ├── /men/services/[slug]  (testosterone-replacement, peptide-therapy, weight-loss, hormone-optimization, performance-medicine)
│   └── /men/peptides/[slug]
├── /women/
│   ├── /women/services/[slug] (hormone-replacement, weight-loss, peptide-therapy, sexual-wellness, menopause-management)
│   └── /women/peptides/[slug]
├── /locations/
│   ├── /locations/tampa
│   ├── /locations/orlando
│   ├── /locations/melbourne
│   └── /locations/lake-mary
├── /[service]/[city]/        (Programmatic SEO: testosterone/tampa, peptide-therapy/orlando, etc. — ~20 pages)
├── /book                     (Free consultation form; primary conversion path)
├── /policies/[slug]
├── /about
└── /contact
```

**Total page count:** ~70 pages at launch (vs. current 39), driven by the city × service grid expansion Jimmy asked for.

**Podium webhook integration:**

```ts
// app/api/lead/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  const validated = LeadSchema.parse(data);

  // Fire-and-forget pattern; client gets immediate response
  await Promise.allSettled([
    podium.sendLead(validated),       // Existing Podium flow → SMS to patient → scheduler
    ga4.track("lead_submit", validated),
    hubspot.createContact(validated),
    slack.notify(`New lead: ${validated.name} (${validated.location})`),
  ]);

  return Response.json({ success: true });
}
```

This preserves the existing 9 location-based notification actions and the 6-week chaser campaign for non-converters — those run in Podium, not on the site, so the migration doesn't touch them.

**LegitScript-compliant content guidelines (codified at `.cursor/rules/legitscript.mdc`):**

- **Imagery:** No shirtless men, no bodybuilding/athletic-performance framing, no clinical "before/after injection" imagery. Use clothed lifestyle imagery, clinical-but-warm office shots, professional headshots of providers. Lummi has good options; supplement with Gemini for location-specific shots.
- **Content:** No "anti-aging" claims tied to disease prevention, no "guaranteed results," no "FDA-approved" unless the specific compound is. BPC-157 and Thymosin Beta-4 fragment pages need extra scrutiny — they're on the FDA dangerous-substances list. Reframe peptide pages as "medically supervised consultation determines candidacy" rather than "buy this peptide."
- **CTA path:** Every peptide and service page CTA is "Schedule a free consultation" — never "Order [drug]" or "Get [peptide]." This is both a compliance and a conversion choice.
- **Disclaimers:** Footer-level medical disclaimer; per-page disclaimers on peptides flagged as research-only.

**Migration plan, week-by-week, mapped to the signed SOW phases:**

| Week | SOW Phase | Deliverable |
|---|---|---|
| 1 | Discovery | Audit complete (`/audit/SUMMARY.md`); IA approved by Jimmy/Lacie; redirect map drafted |
| 2 | Discovery + Design | Brand tokens locked (`lib/tokens.ts`); reference synthesis done (`/refs/SYNTHESIS.md`); 2-page mockup live on staging |
| 3 | Design + Development | Mockup feedback incorporated; design system extended; men's home + women's home + 1 location built |
| 4 | Development | All 4 location pages; service detail templates; peptide detail templates; sitemap and JSON-LD scaffolding |
| 5 | Development | All service detail pages content; all peptide detail pages content (LegitScript-reviewed); city × service programmatic pages generated |
| 6 | Development + Testing | Forms wired to Podium webhook; GA4/GTM live; HubSpot integration; SiteEdit markup pass; full QA (Lighthouse, axe, links, schema validation) |
| 7 | Testing | Client UAT via BugHerd; final draft sign-off; redirect map executed in staging; performance hardening (target: Lighthouse 95+ on mobile) |
| 8 | Launch | TTL reduction T-7; final cutover Tuesday 2am ET; post-launch monitoring; GSC re-submission; 30-day stabilization window begins |

**Content extraction from current WP:** use a one-time Node script (`scripts/extract-wp.ts`) calling the WP REST API at `biodesignmen.com/wp-json/wp/v2/pages` to dump all 39 pages to `/content/legacy/`. The `copy-writer` agent then re-templates each into the new MDX schema. Don't try to migrate Formidable Forms entries (3,445 entries) — those are leads already worked through Podium; they're historical.

**Wellness site (biodesignwellness.com):** stays live, owned by prior owners, parallel during build. Don't try to consolidate. After launch, reach out (via Lacie/Spencer) to add a small "Looking for our medical/longevity services? Visit biodesignclinic.com" link on biodesignwellness.com to capture residual traffic.

---

### 12) Rollout strategy from BioDesign to portfolio

**The post-BioDesign extraction:**

After BioDesign launches, run a 1-week extraction sprint:

- Identify every component built for BioDesign that wasn't in `@cd/ui/blocks/` and PR them back (location-finder, peptide-card, choose-your-path-hero, etc.)
- Publish redirect-map generation script as a CLI (`@cd/cli redirect-map`)
- Document the city × service programmatic SEO pattern as a reusable template
- Codify the Podium webhook pattern as a generic lead-router that supports HubSpot, Podium, ActiveCampaign, Klaviyo, Twilio out of the box

**Templates and runbooks that must exist after BioDesign:**

- `templates/portco-marketing` — the starter app, updated with BioDesign learnings
- `runbooks/migration.md` — WordPress → Next.js, Wix → Next.js, Webflow → Next.js, Framer → Next.js
- `runbooks/launch-checklist.md` — the 47-item pre-launch list (every site goes through it)
- `runbooks/medspa-vertical.md`, `runbooks/legal-vertical.md`, etc. — vertical-specific compliance and copy patterns
- SOPs in Notion: intake handoff, audit kickoff, design review, launch, post-launch

**Quality gates (the 47-item launch checklist, abridged):**

- Lighthouse: Performance ≥90, Accessibility ≥95, SEO 100, Best Practices ≥95 on mobile
- Core Web Vitals: LCP <2.0s, INP <200ms, CLS <0.05
- axe-core: 0 violations
- Every page has unique `<title>`, `<description>`, OG image, JSON-LD
- Every form fires GA4 event + Podium/HubSpot webhook + Slack notification
- Sitemap.xml submitted to GSC; robots.txt allows crawl
- Redirect map: `linkinator` reports 0 broken links; sample 20 redirects manually verified
- Sentry installed and verified receiving events
- 404 page exists and is helpful
- Forms have honeypot or Turnstile
- Every CTA has risk-reversal text
- Mobile nav works; sticky nav works; modal close works; keyboard nav works

**When to onboard a junior:** at the point you're consistently at 8–10 builds in flight at once, or month 7 of the rollout, whichever comes first. Hire for QA/launch ops first, not design — the agentic system makes design the highest-leverage solo work. The first hire's job description: "Drive the launch checklist, run BugHerd triage, manage post-launch monitoring, own the SOP library."

**Metrics to track:**

- Time per build (target: 4 weeks from intake to launch by month 6)
- Builds shipped per month (target: 4 by month 3, 12 by month 6, 25 by month 12)
- Average revisions per build (target: <2 design revisions, <3 content revisions; trending down)
- Post-launch issue rate (target: <1 critical bug per build in first 30 days)
- Lighthouse score at launch (target: never below 90 mobile performance)
- Margin per build (target: >70% gross margin once the system is mature)

---

## Recommendations

### Day 1 (today, before BioDesign work resumes)

1. **Create `captive-platform` private GitHub repo.** Initialize Turborepo with pnpm workspaces. `npx create-turbo@latest captive-platform --package-manager pnpm`. Add `apps/docs`, `packages/ui`, `packages/tokens`, `packages/seo`, `packages/tracking`. Push.
2. **Sign up: Vercel Pro (1 seat), Tally Pro, BugHerd Standard, Sentry Team, Doppler, Firecrawl Hobby, Anthropic API.** ~$200/month total. Add a Cursor Pro Plus ($60/mo) and Claude Pro Max for Claude Code (~$200/mo) — those are your two most leveraged subscriptions.
3. **Write `AGENTS.md` and `CLAUDE.md` at the root of your platform repo.** Define the seven sub-agents listed in §2. Commit. These are now reusable across every portco repo.
4. **Set up `.cursor/rules/core.mdc`, `framework.mdc`, `design-system.mdc`, `seo-tracking.mdc`, `legitscript.mdc`** in the platform monorepo. ~1500 tokens total.
5. **Install MCP servers in Cursor:** `next-devtools-mcp`, `firecrawl-mcp`, `chrome-devtools-mcp`, GitHub, Vercel.

### Week 1

1. **Build the `templates/portco-marketing` skeleton.** Next.js 16 App Router, Tailwind v4, shadcn/ui, `@cd/tokens` imported, `@cd/seo` imported, default home + about + contact + 404 + sitemap.ts + robots.ts. Verify it deploys to Vercel.
2. **Clone the template into a new `biodesign-clinic` repo.** Add Doppler config, set up Vercel project (preview + production). Connect domain placeholder.
3. **Run the audit pipeline against `biodesignmen.com` and `biodesignwomen.com`.** Output to `/audit/` in the BioDesign repo. Synthesize via `audit-analyst` sub-agent.
4. **Send Lacie a one-page audit summary as the strategy-call deck.** Reaffirm phase 1 / 2 / 3 expectations. Get explicit GA4/GSC/GBP/GTM handoff timeline from Big Step.
5. **Run `reference-hunter` against the men's longevity vertical.** Output to `/refs/`. Lock brand tokens in `lib/tokens.ts`.

### Month 1

1. **Ship BioDesign through Week 4 of the 8-week plan** (Discovery + Design + early Development complete; locations and templates built; Lighthouse trending toward 90+).
2. **Codify the first three runbooks** as you encounter the work (migration, audit, design-review). Living documents.
3. **Set up the internal Airtable base** for portco tracking. Wire up the weekly status agent.
4. **Identify Shore portco #2** (likely Mantality Health redesign or BioDesign-adjacent). Run intake. Don't start building until BioDesign is in Week 5+ — context-switching solo destroys quality.
5. **Reflection:** at end of month 1, audit the system honestly. What sub-agent definitions are wrong? Which Cursor rules fire too often or never? Which MCP servers are net negative? Tighten.

### Benchmarks that change the recommendations

- **If BioDesign takes >10 weeks:** the bottleneck is process, not build. Slow down on portco #2 by another 30 days; double-down on runbooks.
- **If Lighthouse mobile performance ships <90:** revisit the image pipeline (likely Lummi raw assets are too large) and animation strategy (likely too much Framer Motion).
- **If you're at 5+ active builds and not yet at month 4:** hire QA/launch ops earlier. Don't try to scale further solo; output quality will degrade.
- **If two clients request the same custom feature:** PR it back into `@cd/ui/blocks/` immediately. The system gets stronger only if extraction is a habit, not an afterthought.
- **If a portco's marketing team starts editing weekly:** that's the trigger to migrate them from MDX to Payload CMS. Build the Payload integration once, on the second client to need it, not preemptively.
- **If LegitScript reapplication is denied:** content audit immediately, not just imagery. Run `legitscript-reviewer` against the entire production content. Likely culprit: claim language in service descriptions that crept past review.

---

## Caveats

- **Cursor 3 (Agents Window) and the long-running agents preview moved fast through 2025–early 2026.** The Plan Mode + Sub-agent workflow described here is current as of May 2026 but the specific keybindings and pricing of background agents will drift. Validate `Shift+Tab → Plan Mode`, `Ctrl+E → Background Agent`, and current MAX-mode pricing before committing to a workflow. Anthropic's sub-agent feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) is similarly in flux — the agent-teams pattern (shared task list) may eclipse the orchestrator-and-sub-agents pattern within 6 months.
- **Gemini 3 Pro Image (Nano Banana Pro) is a preview model** as of this writing. The model ID `gemini-3-pro-image-preview` may be renamed at GA. Build the image pipeline behind a thin wrapper so swapping models is one config change.
- **Firecrawl's `branding` format is excellent but probabilistic.** Always human-review the extracted token preset before locking it into `lib/tokens.ts`. The agent will sometimes pick up dark-mode variants or button-state colors as "primary."
- **The Vercel cost projection ($2–$5/site/month at 50K visits) holds at this writing.** Vercel's pricing evolves; the April 2026 confirmed-breach incident around environment variables also reminds you to use Doppler for secrets and mark sensitive env vars properly. Re-audit pricing every 6 months.
- **LegitScript reapplication outcomes are not predictable.** The 6-week timeline is optimistic; allow 8–12 weeks. If the reapplication is denied a second time, the entire site strategy needs to shift toward consultation-only positioning (no peptide product detail at all).
- **The 20–50 builds/month target within 12 months assumes Shore continues feeding portcos at that rate and that the Convert/Compound/Replicate model holds its phase boundaries.** If Shore changes priorities or a portco demands a non-standard build (e-commerce, app, custom platform), the system as designed handles it badly. Reserve 20% of capacity for non-standard work; don't promise the agentic system can do everything.
- **SiteEdit's PRD has assumptions** about Clerk auth and Bunny CDN that may not survive contact with multi-tenant deployment realities. Build SiteEdit against one client first (a follow-up to BioDesign), then the second; don't try to design for 50 tenants from day one.
- **The "no AI slop" guardrails are necessary but not sufficient.** Editorial review by a human (you, or eventually a part-time editor) on every published page is non-negotiable. The `legitscript-reviewer` and `voice-and-tone` rules catch the obvious failures; they don't catch a paragraph that's technically compliant but reads like a robot wrote it. Allocate 20% of build time to editorial polish.
- **None of this works without the operating discipline.** The system described above is highly leveraged but unforgiving — every shortcut (skipping a Plan Mode session, merging without `qa-reviewer` running, accepting client feedback without writing it down) compounds across 50 builds. The tools are easy. The discipline is the actual product.