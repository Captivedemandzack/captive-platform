# Captive Client Site Canonical Architecture

This is the default architecture for Captive Studio-compatible client websites.

## The Decision

Captive client sites are custom-coded Next.js websites with a structured JSON content layer.

Next.js owns the experience.

JSON owns the editable content.

Captive Studio edits the JSON.

The client never edits layout, section order, animation, or design tokens through the content layer.

## Why This Exists

The agency needs a repeatable system that lets agents build fast without turning every site into a fragile one-off.

This architecture gives us:

- Custom-coded creative flexibility.
- Safe client editing for text and images.
- Predictable agent behavior.
- Reusable templates and specs.
- A clear path from the first client implementation to the next 50 sites.

## What Next.js Owns

- Page templates.
- Component structure.
- Section order.
- Layout and responsive behavior.
- Animation and interaction.
- Custom illustrations.
- SEO logic.
- Form behavior.
- Tracking and analytics.
- Design tokens.
- Compliance-sensitive structure.

## What JSON Owns

- Headlines.
- Paragraphs.
- Labels.
- Testimonials.
- FAQ copy.
- Image URLs.
- Image width and height.
- Image alt text.
- SEO title and description.
- Safe CTA labels and URLs.

## What Captive Studio Owns

- Draft editing.
- Publish workflow.
- Writing updated JSON files into the client repo.
- Previewing draft content inside the client site's `/preview/[pageId]` route.
- Click-to-edit field selection via `data-field-path`.

## What Agents Must Preserve

- Every editable text field uses `EditableText`.
- Every editable image field uses `EditableImage`.
- Every editable field path matches the JSON shape exactly.
- Every image is an object, not a bare string.
- Every template validates content with Zod.
- Production pages read local JSON.
- Preview pages can fetch draft content from Captive Studio.

## What Agents Must Avoid

- Hardcoded editable copy in JSX.
- Hardcoded editable image URLs in JSX.
- JSON-controlled layouts.
- JSON-controlled animation.
- JSON-controlled section order.
- Arbitrary client HTML.
- New field path conventions.
- One-off folder structures that cannot be reused.

## Standard Project Memory

Every client project should include:

```txt
agency/
  brief/
  refs/
  specs/
  prompts/
  runbooks/
```

This is where strategy, references, page specs, reusable prompts, and launch workflows live.

## Standard Build Order

1. Fill the client brief.
2. Gather references.
3. Synthesize brand direction.
4. Write page specs.
5. Build templates and schemas.
6. Add seed JSON.
7. Wire editable wrappers.
8. QA the site and editor contract.
9. Launch using the checklist.

## Current Status

This folder currently contains the canonical rules and project-memory structure. It is ready to receive either:

- A fresh Next.js client-site scaffold.
- A migrated client implementation.
- A reusable starter template for future clients.

