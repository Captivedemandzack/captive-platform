# Captive Platform

This is the internal Captive Demand platform for starting scalable, custom-coded, Captive Studio-compatible client websites.

Use this repo to improve the reusable system. Do not build individual client websites directly in this repo.

## What Lives Here

- Agent rules and architecture docs.
- Captive Studio client-site integration specs.
- Reusable agency memory folders.
- Reference screenshot and palette-adjacency automation.
- Starter prompts, specs, and runbooks.

## How It Works

```txt
captive-platform = reusable factory
client repo = one real website
brief.json = client input
scripts = research automation
agency/refs = generated/reference output
.cursor/rules = agent guardrails
Cursor/Codex = builder
Captive Studio = client editing layer
```

## Starting A Client Project

Create a new client repo by copying the starter system from this repo, then customize the brief inside the client repo.

Client-specific work belongs in the client repo, not here.

## Key Commands

Run inside a client repo after customizing `cd-kickoff-system/brief.json`:

```bash
node cd-kickoff-system/palette-adjacency-hunter.js cd-kickoff-system/brief.json .
node cd-kickoff-system/live-reference-hunter.js cd-kickoff-system/brief.json .
node cd-kickoff-system/reference-kickoff.js cd-kickoff-system/brief.json .
```
