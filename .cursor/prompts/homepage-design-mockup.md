# Homepage Design Mockup Prompts

Run these in Cursor one at a time. Review each section before continuing.

Before each prompt, make Cursor read:

- `AGENTS.md`
- `CANONICAL_ARCHITECTURE.md`
- `.cursor/rules/project-architecture.mdc`
- `.cursor/rules/captive-studio-spec.mdc`
- `.cursor/rules/biodesign-project.mdc`
- `.cursor/rules/medical-compliance.mdc`
- `agency/brief/intake.md`
- `agency/refs/brand-hack-synthesis.md`
- `agency/specs/homepage.md`

## Prompt 1 — Split Hero

```
Build the Split Hero section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/hero-split.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- hero.men.eyebrow
- hero.men.headline
- hero.men.subhead
- hero.men.image
- hero.men.ctaLabel
- hero.men.ctaHref
- hero.women.eyebrow
- hero.women.headline
- hero.women.subhead
- hero.women.image
- hero.women.ctaLabel
- hero.women.ctaHref
```

---

## Prompt 2 — Trust Bar

```
Build the Trust Bar section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/trust-bar.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- trust.items[0].value
- trust.items[0].label
```

---

## Prompt 3 — Services Grid

```
Build the Services Grid section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/services-grid.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- services.men[0].title
- services.men[0].body
- services.women[0].title
- services.women[0].body
```

---

## Prompt 4 — Why BioDesign

```
Build the Why BioDesign section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/why-biodesign.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- why.items[0].title
- why.items[0].body
```

---

## Prompt 5 — How It Works

```
Build the How It Works section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/how-it-works.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- process.steps[0].title
- process.steps[0].body
```

---

## Prompt 6 — Locations Grid

```
Build the Locations Grid section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/locations-grid.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- locations[0].city
- locations[0].address
- locations[0].phone
- locations[0].hours
```

---

## Prompt 7 — Testimonials

```
Build the Testimonials section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/testimonials.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- testimonials[0].quote
- testimonials[0].author
- testimonials[0].treatment
```

---

## Prompt 8 — Final CTA

```
Build the Final CTA section for BioDesign Clinic's Homepage design mockup.

Use the reference packet at:
agency/refs/section-packets/homepage/final-cta.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- cta.headline
- cta.body
- cta.buttonLabel
- cta.buttonHref
```
