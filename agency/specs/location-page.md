# BioDesign Location Page Spec

Use this for the first location page, preferably Tampa.

## Page Goal

Give local patients confidence that BioDesign has a nearby clinical team and a simple consultation path.

## Local Audience

Tampa first, then Orlando, Melbourne, and Lake Mary.

## Section Plan

| Section | Purpose | Editable Fields | Design Notes |
|---|---|---|---|
| Location hero | Establish city relevance | `hero.*`, `location.*` | Warm clinical image, local clarity |
| Contact details | Make action easy | `location.address`, `location.phone`, `location.hours` | Mobile tap actions |
| Services | Show available care | `services[*]` | Same service taxonomy as homepage |
| Reviews | Build local trust | `testimonials[*]` | Human-review copy |
| Map/directions | Reduce friction | `location.mapHref` | Code owns map/embed behavior |
| FAQ | Answer local questions | `faqs[*]` | Schema-ready |
| CTA | Convert | `cta.*` | Free consultation |

## Editable Field Map

| Field path | Type | Notes |
|---|---|---|
| `metadata.title` | text | Unique per city |
| `metadata.description` | text | Unique per city |
| `hero.headline` | text | City-specific |
| `hero.subhead` | text | Consultation-first |
| `hero.image` | image | Local/clinic image |
| `location.name` | text | Example: Tampa |
| `location.address` | text | Confirm before launch |
| `location.phone` | text | Confirm before launch |
| `location.hours` | text | Confirm before launch |
| `location.mapHref` | link | Confirm before launch |
| `services[0].title` | text | Available service |
| `services[0].body` | text | Short description |
| `faqs[0].question` | text | Local FAQ |
| `faqs[0].answer` | text | Schema-ready answer |
| `cta.buttonLabel` | text | Consultation-first |

## Acceptance Criteria

- [ ] Local information is accurate.
- [ ] Page has unique metadata.
- [ ] Page can support LocalBusiness or MedicalClinic schema.
- [ ] Editable wrappers are used.
- [ ] Mobile contact actions are easy to use.
