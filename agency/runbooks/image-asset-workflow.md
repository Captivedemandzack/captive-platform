# Image Asset Workflow

Use this workflow before building high-visibility sections like heroes, service intros, location pages, team sections, and final CTAs.

## 1. Harvest Existing Client Assets

Run:

```bash
node cd-kickoff-system/live-site-asset-harvester.js cd-kickoff-system/brief.json .
```

This pulls public images from the client's current site, saves them to:

```txt
public/client-assets/source/
```

And writes the review catalog:

```txt
agency/refs/client-assets.md
agency/refs/client-assets.json
```

## 2. Review Assets

Mark each useful asset as:

- Keep: real clinic, team, location, brand, or lifestyle imagery that fits the new direction.
- Reference only: useful subject/composition, but needs to be regenerated or retouched.
- Replace: low-quality, outdated, off-brand, noncompliant, or generic imagery.

Do not wire raw harvested assets into finished sections until they pass creative and compliance review.

## 3. Produce Missing Images

For missing assets:

- Use `agency/brief/image-style-guide.md` for the visual direction.
- Use Lummi for references when needed.
- Use Google Nano Banana or the approved image tool to generate new options.
- Save approved images to `public/images/{client}/`.

## 4. Wire Approved Images

Approved images should be referenced only through content JSON image fields:

```json
{
  "url": "/images/{client}/hero-primary.webp",
  "width": 1600,
  "height": 2000,
  "alt": "Approved hero image for the client site"
}
```

Next.js owns crop, layout, overlays, responsive behavior, and art direction. JSON owns only the selected image, size, and alt text.

## 5. Quality Gate

Before accepting the section:

- No broken images.
- No remote placeholder image services.
- No shirtless/gym/bodybuilding/supplement imagery.
- No image that implies a guaranteed medical outcome.
- Image treatment matches the reference screenshots and approved client palette.
- Mobile crop is checked, not assumed.
