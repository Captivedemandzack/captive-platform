# Service Page Template Spec

## Purpose

Present one service with enough clarity, trust, and conversion structure to drive consultation requests.

## Suggested Sections

- Hero.
- Who this is for.
- Benefits or outcomes.
- Process.
- Provider or credibility section.
- FAQ.
- CTA.

## Suggested Editable Fields

```txt
hero.headline
hero.subhead
hero.image
hero.ctaLabel
overview.headline
overview.body
benefits[0].title
benefits[0].body
process[0].title
process[0].body
faqs[0].question
faqs[0].answer
cta.headline
cta.body
cta.buttonLabel
```

## Design Notes

Service pages can be highly custom-coded. Keep diagrams, animation, sticky panels, and interactive explanation patterns in code.

## Acceptance Criteria

- CTA is clear and repeated.
- FAQ content can generate JSON-LD.
- Content does not make unsupported claims.
- All editable fields use the Captive Studio wrappers.

