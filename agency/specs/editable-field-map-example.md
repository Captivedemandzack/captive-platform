# Editable Field Map Example

Use this pattern inside page specs when defining what a client can edit.

## Example: Homepage

| Field path | Type | Editable by client | Notes |
|---|---|---|---|
| `metadata.title` | text | Yes | SEO title |
| `metadata.description` | text | Yes | SEO description |
| `hero.eyebrow` | text | Yes | Optional |
| `hero.headline` | text | Yes | Main H1 |
| `hero.subhead` | text | Yes | Short supporting copy |
| `hero.image` | image | Yes | Must use image object |
| `hero.primaryCtaLabel` | text | Yes | Keep short |
| `hero.primaryCtaHref` | link | Yes | Internal route preferred |
| `trust.items[0].label` | text | Yes | Fixed item count unless spec says otherwise |
| `features[0].title` | text | Yes | Fixed card layout |
| `features[0].body` | text | Yes | Fixed card layout |
| `cta.headline` | text | Yes | Final CTA |
| `cta.buttonLabel` | text | Yes | Keep action-oriented |

## Non-Editable Decisions

These stay in code:

- Number of homepage sections.
- Section order.
- Layout.
- Animation.
- Color palette.
- Typography.
- Component variants.
- Conversion hierarchy.

