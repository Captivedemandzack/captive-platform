# BioDesign — Day 1 Build Plan
## Brand Hack → Section References → Cursor Build

The goal of today: have a live staging link with the homepage and one location page running. That's the two pages the client sees that tell them the project is moving.

---

## Phase 1 — Brand Hack (Do this before opening Cursor)

### Step 1: Identify the brand anchor (30 min)

BioDesign's existing signals:
- Logo is already refined — geometric circle monogram + clean serif wordmark. This is luxury-clinical territory, not gym-brand territory.
- The current men's site (dark hex patterns, teal) is fighting the logo. That's the core design problem.
- The women's/wellness side uses warm creams and neutrals — that's actually closer to where the unified brand should go.
- Client goal: performance and longevity medicine. Premium. Not a supplement store.

**Your brand hack target: Marek Health (clinical authority) + Hone Health (warmth and conversion) + The Well NYC (luxury wellness refinement)**

Go look at these three right now:
- https://marekhealth.com — note the dark/editorial energy, serif headline usage
- https://honehealth.com — note the warm photography, clinical trust signals, form-first layout
- https://thewell.nyc — note the restrained color palette, premium spacing, font pairing

You are not copying any one of these. You are extracting the best decision from each:
- From Marek: dark base tone, editorial typography, authority positioning
- From Hone: warm photography treatment, conversion structure, trust bar density
- From The Well: color restraint, premium negative space, serif display + sans body pairing

### Step 2: Extract the tokens (20 min, free tools)

**Font extraction (free):**
1. Open Marek Health in Chrome
2. Right-click any headline → Inspect → Computed tab → `font-family`
3. Do the same on Hone Health and The Well
4. You're looking for the display font (used on H1/H2) and the body font (used on paragraphs)

Alternative if you want it faster: install the free **Fonts Ninja** Chrome extension (fonts.ninja) — hover any text, it tells you the font name and links to it instantly. No DevTools needed.

**Color extraction (free):**
1. Install **ColorZilla** Chrome extension (free) — eyedropper that gives you any hex on any site
2. On each reference site: grab the background color, primary text color, and accent/CTA color
3. You're not stealing their exact palette — you're understanding what versions of warm-neutral + deep-base + accent work together at this price point

**What you're building toward:**

For BioDesign, the token target based on the above research:

```css
/* lib/tokens.css */
:root {
  /* Base */
  --color-bg: #0C0F0E;           /* near-black, warmer than pure black */
  --color-surface: #161A19;      /* elevated surface (cards, nav) */
  --color-border: #2A2F2E;       /* subtle dividers */

  /* Text */
  --color-text-primary: #F0EDE6; /* warm off-white, not harsh */
  --color-text-secondary: #9A9690; /* muted warm gray */

  /* Accent */
  --color-accent: #C9A96E;       /* warm champagne gold */
  --color-accent-muted: #8B7355; /* deeper gold for hover/pressed */

  /* Women's section override */
  --color-bg-women: #FAF8F4;      /* warm cream */
  --color-text-women: #1A1A18;
  --color-accent-women: #9B7FA6; /* dusty mauve */

  /* Typography */
  --font-display: 'Cormorant Garamond', Georgia, serif;  /* hero H1/H2 */
  --font-body: 'DM Sans', system-ui, sans-serif;          /* all body/UI */
  --font-mono: 'DM Mono', monospace;                      /* labels, tags */

  /* Scale */
  --text-hero: clamp(3rem, 7vw, 6rem);
  --text-h1: clamp(2rem, 4vw, 3.5rem);
  --text-h2: clamp(1.5rem, 3vw, 2.5rem);
  --text-body: 1.0625rem;
  --leading-tight: 1.1;
  --leading-body: 1.65;

  /* Spacing */
  --space-section: clamp(5rem, 10vw, 10rem);
  --space-gap: clamp(1.5rem, 3vw, 2.5rem);
  --radius: 0.375rem;
}

/* Women's section — swap palette mid-page */
[data-section="women"] {
  --color-bg: var(--color-bg-women);
  --color-text-primary: var(--color-text-women);
  --color-accent: var(--color-accent-women);
}
```

**Font sourcing (all free):**
- Cormorant Garamond: Google Fonts (free) — `next/font/google`
- DM Sans: Google Fonts (free)
- Alternative display options if Cormorant feels too soft: Playfair Display, Fraunces, Libre Baskerville
- Alternative body options: Instrument Sans, Plus Jakarta Sans, Outfit

Adjust the hex values based on what you actually pull from the reference sites — these are starting points calibrated to the brand direction, not locked finals.

---

## Phase 2 — Section References (30 min)

Before you open Cursor, you need to know what sections the homepage needs and have a reference for each one. This is what you said you do manually. Here's the list for BioDesign:

