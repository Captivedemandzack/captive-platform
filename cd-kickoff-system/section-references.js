// section-references.js
// For each page section, finds reference design patterns and generates Cursor build prompts

import fs from 'fs-extra';
import path from 'path';

// Section pattern library — your accumulated design knowledge encoded as data
// Each section has: reference sites, layout patterns, conversion requirements, prompt template
const SECTION_PATTERNS = {
  'hero-split': {
    description: 'Full-bleed split hero with dual paths (Men / Women)',
    references: ['hims.com', 'ro.co', 'getmaple.ca'],
    layout: 'Two vertical halves. Left dark, right light. Each with full-height background image, headline, subhead, CTA. Mobile: stacked vertically.',
    conversion_elements: ['Primary CTA above fold', 'Risk reversal text below button', 'Trust signal count visible'],
    design_notes: 'The split should feel like a deliberate editorial choice, not a nav menu. Generous negative space. Headline should be 3-5 words max, display-weight serif.',
    cursor_prompt: (brief) => `Build components/blocks/HeroSplit.tsx for ${brief.client}.

LAYOUT: Full-viewport split hero. Left half = Men's. Right half = Women's. On mobile: stacked, Men's first.

MEN'S SIDE:
- Background: var(--color-bg) with hero image overlay at 40% opacity (src="/images/hero-men.jpg")
- Eyebrow label: "Men's Longevity Medicine" — text-label class, color: var(--color-accent)
- Headline: "Own Your Health." — text-h1 class, font: var(--font-display), color: var(--color-text-primary)
- Subhead: "Physician-led testosterone, peptide, and hormone therapy across ${brief.locations.join(', ')}." — var(--text-body-lg), var(--color-text-secondary)
- CTA button: "Start With a Free Consult" — background: var(--color-accent), color: var(--color-bg), padding: 1rem 2rem, radius: var(--radius)
- Risk reversal: "No commitment. No waitlist. Same-week availability." — var(--text-sm), var(--color-text-muted)

WOMEN'S SIDE (data-section="women"):
- Background: var(--color-bg-women) with hero image overlay (src="/images/hero-women.jpg")
- Eyebrow: "Women's Wellness & Hormone Therapy"
- Headline: "Feel Like Yourself Again."
- Subhead: "Personalized hormone, peptide, and wellness protocols for women at every stage."
- CTA: "Book Your Consultation" — background: var(--color-accent-women)
- Risk reversal: "Physician-led care. Free initial consultation."

TECHNICAL:
- Use next/image for backgrounds with fill + objectFit cover
- Section min-height: 100svh
- No gradients — use semi-transparent image overlays only
- Framer Motion fade-in on text elements, staggered 150ms
- Each side links to /men and /women respectively
- Use CSS variables throughout — never hardcode colors`
  },

  'trust-bar': {
    description: 'Social proof bar with key metrics',
    references: ['ro.co', 'numan.com', 'getmaple.ca'],
    layout: '4 metrics in a horizontal bar. Icon + number + label. Desktop: single row. Mobile: 2x2 grid.',
    conversion_elements: ['Patient count', 'Rating', 'Clinical credential', 'Location count'],
    design_notes: 'Numbers should be large and gold. Labels small and muted. Background slightly elevated from page bg. This section should load fast — no animation delay.',
    cursor_prompt: (brief) => `Build components/blocks/TrustBar.tsx.

4 trust signals in a compact horizontal bar:
1. Icon: Users → "4,200+ Patients Treated"
2. Icon: Star → "4.9★ Patient Rating"  
3. Icon: Stethoscope → "Physician-Led Care"
4. Icon: MapPin → "${brief.locations.length} Florida Locations"

STYLING:
- Background: var(--color-surface)
- Border-top + border-bottom: 1px solid var(--color-border)
- Numbers/icons: var(--color-accent), font-size: 1.5rem, font-weight: 600
- Labels: var(--color-text-secondary), text-label class (uppercase, tracked)
- Padding: 2rem var(--container-padding)
- Gap between items: var(--space-gap)
- Dividers between items on desktop: 1px solid var(--color-border)
- Mobile: 2x2 grid, no dividers

Use Lucide icons. Keep this component under 40 lines.`
  },

  'services-grid': {
    description: 'Service cards grid showing treatment options',
    references: ['marekhealth.com', 'defy.com', 'maximus.com'],
    layout: '2-3 column grid of cards. Each card: icon/image, title, 1-line description, learn more link.',
    conversion_elements: ['Clear service names', 'One-line benefit statement', 'Link to service page'],
    design_notes: 'Cards should have hover state that lifts them. Gold accent on icon. Keep descriptions to one sentence — these are scannable, not informational.',
    cursor_prompt: (brief, section = 'men') => {
      const services = brief.sections[section];
      return `Build components/blocks/ServicesGrid.tsx.

Display ${brief.client}'s ${section === 'men' ? "Men's" : "Women's"} services as a card grid.

SERVICES DATA (map this array):
${services.map(s => `- "${s}"`).join('\n')}

CARD STRUCTURE:
- Icon area: 48x48px, background: var(--color-accent-subtle), icon color: var(--color-accent)
- Title: var(--text-h3), var(--font-display), var(--color-text-primary)
- Description: var(--text-body), var(--color-text-secondary), max 12 words
- Link: "Learn more →" in var(--color-accent), font-size: var(--text-sm)

LAYOUT:
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Card background: var(--color-surface)
- Card border: 1px solid var(--color-border)
- Card radius: var(--radius-md)
- Card padding: 2rem
- Hover: translateY(-4px), box-shadow: var(--shadow), border-color: var(--color-accent-muted)
- Transition: var(--transition)

Section heading above grid: "Treatments Built Around You" — text-h2, centered, with a one-line subhead in var(--color-text-secondary).
Section background: var(--color-bg).
Section padding: var(--space-section) var(--container-padding).`;
    }
  },

  'how-it-works': {
    description: '3-step process section',
    references: ['hims.com', 'honehealth.com', 'getmaple.ca'],
    layout: 'Horizontal 3-step flow with numbered steps, icon, title, description. Connected by a line on desktop.',
    conversion_elements: ['Step numbers prominent', 'Process feels fast and easy', 'CTA at bottom of section'],
    design_notes: 'The goal is to make the process feel easy. 3 steps max. Descriptions should be one sentence each. The connecting line between steps is a nice touch.',
    cursor_prompt: (brief) => `Build components/blocks/HowItWorks.tsx.

3-step process section.

STEPS:
1. "Schedule Your Consult" — "Book online in under 2 minutes. No referral needed."
2. "Get Your Labs Done" — "We order a comprehensive panel. Results in 48 hours."
3. "Start Your Protocol" — "Your physician reviews results and builds your plan."

LAYOUT:
- 3 columns desktop, stacked mobile
- Step number: large (4rem), var(--font-display), var(--color-accent), opacity 0.4
- Step title: var(--text-h3), var(--font-display), var(--color-text-primary)
- Description: var(--text-body), var(--color-text-secondary)
- Connecting line between steps on desktop: 1px dashed var(--color-border)

CTA below steps:
- Button: "Book Your Free Consult" — same style as hero CTA
- Risk reversal: "Covered by most HSA/FSA accounts."

Section: background var(--color-surface), padding var(--space-section)`
  },

  'locations-grid': {
    description: 'Multi-location cards showing all clinic locations',
    references: ['idealimage.com', 'honehealth.com'],
    layout: '2x2 or 4-column grid. Each card: city name, address, hours, phone, book CTA.',
    conversion_elements: ['Book appointment CTA per location', 'Hours visible', 'Phone number clickable'],
    design_notes: 'Each card should feel like a destination. City name should be large. Include a subtle map or landmark visual if possible.',
    cursor_prompt: (brief) => `Build components/blocks/LocationsGrid.tsx.

LOCATIONS DATA:
${brief.locations.map(loc => `{
  city: "${loc}",
  address: "${loc} clinic address — placeholder",
  phone: "(xxx) xxx-xxxx",
  hours: "Mon–Fri 8am–5pm",
  href: "/locations/${loc.toLowerCase().replace(' ', '-')}"
}`).join(',\n')}

CARD STRUCTURE:
- City name: var(--text-h2), var(--font-display), var(--color-text-primary)
- Address + hours + phone: var(--text-sm), var(--color-text-secondary)
- "Book at this location →" link: var(--color-accent)
- Card: background var(--color-surface), border var(--color-border), radius var(--radius-md), padding 2.5rem
- Hover: border-color var(--color-accent-muted)

LAYOUT:
- 4 columns desktop, 2 tablet, 1 mobile
- Section heading: "Find Your Location" — centered, text-h2

Section: background var(--color-bg), padding var(--space-section)`
  },

  'testimonials': {
    description: 'Patient testimonial section',
    references: ['marekhealth.com', 'honehealth.com'],
    layout: '3-column grid of quote cards. Quote, patient name, treatment received.',
    conversion_elements: ['Real names and treatments', 'Gold quotation mark', 'Treatment type as label'],
    design_notes: 'Quotes should be short (2-3 sentences) and specific — "lost 18 pounds in 6 weeks" beats "I feel so much better." Specificity = credibility.',
    cursor_prompt: (brief) => `Build components/blocks/Testimonials.tsx.

3 patient testimonial cards.

TESTIMONIALS DATA:
[
  {
    quote: "After 6 months on TRT, my energy is back to what it was in my 30s. The team walked me through everything — I finally feel like myself again.",
    name: "Marcus R.",
    location: "Tampa",
    treatment: "Testosterone Replacement"
  },
  {
    quote: "I'd tried everything for weight loss. In 12 weeks I dropped 22 pounds. The protocol is different here — it's actually clinical.",
    name: "David K.",
    location: "Orlando", 
    treatment: "Medical Weight Loss"
  },
  {
    quote: "My hormone levels were completely off and I didn't even know it. Six weeks in, my sleep, mood, and focus completely shifted.",
    name: "Jennifer T.",
    location: "Melbourne",
    treatment: "Hormone Optimization"
  }
]

CARD:
- Opening quote mark: var(--font-display), 5rem, var(--color-accent), opacity 0.3
- Quote text: var(--text-body), var(--color-text-primary), var(--leading-relaxed), font-style: italic
- Name: var(--text-sm), var(--color-text-primary), font-weight: 600, margin-top: 1.5rem
- Treatment label: text-label class, var(--color-accent)
- Card: background var(--color-surface), border var(--color-border), padding 2.5rem, radius var(--radius-md)

Section: background var(--color-bg), heading "Real Men. Real Results." + women variant "Real Women. Real Results.", text-h2`
  },

  'final-cta': {
    description: 'Full-width final CTA section',
    references: ['ro.co', 'hims.com'],
    layout: 'Full-width dark section. Headline, subhead, CTA button, risk reversal. Optional: background texture or subtle image.',
    conversion_elements: ['Strong imperative headline', 'CTA button prominent', 'Risk reversal mandatory', 'Phone number alternative'],
    design_notes: 'This section exists to convert. Copy should be direct. Remove all friction language. The risk reversal here is critical — this is the last chance before they leave.',
    cursor_prompt: (brief) => `Build components/blocks/FinalCTA.tsx.

Full-width conversion section. This is the last section before the footer.

CONTENT:
- Headline: "Your Best Years Aren't Behind You." — var(--text-h1), var(--font-display), var(--color-text-primary), centered
- Subhead: "Start with a free 15-minute consultation. No commitment, no waitlist." — var(--color-text-secondary), centered
- Primary CTA: "Book Your Free Consult" — large button, background var(--color-accent), color var(--color-bg)
- Risk reversal below button: "Most patients see availability within 3–5 business days. HSA/FSA accepted." — var(--text-sm), var(--color-text-muted)
- Phone alternative: "Prefer to call? (800) xxx-xxxx" — var(--color-text-secondary)

DESIGN:
- Background: var(--color-surface) with a very subtle grain texture overlay (CSS noise)
- Gold border-top: 1px solid var(--color-accent-muted)
- Generous padding: calc(var(--space-section) * 1.5)
- Centered layout, max-width 600px for text content
- Framer Motion: fade up on scroll-enter`
  }
};

