# BioDesign Homepage Spec

This is the first priority page for the Day 1 build.

## Page Goal

Position BioDesign as a unified premium longevity medicine clinic and route visitors into men's or women's care paths while driving free consultation requests.

## Audience

Men and women roughly 35-65 seeking physician-led hormone, peptide, weight loss, and longevity care.

## Section Plan

| Section | Purpose | Editable Fields | Design Notes |
|---|---|---|---|
| Hero split | Route Men's and Women's audiences | `hero.men.*`, `hero.women.*` | Dark men's side, cream women's side, full-bleed and editorial |
| Trust bar | Establish credibility quickly | `trust.items[*].label`, `trust.items[*].value` | 4 compact proof points |
| Services grid | Show treatment scope | `services.men[*]`, `services.women[*]` | Fixed card grid, not client-reorderable |
| Why BioDesign | Explain differentiators | `why.items[*]` | Clinical team, evidence-based protocols, personalized plans |
| How it works | Reduce friction | `process.steps[*]` | Consult -> Labs -> Protocol |
| Locations | Show local access | `locations[*]` | Tampa, Orlando, Melbourne, Lake Mary |
| Testimonials | Add patient confidence | `testimonials[*]` | Human-review placeholder copy |
| Final CTA | Convert | `cta.*` | Consultation-first, risk reversal |

## Editable Field Map

| Field path | Type | Notes |
|---|---|---|
| `metadata.title` | text | SEO title |
| `metadata.description` | text | SEO description |
| `hero.men.eyebrow` | text | Men's path label |
| `hero.men.headline` | text | Suggested: Own Your Health. |
| `hero.men.subhead` | text | Must avoid unsupported claims |
| `hero.men.image` | image | Clothed consultation/lifestyle image |
| `hero.men.ctaLabel` | text | Consultation-first |
| `hero.men.ctaHref` | link | Likely `/men` or `/book` |
| `hero.women.eyebrow` | text | Women's path label |
| `hero.women.headline` | text | Suggested: Feel Like Yourself Again. |
| `hero.women.subhead` | text | Must avoid unsupported claims |
| `hero.women.image` | image | Warm clinical/wellness image |
| `hero.women.ctaLabel` | text | Consultation-first |
| `hero.women.ctaHref` | link | Likely `/women` or `/book` |
| `trust.items[0].value` | text | Example: 4,200+ |
| `trust.items[0].label` | text | Example: Patients Treated |
| `services.men[0].title` | text | Fixed card count |
| `services.men[0].body` | text | One-line description |
| `services.women[0].title` | text | Fixed card count |
| `services.women[0].body` | text | One-line description |
| `process.steps[0].title` | text | Fixed 3-step process |
| `process.steps[0].body` | text | Short, specific |
| `locations[0].city` | text | Tampa |
| `locations[0].body` | text | Location summary |
| `testimonials[0].quote` | text | Human review preferred |
| `testimonials[0].author` | text | First name/initial |
| `cta.headline` | text | Final CTA |
| `cta.body` | text | Risk reversal |
| `cta.buttonLabel` | text | Consultation-first |

## Acceptance Criteria

- [ ] All editable text comes from JSON.
- [ ] All editable images use image objects.
- [ ] All editable fields are wrapped.
- [ ] Mobile layout is polished.
- [ ] CTA hierarchy is clear.
- [ ] No gym/bodybuilding/supplement visual language.
- [ ] No unsupported medical claims.
- [ ] Men's and women's paths feel unified but distinct.
