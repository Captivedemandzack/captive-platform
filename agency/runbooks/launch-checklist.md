# Runbook: Launch Checklist

Complete before launch.

## Content And Editing

- [ ] Every client-editable text field comes from JSON.
- [ ] Every editable text field uses `EditableText`.
- [ ] Every editable image field uses `EditableImage`.
- [ ] Every image uses `{ url, width, height, alt }`.
- [ ] Field paths match the JSON shape.
- [ ] Seed content exists for every template.

## Design And UX

- [ ] Mobile layout reviewed.
- [ ] Desktop layout reviewed.
- [ ] Navigation works.
- [ ] CTAs are clear.
- [ ] Forms are usable.
- [ ] No text overlaps or overflows.
- [ ] Images are visually consistent.

## SEO

- [ ] Every page has a unique title.
- [ ] Every page has a unique description.
- [ ] OG image exists where needed.
- [ ] Sitemap works.
- [ ] Robots file works.
- [ ] JSON-LD exists where relevant.

## Performance

- [ ] Images are optimized.
- [ ] `next/image` uses sensible `sizes`.
- [ ] Unnecessary client components avoided.
- [ ] Animations do not harm usability.

## QA

- [ ] No broken links.
- [ ] No obvious accessibility issues.
- [ ] Forms submit correctly.
- [ ] Preview route renders.
- [ ] Editor instrumentation sends ready/select/hover messages.

