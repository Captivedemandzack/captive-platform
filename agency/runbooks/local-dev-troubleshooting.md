# Local Dev Troubleshooting

Use this when the browser looks like raw HTML, CSS is missing, or the terminal shows strange `.next` module errors.

## Most Common Cause

The Next.js dev server and a production build can fight if they both write to `.next`. Client projects should configure development to use `.next` and production verification to use `.next-build`. If a browser still looks broken, a previous dev server may be serving stale output or a tab may have cached an old dev asset path. Example stale stylesheet path:

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
- Use `bun run build` for verification. In properly configured client repos it should write to `.next-build`, not `.next`, so it should not corrupt the local browser preview.
- If CSS disappears, do not judge the design until the dev server has been restarted cleanly.

## Output Directories

- Dev server: `.next`
- Production build verification: `.next-build`