export async function generateSectionRefs(brief, outputDir) {
  const refsDir = path.join(outputDir, 'refs/sections');
  await fs.ensureDir(refsDir);
  
  const promptsDir = path.join(outputDir, '.cursor/prompts');
  await fs.ensureDir(promptsDir);

  const allPrompts = [];

  for (const page of brief.pages_to_build) {
    const pageName = page.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const pagePrompts = [];

    for (const sectionKey of page.sections) {
      const pattern = SECTION_PATTERNS[sectionKey];
      if (!pattern) continue;

      // Write section reference doc
      const refContent = `# ${sectionKey} — Reference Notes

## Description
${pattern.description}

## Layout Pattern
${pattern.layout}

## Conversion Requirements
${pattern.conversion_elements.map(e => `- ${e}`).join('\n')}

## Design Notes
${pattern.design_notes}

## Reference Sites to Look At
${pattern.references.map(r => `- https://${r}`).join('\n')}
`;
      await fs.outputFile(path.join(refsDir, `${sectionKey}.md`), refContent);

      // Generate Cursor prompt
      const prompt = typeof pattern.cursor_prompt === 'function' 
        ? pattern.cursor_prompt(brief) 
        : pattern.cursor_prompt;
      
      pagePrompts.push({ section: sectionKey, prompt });
    }

    // Write all prompts for this page as a single file you can run sequentially
    const promptFile = pagePrompts.map((p, i) => 
      `## Prompt ${i + 1} — ${p.section}\n\nCopy this into Cursor agent:\n\n\`\`\`\nRead @brief/intake.md and @lib/tokens.css first.\n\n${p.prompt}\n\`\`\``
    ).join('\n\n---\n\n');

    await fs.outputFile(
      path.join(promptsDir, `${pageName}-build-prompts.md`),
      `# ${page.name} — Cursor Build Prompts\n\nRun these in sequence. One prompt per section. Don't run the next until the current one looks right.\n\n---\n\n${promptFile}`
    );

    allPrompts.push({ page: page.name, count: pagePrompts.length });
  }

  return allPrompts;
}
