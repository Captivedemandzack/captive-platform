// scaffolder.js
// Creates the full project folder structure and config files from the brief

import fs from 'fs-extra';
import path from 'path';

export async function scaffoldProject(brief, outputDir) {
  const dirs = [
    'app/(marketing)',
    'app/(marketing)/men',
    'app/(marketing)/women',
    'app/(marketing)/locations',
    'app/api/lead',
    'components/ui',
    'components/blocks',
    'components/layout',
    'content/peptides',
    'content/services',
    'content/locations',
    'content/policies',
    'lib',
    'public/images',
    'public/fonts',
    'brief',
    'audit',
    'refs/sections',
    'specs',
    '.cursor/rules',
    '.cursor/prompts',
    'scripts',
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(outputDir, dir));
  }

  // Write CLAUDE.md — the master context file every agent reads first
  await fs.outputFile(path.join(outputDir, 'CLAUDE.md'), `# ${brief.client} — Project Context

This file is read by Claude Code agents before any task.

## Project
- Client: ${brief.client}
- URL: ${brief.destination_url}
- Industry: ${brief.industry}
- Positioning: ${brief.positioning}
- Anti-positioning: ${brief.anti_positioning}

## Locations
${brief.locations.map(l => `- ${l}`).join('\n')}

## Primary Conversion Goal
${brief.primary_cta} → Lead form → ${brief.lead_flow}

## Compliance Rules (CRITICAL)
${brief.compliance}

## Technical Stack
- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS v4 with CSS variable tokens from lib/tokens.css
- shadcn/ui components
- Framer Motion for animation
- next/image for all images
- next/font for typography
- Deployed on Netlify

## Design Rules
- NEVER hardcode hex colors — always use CSS variables from lib/tokens.css
- NEVER use fonts not imported in tokens.css
- Every CTA button MUST have risk reversal text below it
- Every page exports generateMetadata
- Server components by default; mark client components with 'use client'

## When starting any task
1. Read @brief/intake.md for full context
2. Read @lib/tokens.css for all design tokens
3. Follow @.cursor/rules/ constraints
4. Build one section at a time
`);

  // Write .cursor/rules/core.mdc
  await fs.outputFile(path.join(outputDir, '.cursor/rules/core.mdc'), `---
alwaysApply: true
---
# Captive Demand — Core Rules

## Stack
- Next.js 15 App Router. Server components default. Client components use 'use client'.
- TypeScript strict mode.
- Tailwind CSS v4 with CSS variables. Import tokens from @/lib/tokens.css.
- shadcn/ui for primitives. Framer Motion (import { motion } from 'motion/react') for animation.
- next/image for ALL images. next/font/google for ALL fonts.

## Design Rules
- NEVER hardcode hex colors. Always: var(--color-*)
- NEVER hardcode font-family strings. Always: var(--font-*)
- NEVER hardcode spacing values. Always: var(--space-*)
- Button hierarchy: primary = accent bg, secondary = outlined accent, ghost = text only
- Every primary CTA button must have a <p> below it with risk reversal copy

## Code Quality
- Prefer composition over prop-drilling
- Extract repeated patterns to components/blocks/
- Keep component files under 150 lines — split if longer
- No inline styles except for dynamic values
- Use semantic HTML: section, article, nav, header, footer, main

## Performance
- Every next/image needs explicit width + height OR fill with a sized container
- Add loading="lazy" to below-fold images
- Use font-display: swap (handled by next/font automatically)
`);

  // Write .cursor/rules/legitscript.mdc
  await fs.outputFile(path.join(outputDir, '.cursor/rules/legitscript.mdc'), `---
alwaysApply: true
globs: ["content/**", "app/**", "components/**"]
---
# LegitScript Compliance Rules — ${brief.client}

## Image Rules
- NO shirtless imagery or alt text describing shirtless subjects
- NO gym equipment, barbells, bodybuilding contexts
- NO athletic performance framing ("get shredded," "peak performance," etc.)
- NO blue LED lab lighting or supplement bottle imagery
- USE: clothed lifestyle, consultation settings, clinical interiors, headshots

## Copy Rules  
- NO efficacy claims: "guaranteed," "cure," "eliminate," "proven to reverse"
- NO "anti-aging" tied to disease prevention
- NO "FDA-approved" unless the specific compound is actually approved
- BPC-157 and Thymosin Beta-4 pages REQUIRE: "This peptide is used in research settings under physician supervision. Individual results vary. Not FDA-approved for [condition]."
- ALL CTAs point to consultation booking — never to product purchase

## Banned Words
unlock, guaranteed results, cure, eliminate, reverse aging, anti-aging treatment, 
FDA-approved (unless verified), proven to, clinically proven (unless cited study)
`);

  // Write .cursor/rules/voice.mdc
  await fs.outputFile(path.join(outputDir, '.cursor/rules/voice.mdc'), `---
alwaysApply: false
globs: ["content/**"]
---
# Voice & Tone Rules — ${brief.client}

## Voice
Write like a confident specialist talking to an intelligent adult patient.
NOT like a marketing agency. NOT like a hospital brochure.

## Rules
- Max 20 words per sentence
- Vary sentence length — rhythm matters
- One idea per paragraph
- Lead with benefit, follow with mechanism
- Specific > vague ("lost 18 pounds in 6 weeks" > "significant weight loss")

## Banned Phrases
unlock, elevate, harness the power of, in today's fast-paced world, cutting-edge solutions,
comprehensive approach, seamlessly, tapestry, navigate the landscape, journey, 
take charge of your health (cliché), transform your life (cliché)

## Tone Anchors
- Authoritative but approachable
- Clinical but not cold  
- Confident but not salesy
- Premium but not pretentious
`);

  // Write intake.md from brief
  await fs.outputFile(path.join(outputDir, 'brief/intake.md'), `# ${brief.client} — Project Brief

## Overview
- **Client:** ${brief.client}
- **Destination URL:** ${brief.destination_url}
- **Industry:** ${brief.industry}
- **Positioning:** ${brief.positioning}
- **Anti-positioning:** ${brief.anti_positioning}

## Locations
${brief.locations.map(l => `- ${l}, Florida`).join('\n')}

## Services

### Men's
${brief.sections.men.map(s => `- ${s}`).join('\n')}

### Women's
${brief.sections.women.map(s => `- ${s}`).join('\n')}

## Conversion Architecture
- Primary CTA: ${brief.primary_cta}
- Lead flow: ${brief.lead_flow}

## Compliance
${brief.compliance}

## Brand Direction
${Object.entries(brief.brand_signals).map(([k,v]) => `- **${k}:** ${v}`).join('\n')}

## Color Direction
${brief.color_direction}

## Typography Direction
${brief.typography_direction}

## Image Style Guide
- Lighting: ${brief.image_style.lighting}
- Subjects: ${brief.image_style.subjects}
- Banned: ${brief.image_style.banned}
- Color grade: ${brief.image_style.color_grade}
- Perspective: ${brief.image_style.perspective}

## Pages to Build
${brief.pages_to_build.map(p => `### ${p.name}\nSections: ${p.sections.join(', ')}`).join('\n\n')}
`);

  // Write Podium webhook handler
  await fs.outputFile(path.join(outputDir, 'app/api/lead/route.ts'), `import { NextRequest, NextResponse } from 'next/server';

// Lead router — receives form submissions, fans out to Podium + GA4 + optional HubSpot
// Podium endpoint: get from Ian Costello at BioDesign

const PODIUM_WEBHOOK_URL = process.env.PODIUM_WEBHOOK_URL;
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID;

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const lead = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    location: body.location,  // Tampa | Orlando | Melbourne | Lake Mary
    service: body.service,    // Which treatment they're inquiring about
    message: body.message,
    source: body.source || 'website',
    timestamp: new Date().toISOString(),
  };

  const results = await Promise.allSettled([
    // Podium — existing lead flow preserved
    PODIUM_WEBHOOK_URL && fetch(PODIUM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    }),
    
    // TODO: Add HubSpot when portal access confirmed with Lacie
    // hubspot.createContact(lead),
    
    // TODO: Add Slack notification for new leads
    // slack.notify(\`New lead: \${lead.name} → \${lead.location}\`),
  ]);

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.error('Lead routing partial failure:', failed);
  }

  return NextResponse.json({ success: true });
}
`);

  // Write redirects.json starter
  const redirects = [
    ...brief.sections.men.map(s => ({
      source: `/services/${s.toLowerCase().replace(/\s+/g, '-')}`,
      destination: `/men/services/${s.toLowerCase().replace(/\s+/g, '-')}`,
      note: `biodesignmen.com service → new men's path`
    })),
    { source: '/about', destination: '/about', note: 'preserve' },
    { source: '/contact', destination: '/book', note: 'redirect old contact to new book page' },
    { source: '/locations/testosterone-clinic-:city', destination: '/locations/:city', note: 'old location URL pattern' },
  ];

  await fs.outputFile(
    path.join(outputDir, 'redirects.json'),
    JSON.stringify(redirects, null, 2)
  );

  return { dirs: dirs.length, files: 8 };
}
