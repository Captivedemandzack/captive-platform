#!/usr/bin/env node
// reference-kickoff.js
// Reads a brief and generates the reference + brand-hack packet for the first two mockup pages.
//
// This is intentionally not a full project scaffolder. It prepares creative direction,
// section references, token variables, and Cursor prompts while preserving the
// Captive Studio rule: Next.js owns design; JSON owns editable content.

import fs from "node:fs/promises";
import path from "node:path";

const SECTION_LIBRARY = {
  "hero-split": {
    label: "Split Hero",
    references: [
      {
        url: "https://hims.com",
        use: "Audience-path clarity and direct-to-patient conversion flow.",
      },
      {
        url: "https://ro.co",
        use: "Medical trust density and low-friction CTA framing.",
      },
      {
        url: "https://honehealth.com",
        use: "Warm health photography and consultation-first messaging.",
      },
    ],
    pattern:
      "Two distinct audience paths in one premium first viewport. Keep the split architectural and editorial, not like a tab selector.",
    editableFields: [
      "hero.men.eyebrow",
      "hero.men.headline",
      "hero.men.subhead",
      "hero.men.image",
      "hero.men.ctaLabel",
      "hero.men.ctaHref",
      "hero.women.eyebrow",
      "hero.women.headline",
      "hero.women.subhead",
      "hero.women.image",
      "hero.women.ctaLabel",
      "hero.women.ctaHref",
    ],
  },
  "trust-bar": {
    label: "Trust Bar",
    references: [
      {
        url: "https://ro.co",
        use: "Compact medical proof points close to the hero.",
      },
      {
        url: "https://honehealth.com",
        use: "Trust cues tied directly to conversion.",
      },
      {
        url: "https://getmaple.ca",
        use: "Simple care-access proof and patient confidence markers.",
      },
    ],
    pattern:
      "Four fast-scanning proof points. Patient count, rating, clinical authority, and location count.",
    editableFields: ["trust.items[0].value", "trust.items[0].label"],
  },
  "services-grid": {
    label: "Services Grid",
    references: [
      {
        url: "https://marekhealth.com",
        use: "Specialist service taxonomy and serious medical authority.",
      },
      {
        url: "https://honehealth.com",
        use: "Plain-language service cards.",
      },
      {
        url: "https://maximustribe.com",
        use: "Men's health offer clarity, to be softened for compliance.",
      },
    ],
    pattern:
      "Fixed card grid with short descriptions. Cards explain scope, not every clinical detail.",
    editableFields: ["services.men[0].title", "services.men[0].body", "services.women[0].title", "services.women[0].body"],
  },
  "why-client": {
    label: "Why This Client",
    references: [
      {
        url: "https://marekhealth.com",
        use: "Clinical authority and protocol seriousness.",
      },
      {
        url: "https://thewell.nyc",
        use: "Refined wellness positioning without visual noise.",
      },
    ],
    pattern:
      "Three to four differentiators. Physician-led care, evidence-based protocols, personalization, and Florida access.",
    editableFields: ["why.items[0].title", "why.items[0].body"],
  },
  "how-it-works": {
    label: "How It Works",
    references: [
      {
        url: "https://hims.com",
        use: "Simple step-by-step conversion flow.",
      },
      {
        url: "https://honehealth.com",
        use: "Labs and consultation flow explained plainly.",
      },
    ],
    pattern:
      "Three steps maximum: consult, lab work, protocol. Make the process feel clinically guided and easy to start.",
    editableFields: ["process.steps[0].title", "process.steps[0].body"],
  },
  "locations-grid": {
    label: "Locations Grid",
    references: [
      {
        url: "https://www.idealimage.com",
        use: "Multi-location conversion patterns, not the aesthetic.",
      },
      {
        url: "https://honehealth.com",
        use: "Care-access clarity.",
      },
    ],
    pattern:
      "Location cards for the client markets. Make local access visible early.",
    editableFields: ["locations[0].city", "locations[0].address", "locations[0].phone", "locations[0].hours"],
  },
  testimonials: {
    label: "Testimonials",
    references: [
      {
        url: "https://honehealth.com",
        use: "Patient story placement and confidence building.",
      },
      {
        url: "https://ro.co",
        use: "Concise social proof around regulated healthcare.",
      },
    ],
    pattern:
      "Short, specific quotes with treatment context. Avoid outcome claims that need review.",
    editableFields: ["testimonials[0].quote", "testimonials[0].author", "testimonials[0].treatment"],
  },
  "final-cta": {
    label: "Final CTA",
    references: [
      {
        url: "https://ro.co",
        use: "Low-friction medical conversion.",
      },
      {
        url: "https://hims.com",
        use: "Direct action language and risk reversal.",
      },
    ],
    pattern:
      "Clear consultation CTA with risk reversal. No product-purchase language.",
    editableFields: ["cta.headline", "cta.body", "cta.buttonLabel", "cta.buttonHref"],
  },
  "location-hero": {
    label: "Location Hero",
    references: [
      {
        url: "https://www.idealimage.com/locations",
        use: "Local page conversion structure.",
      },
      {
        url: "https://www.sollishealth.com/locations",
        use: "Premium healthcare location presentation.",
      },
    ],
    pattern:
      "City-specific hero that makes location and consultation access obvious.",
    editableFields: ["hero.headline", "hero.subhead", "hero.image", "location.name"],
  },
  "services-offered": {
    label: "Services Offered",
    references: [
      {
        url: "https://honehealth.com",
        use: "Patient-friendly treatment taxonomy.",
      },
      {
        url: "https://marekhealth.com",
        use: "Protocol seriousness.",
      },
    ],
    pattern:
      "Show the services available at this location without creating duplicate-content sludge.",
    editableFields: ["services[0].title", "services[0].body"],
  },
  "meet-the-team": {
    label: "Meet The Team",
    references: [
      {
        url: "https://www.sollishealth.com",
        use: "Premium provider trust presentation.",
      },
      {
        url: "https://thewell.nyc",
        use: "Warm professional wellness credibility.",
      },
    ],
    pattern:
      "Provider credibility, not stock medical authority. Real headshots later; placeholders must stay tasteful.",
    editableFields: ["team[0].name", "team[0].role", "team[0].image"],
  },
  "location-info": {
    label: "Location Info",
    references: [
      {
        url: "https://www.idealimage.com/locations",
        use: "Address, hours, directions, and booking clarity.",
      },
    ],
    pattern:
      "Address, phone, hours, map link, and consultation CTA. Mobile tap targets matter.",
    editableFields: ["location.address", "location.phone", "location.hours", "location.mapHref"],
  },
  "testimonials-local": {
    label: "Local Testimonials",
    references: [
      {
        url: "https://ro.co",
        use: "Short, regulated social proof.",
      },
    ],
    pattern:
      "Local trust without unverifiable claims. Keep quotes conservative until real reviews are approved.",
    editableFields: ["testimonials[0].quote", "testimonials[0].author"],
  },
  cta: {
    label: "CTA",
    references: [
      {
        url: "https://honehealth.com",
        use: "Consultation-first conversion.",
      },
      {
        url: "https://ro.co",
        use: "Risk reversal and low-friction medical action.",
      },
    ],
    pattern: "Book a free consultation. Keep copy calm, direct, and medically responsible.",
    editableFields: ["cta.headline", "cta.body", "cta.buttonLabel", "cta.buttonHref"],
  },
};