### Homepage sections needed:
1. **Hero** — Choose-your-path split (Men's | Women's) with full-bleed background, headline, subhead, dual CTAs
2. **Trust Bar** — Social proof: ratings, "as seen in," patient count, years in practice
3. **What We Treat** — 5-6 service cards (Men's) with icon/image, title, one-line description
4. **Why BioDesign** — 3-column differentiators (clinical team, evidence-based protocols, personalized plans)
5. **How It Works** — 3-step process (Consult → Lab Work → Protocol)
6. **Locations** — 4-location grid with address, hours, map link, book CTA
7. **Testimonials** — 3 patient quotes, names, treatments received
8. **Final CTA** — "Start with a free consultation" full-width section with risk reversal

### Where to find section references (all free, all Awwwards-adjacent):

- **godly.website** — filter by "dark" and "medical" or "wellness." Best for hero and overall layout reference.
- **lapa.ninja** — landing page reference. Good for trust bar patterns and how-it-works sections.
- **land-book.com** — good for conversion-focused layouts (forms, CTAs, risk reversal patterns)
- **Awwwards.com** — search "wellness" or "clinic" — more editorial/luxury references
- **Refero.design** — specifically for medspa/health vertical UI patterns

For each section, spend 3-4 minutes finding one strong reference. Screenshot it or just keep the tab open. You don't need to save them formally — you need the visual anchor in your head when you prompt Cursor.

**For BioDesign specifically, the references that are already strong:**
- Hero split: how Hims.com handles the men/women dual path
- Trust bar: how Ro.co stacks their proof points (patient count, ratings, certification logos)
- How It Works: how Marek Health breaks down their protocol process
- Locations: how any multi-location medspa handles city-specific pages (Ideal Image is a good reference for pure conversion, even if the aesthetic is different)

---

## Phase 3 — Image Direction (20 min, before Cursor)

You need to know what images you're designing around before you build components. Placeholders kill design decisions.

### What BioDesign needs on the homepage:
1. **Hero background:** Clinical but aspirational. A man (Men's side) or woman (Women's side) in a clean, naturally lit environment — NOT a gym, NOT a lab coat close-up. Think: confident professional, 40s, outdoors or clean modern interior.
2. **Section backgrounds:** Abstract medical/cellular imagery — clean, dark, slightly textural. Avoid blue-light LED lab clichés.
3. **Location photos:** If they don't have real photography, use clinic interior references (waiting room, consultation room) — warm lighting, clean modern space.

### Lummi workflow (free for basic use):
1. Go to lummi.ai
2. Search: "longevity clinic," "men's health professional," "hormone therapy consultation," "medical wellness"
3. Download 3-5 options per slot
4. **LegitScript constraint: no shirtless, no athletic performance imagery, no bodybuilding.** Filter for clothed lifestyle and clinical consultation imagery.

### Gemini Nano Banana for custom generation (free tier available):
When Lummi doesn't have what you need (e.g., a very specific hero with the right tone), use Google AI Studio (aistudio.google.com — free) with Nano Banana Pro:

Prompt template:
```
A confident male professional in his mid-40s, business casual attire, 
in a clean modern medical consultation room. Warm clinical lighting. 
Shallow depth of field. Shot at eye level. Color grade: slightly 
desaturated, warm highlights, dark shadows. No gym equipment, 
no supplements, no lab coats.
```

Maintain a `brief/image-style-guide.md` with this style direction locked in — every image prompt references it so your site has visual cohesion.

**File → `public/images/` with semantic names:**
```
hero-men-consultation.jpg
hero-women-wellness.jpg
section-lab-abstract.jpg
location-tampa-clinic.jpg
```

---

## Phase 4 — Cursor Build Session (the actual work)

Now open Cursor. You have:
- ✅ Repo set up with folder structure
- ✅ `lib/tokens.css` with brand tokens
- ✅ `brief/intake.md` with client context
- ✅ `.cursor/rules/` with core + legitscript rules
- ✅ Images in `/public/images/`
- ✅ Section references in your head (or tabs open)

### The prompting pattern that works (section by section, not all at once):

**Never dump the whole page in one prompt.** You'll get mediocre output on every section. Instead:

**Prompt 1 — Foundation:**
```
Read @brief/intake.md and @lib/tokens.css.

Build the layout foundation for app/page.tsx:
- Import tokens from lib/tokens.css
- Set up the page shell with a <main> and section wrappers
- Each section should be a separate component in components/blocks/
- Use CSS variables from tokens.css throughout — never hardcode colors
- Do not build any section content yet, just the scaffold
```

**Prompt 2 — Hero section:**
```
Build components/blocks/Hero.tsx for the BioDesign homepage.

Requirements:
- Full-bleed background with a split: left side Men's, right side Women's
- Men's side: dark background (#0C0F0E), hero image (public/images/hero-men-consultation.jpg), 
  headline "Own Your Health.", subhead "Evidence-based hormone and peptide therapy for men 
  who refuse to slow down.", CTA button "Start With a Free Consult" with risk reversal 
  text below: "No commitment. No waitlist."
- Women's side: cream background (#FAF8F4), women's hero image, headline "Feel Like Yourself Again.", 
  subhead "Personalized hormone and wellness protocols for women at every stage.", 
  CTA "Book Your Consultation", risk reversal "Physician-led care. Same-week availability."
- Use data-section="men" and data-section="women" on each side for token switching
- Mobile: stack vertically, Men's on top
- Font: --font-display for headlines, --font-body for subhead
- Reference aesthetic: editorial dark/light split, generous negative space, no gradients
```

**Prompt 3 — Trust bar:**
```
Build components/blocks/TrustBar.tsx.

4 trust signals in a horizontal bar between hero and next section:
1. "4,200+ Patients Treated" with a patient icon
2. "4.9★ Average Rating" with star icons  
3. "Physician-Led Care" with a medical cross icon
4. "4 Florida Locations" with a location pin icon

Dark background (#161A19), warm gold accent (#C9A96E) for the numbers/icons.
Compact, single-row on desktop. 2x2 grid on mobile.
Use --font-body for text, slightly smaller than body size. All caps labels.
```

Continue section by section. Each prompt is tight, references the tokens, gives you a concrete reference point, and builds one component at a time.

### The sub-agent pattern (free, inside Cursor):

For content you need drafted (peptide descriptions, service copy, testimonial placeholder text), use a separate Cursor chat window as your "copy agent":

```
You are a medical content writer for a LegitScript-compliant men's and women's longevity clinic.

Rules:
- No efficacy claims, no "guaranteed results," no "anti-aging" tied to disease
- No words: unlock, elevate, harness, cutting-edge, seamlessly, comprehensive
- Write like a confident specialist talking to an intelligent adult patient
- Every claim is either a question or has a source
- Every CTA goes to a consultation, never to a product purchase
- Max 20 words per sentence

Write 3 short testimonials (2-3 sentences each) for BioDesign Men's Clinic patients. 
Topics: testosterone replacement, weight loss, peptide therapy. 
Include first name, city, treatment received.
```

That's your free copy agent. Run it in a separate Cursor chat, paste the output into your MDX content files.

---

## Phase 5 — Free Tooling Stack (what's already available)

Everything below is free or already paid for:

| Tool | What it does | Where to get it |
|---|---|---|
| **Google AI Studio** | Gemini Nano Banana image generation | aistudio.google.com |
| **Lummi.ai** | AI stock photos (free tier) | lummi.ai |
| **Fonts Ninja** | Instant font ID on any website | Chrome extension, free |
| **ColorZilla** | Eyedropper color picker for any site | Chrome extension, free |
| **Awwwards / godly.website / lapa.ninja** | Section references | Free, no signup |
| **Google Fonts** | Cormorant, DM Sans, Playfair, etc. | fonts.google.com |
| **Netlify** | Staging + deployment + form handling | Free tier, already have |
| **GitHub** | Version control | Free |
| **Cursor** | IDE + agent | Already have |
| **Google Search Console** | SEO + indexing | Free, once access granted |
| **Pagespeed Insights** | Lighthouse audits | pagespeed.web.dev, free |
| **Schema.org validator** | JSON-LD verification | validator.schema.org, free |

**Chrome extensions to install right now (all free):**
1. Fonts Ninja — font identification on any site
2. ColorZilla — color eyedropper
3. VisBug — inspect spacing, typography, colors on any live site without DevTools
4. Lighthouse (built into Chrome DevTools) — performance auditing

---

## What "scalable" actually means for the next project

The things you build today that apply to every future portco:

1. **`lib/tokens.css` pattern** — every future site gets this file with different values. Same structure, different brand. 5 minutes to spin up.

2. **`components/blocks/` structure** — Hero, TrustBar, HowItWorks, LocationGrid, Testimonial, CTA. Once these are built cleanly with CSS variable tokens, you copy the folder and retheme it. You're building a component library with every project.

3. **`.cursor/rules/` files** — core.mdc and legitscript.mdc apply to every medical/wellness build. Add vertical-specific rules as you encounter new industries.

4. **`brief/intake.md` pattern** — every project gets this file. The Cursor agent reads it first on every session. This replaces the "re-explain the project every time" problem.

5. **`brief/image-style-guide.md` pattern** — locks your visual direction for image generation. Prevents the "10 images that don't look like they're from the same site" problem.

6. **The section-by-section prompting pattern** — tighter prompts, better output, every time. This is the process, not just a BioDesign thing.

---

## Today's output goal

By end of day you should have:
- Live staging URL on Netlify
- Homepage with Hero, TrustBar, and at minimum 2 more sections built
- `lib/tokens.css` locked with BioDesign brand tokens
- Real images (from Lummi or Gemini) in at least the hero section — no gray placeholders

That's what you send to Lacie as "we're already moving on this."
