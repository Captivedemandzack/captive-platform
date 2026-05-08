# Runbook: New Client Build

Use this workflow for every new client site.

## 1. Create Project Memory

Fill:

- `agency/brief/intake.md`
- `agency/brief/image-style-guide.md`
- `agency/refs/reference-sites.md`
- `agency/refs/brand-hacks.md`

## 2. Define Page Specs

Create or adapt specs in `agency/specs/`.

Minimum starter specs:

- Homepage.
- Service page.
- Location page, if local SEO matters.
- Contact or booking page.

## 3. Build Templates

For each template:

- Create a Zod schema.
- Create a React component.
- Register it in the template registry.
- Create seed JSON content.
- Wrap all editable fields.

## 4. QA

Check:

- Responsive design.
- Editable field wrappers.
- SEO metadata.
- Form behavior.
- Image optimization.
- Accessibility.

## 5. Launch

Complete `agency/runbooks/launch-checklist.md`.

