# Captive Platform

This repo is the internal Captive Demand platform seed for building scalable, custom-coded, Captive Studio-compatible client websites.

It contains:

- Agent rules and architecture decisions.
- Captive Studio client-site integration specs.
- Agency project-memory folders.
- Reference screenshot and palette-adjacency automation.
- BioDesign as the first working example of the system.

## Mental Model

```txt
captive-platform = reusable agency operating system
client repo = one real website
brief.json = project input
scripts = research automation
agency/refs = research output
.cursor/rules = agent guardrails
Cursor/Codex = builder
Captive Studio = client editing layer
```

## Main Files

- `AGENTS.md`: master rules for AI coding agents.
- `CANONICAL_ARCHITECTURE.md`: plain-English architecture decision.
- `client-site-spec.md`: Captive Studio technical integration contract.
- `.cursor/rules/`: Cursor guardrails.
- `agency/`: project memory, research, specs, prompts, and runbooks.
- `cd-kickoff-system/`: automation scripts for briefs, references, screenshots, and palette hacking.

## Key Commands

Run from the repo root:

```bash
node cd-kickoff-system/live-reference-hunter.js cd-kickoff-system/brief.json .
node cd-kickoff-system/palette-adjacency-hunter.js cd-kickoff-system/brief.json .
node cd-kickoff-system/reference-kickoff.js cd-kickoff-system/brief.json .
```

## Current Status

This repo started as the BioDesign website folder. It is being converted into the reusable `captive-platform` repo.

BioDesign-specific context should eventually be copied into a separate `biodesign-clinic` client repo.

