# Location — Tampa Design Mockup Prompts

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
- `agency/specs/location-page.md`

## Prompt 1 — Location Hero

```
Build the Location Hero section for BioDesign Clinic's Location — Tampa design mockup.

Use the reference packet at:
agency/refs/section-packets/location-tampa/location-hero.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- hero.headline
- hero.subhead
- hero.image
- location.name
```

---

## Prompt 2 — Services Offered

```
Build the Services Offered section for BioDesign Clinic's Location — Tampa design mockup.

Use the reference packet at:
agency/refs/section-packets/location-tampa/services-offered.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- services[0].title
- services[0].body
```

---

## Prompt 3 — Meet The Team

```
Build the Meet The Team section for BioDesign Clinic's Location — Tampa design mockup.

Use the reference packet at:
agency/refs/section-packets/location-tampa/meet-the-team.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- team[0].name
- team[0].role
- team[0].image
```

---

## Prompt 4 — Location Info

```
Build the Location Info section for BioDesign Clinic's Location — Tampa design mockup.

Use the reference packet at:
agency/refs/section-packets/location-tampa/location-info.md

Rules:
- Keep the design, layout, motion, and responsive behavior in Next.js code.
- Expose only text, images, alt text, metadata, and safe CTA fields through JSON.
- Do not hardcode client-editable visible copy in JSX.
- Use EditableText for editable text fields.
- Use EditableImage for editable image fields.
- Use the BioDesign tokens from agency/refs/design-variables.css as the starting point.
- Preserve medical-compliance rules.

Editable field starting points:
- location.address
- location.phone
- location.hours
- location.mapHref
```

---

## Prompt 5 — Local Testimonials

```
Build the Local Testimonials section for BioDesign Clinic's Location — Tampa design mockup.

Use the reference packet at:
agency/refs/section-packets/location-tampa/testimonials-local.md

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
```

---

## Prompt 6 — CTA

```
Build the CTA section for BioDesign Clinic's Location — Tampa design mockup.

Use the reference packet at:
agency/refs/section-packets/location-tampa/cta.md

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
