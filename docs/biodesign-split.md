# BioDesign Split Notes

This folder began as the BioDesign working folder, then became the seed for `captive-platform`.

Use this document to separate reusable platform files from BioDesign client-specific files.

## Keep In `captive-platform`

These are reusable and should stay in the platform repo:

- `AGENTS.md`
- `CANONICAL_ARCHITECTURE.md`
- `client-site-spec.md`
- `.cursor/rules/project-architecture.mdc`
- `.cursor/rules/captive-studio-spec.mdc`
- `.cursor/rules/content-editing.mdc`
- `.cursor/rules/design-system.mdc`
- `.cursor/rules/research-workflow.mdc`
- `agency/prompts/`
- `agency/runbooks/new-client-build.md`
- `agency/runbooks/design-reference-workflow.md`
- `agency/runbooks/image-production-workflow.md`
- `agency/runbooks/launch-checklist.md`
- `agency/runbooks/manual-agent-workflow.md`
- `agency/runbooks/palette-adjacency-workflow.md`
- `agency/runbooks/reference-kickoff-workflow.md`
- `agency/specs/template-homepage.md`
- `agency/specs/template-service-page.md`
- `agency/specs/template-location-page.md`
- `agency/specs/editable-field-map-example.md`
- `cd-kickoff-system/`

## BioDesign-Specific Files

These should be copied into the future `biodesign-clinic` repo:

- `BioDesign_Day1_Build_Plan.md`
- `.cursor/rules/biodesign-project.mdc`
- `.cursor/rules/medical-compliance.mdc`
- `.cursor/rules/voice-and-tone.mdc`
- `.cursor/prompts/homepage-design-mockup.md`
- `.cursor/prompts/location-tampa-design-mockup.md`
- `agency/brief/intake.md`
- `agency/brief/brand-notes.md`
- `agency/brief/image-style-guide.md`
- `agency/audit/compliance-notes.md`
- `agency/refs/biodesign-reference-direction.md`
- `agency/refs/brand-hack-synthesis.md`
- `agency/refs/design-variables.css`
- `agency/refs/layout-patterns.md`
- `agency/refs/live-reference-latest.md`
- `agency/refs/palette-adjacent-brands.md`
- `agency/refs/reference-sites.md`
- `agency/specs/homepage.md`
- `agency/specs/homepage-mockup-plan.md`
- `agency/specs/location-page.md`
- `agency/specs/location-tampa-mockup-plan.md`
- `agency/runbooks/biodesign-day1-build-plan.md`
- `cd-kickoff-system/brief.json`

## Generated Research Outputs

These are useful for BioDesign but should not become permanent platform defaults:

- `agency/refs/live-hunt/`
- `agency/refs/palette-hunt/`
- `agency/refs/section-packets/`

For a platform repo, keep example outputs only if they are intentionally documented as examples.

## Recommended Repo Split

```txt
captive-platform/
  reusable system, rules, runbooks, scripts, starter template

biodesign-clinic/
  actual BioDesign Next.js website, BioDesign brief, BioDesign refs, BioDesign content
```

## Practical Next Step

After this folder is renamed to `captive-platform`, create a separate `biodesign-clinic` repo by copying:

1. The platform starter rules.
2. The BioDesign-specific files above.
3. A fresh Next.js app scaffold.

