# Local Dev Troubleshooting

Use this when the browser looks like raw HTML, CSS is missing, or the terminal shows strange `.next` module errors.

## Most Common Cause

The Next.js dev server and a production build both write to `.next`. If `bun run build` runs while `bun run dev` is still active, the dev server can serve stale stylesheet paths like:

```txt
/_next/static/css/app/layout.css
```

That makes the page look like unstyled HTML even though the React markup is correct.

## Fix

Stop the dev server first:

```txt
Ctrl-C
```

Then run:

```bash
bun run dev:fresh
```

Open:

```txt
http://localhost:3000
```

Hard refresh the browser if it still looks stale.

## Working Rule

- Use `bun run dev` or `bun run dev:fresh` while designing.
- Use `bun run build` only for verification, ideally after stopping the dev server.
- If CSS disappears, do not judge the design until the dev server has been restarted cleanly.
