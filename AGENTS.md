# Captive Client Site Agent Guide

This repo defines the canonical architecture for Captive Studio-compatible client websites.

## Prime Directive

Build custom Next.js websites where:

- Next.js owns structure, layout, animation, interaction, SEO logic, routing, and visual design.
- JSON content files own only client-editable text, images, image alt text, SEO metadata, and safe CTA labels or URLs.
- Captive Studio edits the JSON content layer, not the React layout layer.
- Agents must preserve the editor contract exactly.

The goal is not to make a page builder. The goal is to make custom-coded websites safely editable by clients.

## Canonical Boundary

Agents may use JSON for:

- Headlines, subheads, paragraphs, labels, testimonials, FAQ copy, and metadata.
- Image objects with `url`, `width`, `height`, and `alt`.
- CTA labels and hrefs when the template explicitly exposes them.
- Repeated content items when the template fixes the maximum structure.

Agents must not use JSON for:

- Layout decisions.
- Section order.
- Animation behavior.
- Design tokens.
- Component variants unless explicitly approved in a page spec.
- Arbitrary client-controlled HTML.

## Required Site Pattern

Every client site should follow this shape once the Next.js app exists:

```txt
content/
  home.json

src/
  app/
    page.tsx
    [slug]/page.tsx
    preview/[pageId]/page.tsx
  templates/
    registry.ts
    homepage/
      schema.ts
      component.tsx
  lib/
    content/
      loader.ts
    editable/
      editable-text.tsx
      editable-image.tsx
      editor-mode-context.tsx
      editor-instrumentation.tsx
```

The `agency/` folder is the durable project memory for research, strategy, specs, prompts, QA, and launch decisions.

## Editable Content Rules

- Never hardcode client-editable visible copy inside JSX.
- Wrap editable text with `EditableText`.
- Wrap editable images with `EditableImage`.
- Use dot paths and bracket paths that match the content JSON exactly, such as `hero.headline` and `features[0].title`.
- Store every image as `{ "url": "...", "width": 1920, "height": 1080, "alt": "..." }`.
- Validate content with Zod before rendering templates.
- Production pages read from local JSON files.
- Preview pages may fetch draft content from Captive Studio.

## Creative Direction Rules

The editable content layer must not flatten the creative quality of the site.

Use custom Next.js, CSS, Canvas, SVG, animation libraries, scroll interactions, and rich layout work wherever the project calls for it. Keep those creative decisions in code. Expose only the safe content fields to the client.

## Agency Workflow

Before building a substantial page or template, use the project memory folders:

```txt
agency/brief/      Client inputs, positioning, constraints, image style guide.
agency/audit/      Current-site findings, SEO notes, compliance notes, migration risks.
agency/refs/       Reference sites, brand hacks, layout patterns.
agency/specs/      Page and feature specs that agents build against.
agency/prompts/    Reusable manual-agent prompts for research, copy, QA, and imagery.
agency/runbooks/   Repeatable SOPs for new builds, launch, and production workflows.
```

When in doubt, write the decision down in `agency/specs/` or `agency/runbooks/` before coding.

## Quality Bar

Every client site should launch with:

- Editable content fields wired correctly.
- No broken editor field paths.
- Mobile-first responsive layouts.
- Accessible navigation and forms.
- Unique metadata per page.
- Optimized images with explicit sizes.
- Clear CTA hierarchy.
- A launch checklist completed in `agency/runbooks/launch-checklist.md`.