const BRAND_REFERENCE_LIBRARY = {
  "Marek Health": {
    url: "https://marekhealth.com",
    lesson: "Dark editorial authority, specialist seriousness, and premium clinical posture.",
  },
  "Hone Health": {
    url: "https://honehealth.com",
    lesson: "Warm health photography, conversion structure, and patient-friendly trust cues.",
  },
  "The Well NYC": {
    url: "https://thewell.nyc",
    lesson: "Luxury wellness restraint, negative space, and serif/sans refinement.",
  },
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pageSlug(page) {
  return slugify(page.name || "page");
}

function titleCase(value) {
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cssFromTokens(tokens) {
  return `/* Generated reference variables. Move into lib/tokens.css when the Next.js app exists. */
:root {
${Object.entries(tokens)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join("\n")}
}

[data-section="women"],
.section-women {
  --color-bg: var(--color-bg-women);
  --color-surface: var(--color-surface-women);
  --color-text-primary: var(--color-text-women);
  --color-text-secondary: var(--color-text-secondary-women);
  --color-accent: var(--color-accent-women);
  --color-accent-hover: var(--color-accent-women-hover);
}
`;
}

function synthesizeTokens(brief) {
  return {
    "color-bg": "#0C0F0E",
    "color-surface": "#161A19",
    "color-surface-2": "#1E2422",
    "color-border": "#2A2F2E",
    "color-text-primary": "#F0EDE6",
    "color-text-secondary": "#9A9690",
    "color-text-muted": "#615E5A",
    "color-accent": "#C9A96E",
    "color-accent-hover": "#B8954F",
    "color-accent-muted": "#8B7355",
    "color-accent-subtle": "rgba(201, 169, 110, 0.12)",
    "color-bg-women": "#FAF8F4",
    "color-surface-women": "#F3F0EA",
    "color-text-women": "#1A1A18",
    "color-text-secondary-women": "#6B6560",
    "color-accent-women": "#9B7FA6",
    "color-accent-women-hover": "#7D6388",
    "font-display": "'Cormorant Garamond', Georgia, serif",
    "font-body": "'DM Sans', system-ui, sans-serif",
    "font-mono": "'DM Mono', monospace",
    "text-display": "clamp(3.5rem, 8vw, 7rem)",
    "text-h1": "clamp(2.5rem, 5vw, 4.5rem)",
    "text-h2": "clamp(1.75rem, 3.5vw, 3rem)",
    "text-h3": "clamp(1.25rem, 2vw, 1.75rem)",
    "text-body": "1rem",
    "text-body-lg": "1.125rem",
    "text-sm": "0.875rem",
    "leading-display": "0.98",
    "leading-heading": "1.1",
    "leading-body": "1.65",
    "tracking-label": "0.12em",
    "space-section": "clamp(5rem, 12vw, 12rem)",
    "space-section-sm": "clamp(3rem, 6vw, 6rem)",
    "space-gap": "clamp(1.5rem, 3vw, 2.5rem)",
    "container-width": "1320px",
    "container-padding": "clamp(1.25rem, 5vw, 4rem)",
    radius: "0.375rem",
    "radius-md": "0.5rem",
    "shadow-glow": "0 0 40px rgba(201, 169, 110, 0.15)",
    transition: "250ms ease",
  };
}

function renderBrandHack(brief, tokens) {
  const brandRefs = (brief.reference_brands || [])
    .map((name) => {
      const ref = BRAND_REFERENCE_LIBRARY[name] || {
        url: "",
        lesson: "Reference needs manual review.",
      };
      return `| ${name} | ${ref.url} | ${ref.lesson} |`;
    })
    .join("\n");

  return `# ${brief.client} Brand Hack Synthesis

## Positioning

${brief.positioning}

## Anti-Positioning

${brief.anti_positioning}

## Reference Brands

| Brand | URL | What To Extract |
|---|---|---|
${brandRefs}

## Synthesized Direction

The client brand should feel aligned with the positioning in the brief: specific, credible, refined, and conversion-aware.

The design should combine:

- Dark editorial authority.
- Warm health photography.
- Luxury wellness restraint.
- Strong trust density.
- Clear audience paths.

## Token Starting Point

| Token | Value |
|---|---|
${Object.entries(tokens)
  .map(([key, value]) => `| \`--${key}\` | \`${value}\` |`)
  .join("\n")}

## Human Review Notes

- Validate the palette against the real client logo.
- Confirm type choices feel premium clinical, not cosmetic wellness.
- Keep any audience-specific palette variations part of one unified brand system.
- Do not use visual language that suggests gym, supplements, bodybuilding, or unregulated products.
`;
}

function renderSectionReference(page, sectionKey) {
  const section = SECTION_LIBRARY[sectionKey] || {
    label: titleCase(sectionKey),
    references: [],
    pattern: "No library pattern yet. Add manual references.",
    editableFields: [],
  };

  return `# ${page.name} — ${section.label}

## Pattern

${section.pattern}

## References

| URL | What To Study |
|---|---|
${section.references.map((ref) => `| ${ref.url} | ${ref.use} |`).join("\n") || "| TBD | Add manual references. |"}

## Editable Fields

These fields should be exposed through JSON and wrapped with Captive Studio editable primitives.

${section.editableFields.map((field) => `- \`${field}\``).join("\n") || "- TBD"}

## Design Stays In Code

- Layout.
- Motion.
- Responsive behavior.
- Section composition.
- Visual hierarchy.
- Design tokens.
`;
}

function renderPageMockupPlan(page) {
  return `# ${page.name} Mockup Plan

## Sections

${page.sections.map((section, index) => `${index + 1}. ${titleCase(section)}`).join("\n")}

## Build Order

Build one section at a time. Do not ask the agent to build the full page in one prompt.

## Captive Studio Boundary

Editable:

- Text.
- Images.
- Alt text.
- Metadata.
- Safe CTA labels and URLs.

Not editable:

- Layout.
- Section order.
- Animation.
- Colors.
- Typography.
- Component variants.

## Section Reference Files

${page.sections.map((section) => `- \`agency/refs/section-packets/${pageSlug(page)}/${section}.md\``).join("\n")}
`;
}

function renderCursorPrompt(brief, page) {
  return `# ${page.name} Design Mockup Prompts

Run these in Cursor one at a time. Review each section before continuing.

Before each prompt, make Cursor read:

- \`AGENTS.md\`
- \`CANONICAL_ARCHITECTURE.md\`
- \`.cursor/rules/project-architecture.mdc\`
- \`.cursor/rules/captive-studio-spec.mdc\`
- Client-specific Cursor rules, if present
- \`agency/brief/intake.md\`
- \`agency/refs/brand-hack-synthesis.md\`
- \`agency/specs/${pageSlug(page).includes("homepage") ? "homepage" : "location-page"}.md\`

${page.sections
  .map((sectionKey, index) => {
    const section = SECTION_LIBRARY[sectionKey] || { label: titleCase(sectionKey), editableFields: [] };
    return `## Prompt ${index + 1} — ${section.label}

\`\`\`
Build the ${section.label} section for ${brief.client}'s ${page.name} design mockup.

Use the reference packet at:
agency/refs/section-packets/${pageSlug(page)}/${sectionKey}.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the generated tokens from agency/refs/design-variables.css as the starting point.
- Preserve any compliance rules in the client brief and Cursor rules.

Editable field starting points:
${section.editableFields.map((field) => `- ${field}`).join("\n") || "- Define fields in the page spec before building."}
\`\`\``;
  })
  .join("\n\n---\n\n")}
