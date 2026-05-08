# Runbook: Manual Agent Workflow

Use this when you do not have autonomous sub-agents available.

The principle is simple: each AI tool gets one narrow job, and the useful output gets saved into the repo.

## 1. Reference Research

Open `agency/prompts/reference-hunter.md`.

Paste it into ChatGPT, Claude, or Gemini with the client brief.

Save the result to:

```txt
agency/refs/reference-sites.md
```

## 2. Brand Hack

Open `agency/prompts/brand-hack.md`.

Paste in:

- Client brief.
- Reference site notes.
- Existing brand constraints.

Save the result to:

```txt
agency/refs/brand-hacks.md
```

## 3. Page Copy

Open `agency/prompts/copywriter.md`.

Paste in:

- Client brief.
- Page spec.
- Brand direction.
- Compliance constraints.

Convert the output into structured JSON content.

## 4. Image Direction

Open `agency/prompts/image-director.md`.

Use Lummi for reference discovery and Nano Banana for generation when needed.

Save the image plan into:

```txt
agency/brief/image-style-guide.md
```

## 5. Build With Codex Or Cursor

Ask the coding agent to build against:

- `AGENTS.md`
- `CANONICAL_ARCHITECTURE.md`
- `.cursor/rules/`
- Relevant `agency/specs/`

The agent should not improvise a new architecture.

## 6. QA

Open `agency/prompts/qa-reviewer.md`.

Use it to inspect:

- Visual quality.
- Mobile responsiveness.
- Editor wiring.
- SEO.
- Accessibility.

Then complete `agency/runbooks/launch-checklist.md`.

