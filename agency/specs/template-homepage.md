# Homepage Template Spec

## Purpose

Create the main entry point for a client site.

## Design Ownership

Next.js owns:

- Layout.
- Responsive behavior.
- Motion.
- Visual hierarchy.
- Section order.
- CTA hierarchy.

JSON owns:

- Text.
- Images.
- Alt text.
- CTA labels and hrefs.
- SEO metadata.

## Suggested Editable Fields

```txt
hero.eyebrow
hero.headline
hero.subhead
hero.image
hero.primaryCtaLabel
hero.primaryCtaHref
hero.secondaryCtaLabel
hero.secondaryCtaHref
trust.items[0].label
sections[0].headline
sections[0].body
cta.headline
cta.body
cta.buttonLabel
cta.buttonHref
```

## Acceptance Criteria

- All visible editable text comes from JSON.
- All editable images use image objects.
- Every editable field is wrapped.
- The page works without Captive Studio connected.
- The preview route can render the same template in editor mode.