`;
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}

async function main() {
  const briefPath = process.argv[2] || "cd-kickoff-system/brief.json";
  const outputDir = process.argv[3] || ".";
  const rawBrief = await fs.readFile(briefPath, "utf8");
  const brief = JSON.parse(rawBrief);
  const firstTwoPages = (brief.pages_to_build || []).slice(0, 2);
  const tokens = synthesizeTokens(brief);

  await writeFile(path.join(outputDir, "agency/refs/brand-hack-synthesis.md"), renderBrandHack(brief, tokens));
  await writeFile(path.join(outputDir, "agency/refs/design-variables.css"), cssFromTokens(tokens));
  await writeFile(
    path.join(outputDir, "agency/refs/reference-kickoff-summary.md"),
    `# Reference Kickoff Summary

Brief: \`${briefPath}\`

Generated first-two-page reference packets for:

${firstTwoPages.map((page) => `- ${page.name}`).join("\n")}

Next:

1. Review \`agency/refs/brand-hack-synthesis.md\`.
2. Review \`agency/refs/design-variables.css\`.
3. Review each section packet in \`agency/refs/section-packets/\`.
4. Use the prompts in \`.cursor/prompts/\` to build one section at a time.
`
  );

  for (const page of firstTwoPages) {
    const slug = pageSlug(page);
    await writeFile(path.join(outputDir, `agency/specs/${slug}-mockup-plan.md`), renderPageMockupPlan(page));
    await writeFile(path.join(outputDir, `.cursor/prompts/${slug}-design-mockup.md`), renderCursorPrompt(brief, page));

    for (const sectionKey of page.sections || []) {
      await writeFile(
        path.join(outputDir, `agency/refs/section-packets/${slug}/${sectionKey}.md`),
        renderSectionReference(page, sectionKey)
      );
    }
  }

  console.log(`Reference kickoff complete for ${brief.client}`);
  console.log(`Generated ${firstTwoPages.length} page packet(s).`);
  console.log(`Output: ${path.resolve(outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

