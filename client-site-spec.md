# Captive Studio — Client Site Build Specification

**Purpose:** This document defines exactly how to build a client website that is compatible with the Captive Studio editor portal. Follow these patterns precisely — deviating will break the AI editing, draft preview, publish pipeline, and click-to-edit functionality.

Read this entire document before writing any code.

## Setup instruction (Cursor must do this automatically)

After the initial build is complete, copy this entire spec into the project at `.cursor/rules/captive-studio-spec.md` with the following YAML frontmatter prepended at the very top of the file:

```yaml
---
description: Captive Studio client site integration contract. Follow these rules for all templates, pages, editable primitives, and content files.
globs: ["src/templates/**", "src/lib/editable/**", "src/app/preview/**", "content/**", "src/app/**/page.tsx"]
alwaysApply: false
---
```

This ensures every future Cursor session in this project automatically enforces the Captive Studio integration contract when working on templates, pages, editable primitives, or content files. **Do not skip this step.**

---

## 1. Architecture Overview

The client site is a **standard Next.js application** that:

- **Reads published content from local JSON files** in a `/content/` directory (committed to the repo by Captive Studio on every publish)
- **Exposes a `/preview/[pageId]` route** that the Captive Studio editor loads in an iframe for real-time draft preview
- **Communicates with the editor portal via postMessage** for click-to-edit, field selection, and refresh signals
- **Is deployed on Vercel**, connected to its GitHub repo — Captive Studio pushes content JSON on publish, Vercel auto-rebuilds

The client site does **NOT**:
- Have its own database tables or Supabase schema — all content management lives in Captive Studio's Supabase
- Handle authentication for editing — the editor portal does that
- Allow clients to add/remove/reorder sections — templates have fixed structure

---

## 2. Tech Stack

- **Next.js 14+** with App Router and TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for any UI primitives (buttons, inputs, dialogs)
- **Zod** for content schema validation

That's it. No Supabase client, no Clerk, no database.

---

## 3. Content Flow

```
Client edits in Captive Studio
    → AI agent updates draft in Supabase
    → Client clicks "Publish"
    → Captive Studio writes to Supabase (pages, page_versions, etc.)
    → Captive Studio pushes /content/{slug}.json to this repo via GitHub API
    → Vercel detects the commit and rebuilds the site
    → Site reads JSON files at build time and renders pages
```

### Content file format

Captive Studio pushes files to `/content/{slug}.json` with this exact shape:

```json
{
  "templateKey": "homepage",
  "slug": "home",
  "metadata": {
    "title": "Welcome to Acme Corp",
    "description": "We build amazing things.",
    "ogImage": { "url": "https://cdn.example.com/og.jpg", "width": 1200, "height": 630, "alt": "Acme Corp" }
  },
  "content": {
    "hero": {
      "headline": "Build Better Products",
      "subhead": "We help companies ship faster.",
      "image": { "url": "https://cdn.example.com/hero.jpg", "width": 1920, "height": 1080, "alt": "Hero" },
      "ctaLabel": "Get Started",
      "ctaHref": "/contact"
    },
    "features": [
      {
        "title": "Fast Delivery",
        "body": "Ship in weeks, not months.",
        "icon": { "url": "https://cdn.example.com/icon1.svg", "width": 64, "height": 64, "alt": "Speed" }
      }
    ]
  },
  "publishedAt": "2026-04-28T21:30:00.000Z"
}
```

- `templateKey` — identifies which React component to render
- `slug` — the URL path for the page
- `metadata` — SEO fields (title, description, OG tags)
- `content` — the actual page content, structured as nested JSON matching the template schema
- `publishedAt` — ISO timestamp of the publish event

---

## 4. Directory Structure

```
/content/                    ← JSON files pushed by Captive Studio (gittracked)
  home.json
  about.json
  services.json
/src/
  /app/
    /[slug]/page.tsx         ← Dynamic production routes
    /preview/[pageId]/
      page.tsx               ← Editor preview route (iframe target)
    layout.tsx
    page.tsx                 ← Homepage (reads content/home.json)
  /templates/
    /homepage/
      schema.ts              ← Zod schema
      component.tsx          ← React component
    /about/
      schema.ts
      component.tsx
    registry.ts              ← Maps templateKey → { schema, component }
  /lib/
    /content/
      loader.ts              ← Reads /content/*.json at build time
    /editable/
      editable-text.tsx      ← EditableText primitive
      editable-image.tsx     ← EditableImage primitive
      editor-mode-context.tsx
      editor-instrumentation.tsx
  next.config.js
  .env.local
```

---

## 5. Content Loading

### Build-time loading (production pages)

Read JSON files from `/content/` at build time using `fs`. This gives you static pages that are fast and cheap to serve.

```ts
// src/lib/content/loader.ts
import fs from "fs";
import path from "path";

export interface ContentFile {
  templateKey: string;
  slug: string;
  metadata: Record<string, unknown>;
  content: Record<string, unknown>;
  publishedAt: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getContentBySlug(slug: string): ContentFile | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getAllContent(): ContentFile[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), "utf-8")));
}
```

### Preview route loading (draft content)

The preview route at `/preview/[pageId]` is loaded inside an iframe by the Captive Studio editor. When `?editor=1` is present, it must fetch **draft** content from Captive Studio's API — not from the local JSON files. This gives real-time preview as the AI agent makes edits.

```ts
// src/app/preview/[pageId]/page.tsx
import { notFound } from "next/navigation";
import { templates } from "@/templates/registry";
import { EditorModeProvider } from "@/lib/editable/editor-mode-context";
import { EditorInstrumentation } from "@/lib/editable/editor-instrumentation";

const CMS_API_BASE = process.env.CAPTIVE_STUDIO_API_URL!;
// e.g. "https://www.captivestudio.ai"

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ editor?: string }>;
}) {
  const { pageId } = await params;
  const { editor } = await searchParams;
  const editorMode = editor === "1";

  const res = await fetch(`${CMS_API_BASE}/api/pages/${pageId}/diff`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();
  const data = await res.json();

  const source = editorMode ? data.draft : data.published;
  if (!source) return notFound();

  // templateKey lives at the top level of the response
  const templateKey = source.templateKey || data.templateKey;
  const template = templates[templateKey];
  if (!template) return notFound();

  const parsed = template.schema.safeParse(source.content);
  if (!parsed.success) return notFound();

  const Component = template.component;

  return (
    <EditorModeProvider value={editorMode}>
      {editorMode && <EditorInstrumentation />}
      <Component content={parsed.data} />
    </EditorModeProvider>
  );
}
```

**Important:** The `/api/pages/[id]/diff` endpoint on Captive Studio does **not** require authentication — it accepts unauthenticated server-side fetches. Page IDs are UUIDs and the content is publicly displayed, so no auth token is needed. The response shape is:

```json
{
  "templateKey": "homepage",
  "published": { "content": { ... }, "metadata": { ... } },
  "draft": { "content": { ... }, "metadata": { ... } }
}
```

---

## 6. Template System

### Schema (`src/templates/homepage/schema.ts`)

```ts
import { z } from "zod";

const ImageField = z.object({
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
});

export const homepageSchema = z.object({
  hero: z.object({
    headline: z.string().min(5).max(80),
    subhead: z.string().min(10).max(200),
    image: ImageField,
    ctaLabel: z.string().min(2).max(30),
    ctaHref: z.string(),
  }),
  features: z.array(z.object({
    title: z.string().min(3).max(60),
    body: z.string().min(10).max(300),
    icon: ImageField.optional(),
  })).min(1).max(6),
  // ... more sections
});

export type HomepageContent = z.infer<typeof homepageSchema>;
```

### Component (`src/templates/homepage/component.tsx`)

```tsx
import { EditableText } from "@/lib/editable/editable-text";
import { EditableImage } from "@/lib/editable/editable-image";
import type { HomepageContent } from "./schema";

export default function Homepage({ content }: { content: HomepageContent }) {
  return (
    <main>
      <section>
        <EditableImage field="hero.image" value={content.hero.image} priority />
        <EditableText as="h1" field="hero.headline" value={content.hero.headline} />
        <EditableText as="p" field="hero.subhead" value={content.hero.subhead} />
        <a href={content.hero.ctaHref}>
          <EditableText field="hero.ctaLabel" value={content.hero.ctaLabel} />
        </a>
      </section>

      <section>
        {content.features.map((feature, i) => (
          <div key={i}>
            {feature.icon && (
              <EditableImage field={`features[${i}].icon`} value={feature.icon} />
            )}
            <EditableText as="h3" field={`features[${i}].title`} value={feature.title} />
            <EditableText as="p" field={`features[${i}].body`} value={feature.body} />
          </div>
        ))}
      </section>
    </main>
  );
}
```

### Registry (`src/templates/registry.ts`)

```ts
import { homepageSchema } from "./homepage/schema";
import HomepageComponent from "./homepage/component";

export const templates: Record<string, {
  schema: z.ZodSchema;
  component: React.ComponentType<{ content: any }>;
  label: string;
}> = {
  homepage: {
    schema: homepageSchema,
    component: HomepageComponent,
    label: "Homepage",
  },
  // Add more templates here
};
```

---

## 7. Editable Primitives

These components are **critical**. Every piece of user-editable content must be wrapped in one of these. They emit `data-field-path` and `data-field-type` attributes in editor mode, which the Captive Studio AI agent uses to identify what can be edited.

### EditableText

```tsx
"use client";
import { useEditorMode } from "./editor-mode-context";

interface Props {
  field: string;
  value: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function EditableText({ field, value, as: Tag = "span", className }: Props) {
  const editorMode = useEditorMode();
  return (
    <Tag
      className={className}
      data-field-path={editorMode ? field : undefined}
      data-field-type={editorMode ? "text" : undefined}
    >
      {value}
    </Tag>
  );
}
```

### EditableImage

```tsx
"use client";
import Image from "next/image";
import { useEditorMode } from "./editor-mode-context";

interface ImageValue {
  url: string;
  width: number;
  height: number;
  alt: string;
}

interface Props {
  field: string;
  value: ImageValue;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function EditableImage({ field, value, className, priority, sizes }: Props) {
  const editorMode = useEditorMode();
  return (
    <div
      className={className}
      data-field-path={editorMode ? field : undefined}
      data-field-type={editorMode ? "image" : undefined}
    >
      <Image
        src={value.url}
        width={value.width}
        height={value.height}
        alt={value.alt}
        priority={priority}
        sizes={sizes}
      />
    </div>
  );
}
```

### Editor Mode Context

```tsx
"use client";
import { createContext, useContext, type ReactNode } from "react";

const EditorModeContext = createContext(false);

export function EditorModeProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) {
  return (
    <EditorModeContext.Provider value={value}>
      {children}
    </EditorModeContext.Provider>
  );
}

export function useEditorMode() {
  return useContext(EditorModeContext);
}
```

---

## 8. Editor Instrumentation Script

This client component renders **only** in the `/preview/[pageId]?editor=1` route. It enables click-to-edit, hover highlighting, and communication with the Captive Studio editor portal via postMessage.

```tsx
"use client";
import { useEffect } from "react";

export function EditorInstrumentation() {
  useEffect(() => {
    const PORTAL_ORIGIN = process.env.NEXT_PUBLIC_PORTAL_ORIGIN!;

    let hoveredEl: HTMLElement | null = null;
    let selectedEl: HTMLElement | null = null;

    function applyOutline(el: HTMLElement) {
      el.style.outline = "2px solid #FF6400";
      el.style.outlineOffset = "2px";
    }

    function clearOutline(el: HTMLElement) {
      el.style.outline = "";
      el.style.outlineOffset = "";
    }

    function findFieldElement(target: EventTarget | null): HTMLElement | null {
      if (!(target instanceof HTMLElement)) return null;
      return target.closest("[data-field-path]");
    }

    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest("a");
      if (link) e.preventDefault();

      const el = findFieldElement(e.target);
      if (!el) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      window.parent.postMessage(
        {
          type: "select",
          fieldPath: el.dataset.fieldPath,
          fieldType: el.dataset.fieldType,
          boundingRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        },
        PORTAL_ORIGIN
      );
    }

    function onSubmit(e: SubmitEvent) {
      e.preventDefault();
    }

    function onMouseOver(e: MouseEvent) {
      const el = findFieldElement(e.target);
      if (!el || el === hoveredEl) return;

      if (hoveredEl && hoveredEl !== selectedEl) {
        clearOutline(hoveredEl);
      }

      hoveredEl = el;
      if (el !== selectedEl) {
        applyOutline(el);
      }

      window.parent.postMessage(
        { type: "hover", fieldPath: el.dataset.fieldPath },
        PORTAL_ORIGIN
      );
    }

    function onMouseOut(e: MouseEvent) {
      const el = findFieldElement(e.target);
      if (!el) return;

      const related = findFieldElement(e.relatedTarget);
      if (related === el) return;

      if (el === hoveredEl) {
        hoveredEl = null;
      }
      if (el !== selectedEl) {
        clearOutline(el);
      }

      window.parent.postMessage(
        { type: "hover", fieldPath: null },
        PORTAL_ORIGIN
      );
    }

    function onMessage(e: MessageEvent) {
      if (e.origin !== PORTAL_ORIGIN) return;
      const data = e.data;
      if (!data || typeof data.type !== "string") return;

      switch (data.type) {
        case "refresh":
          window.location.reload();
          break;
        case "highlight": {
          if (selectedEl) {
            clearOutline(selectedEl);
          }
          const el = document.querySelector(
            `[data-field-path="${data.fieldPath}"]`
          ) as HTMLElement | null;
          if (el) {
            selectedEl = el;
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            applyOutline(el);
          }
          break;
        }
        case "clearHighlight": {
          if (selectedEl) {
            clearOutline(selectedEl);
            selectedEl = null;
          }
          break;
        }
      }
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("message", onMessage);

    document.querySelectorAll("video[autoplay]").forEach((v) =>
      (v as HTMLVideoElement).pause()
    );

    window.parent.postMessage({ type: "ready" }, PORTAL_ORIGIN);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return null;
}
```

---

## 9. postMessage Contract

These message types are the communication protocol between the Captive Studio editor portal and the client site iframe. Both sides validate the message origin.

**Portal → iframe (client site listens):**
- `{ type: "refresh" }` — reload the page to show updated draft
- `{ type: "highlight", fieldPath: string }` — outline a specific field
- `{ type: "clearHighlight" }` — remove all outlines

**Iframe → portal (client site sends):**
- `{ type: "ready" }` — fired on mount, signals the preview is loaded
- `{ type: "select", fieldPath: string, fieldType: string, boundingRect: { x, y, width, height } }` — user clicked a field
- `{ type: "hover", fieldPath: string }` — user hovered a field

---

## 10. Field Path Convention

Field paths use dot notation for object access and bracket notation for array indices. These paths are the contract between the content JSON, the editable primitives, and the Captive Studio AI agent.

Examples:
- `hero.headline` — the hero section's headline
- `hero.image` — the hero section's image
- `features[0].title` — the first feature's title
- `features[2].body` — the third feature's body text
- `cta.buttonLabel` — the CTA section's button label

**These must match exactly** between the content JSON structure, the Zod schema, and the `field` prop on EditableText/EditableImage.

---

## 11. Image Conventions

Every image field is stored as `{ url, width, height, alt }`. Never as a bare URL string.

Images are hosted on Bunny CDN and referenced by full URL. The client site doesn't upload images — Captive Studio handles uploads and stores the URLs in the content JSON.

Configure Next.js to allow Bunny CDN images:

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.b-cdn.net" },
    ],
  },
};
```

---

## 12. SEO Metadata

Every content JSON includes a `metadata` object. Use Next.js `generateMetadata` to set page title, description, and OG tags from this data.

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const content = getContentBySlug(params.slug);
  if (!content) return {};

  const meta = content.metadata as {
    title?: string;
    description?: string;
    ogImage?: { url: string; width: number; height: number; alt: string };
  };

  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.ogImage
      ? { images: [{ url: meta.ogImage.url, width: meta.ogImage.width, height: meta.ogImage.height }] }
      : undefined,
  };
}
```

---

## 13. Environment Variables

```
NEXT_PUBLIC_PORTAL_ORIGIN=https://www.captivestudio.ai
CAPTIVE_STUDIO_API_URL=https://www.captivestudio.ai
```

- `NEXT_PUBLIC_PORTAL_ORIGIN` — used by the editor instrumentation script for postMessage origin validation (client-side)
- `CAPTIVE_STUDIO_API_URL` — used by the preview route to fetch draft content from Captive Studio's API (server-side)

---

## 14. Production Routing

Production pages read from local JSON files. Use a catch-all route or individual routes.

```tsx
// src/app/[slug]/page.tsx
import { getContentBySlug, getAllContent } from "@/lib/content/loader";
import { templates } from "@/templates/registry";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllContent()
    .filter((c) => c.slug !== "home")
    .map((c) => ({ slug: c.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getContentBySlug(slug);
  if (!content) notFound();

  const template = templates[content.templateKey];
  if (!template) notFound();

  const parsed = template.schema.safeParse(content.content);
  if (!parsed.success) {
    return <div>Content validation error</div>;
  }

  const Component = template.component;
  return <Component content={parsed.data} />;
}
```

---

## 15. What NOT to Do

- **Do not hardcode any user-visible text in JSX.** All copy comes from the content JSON.
- **Do not hardcode image URLs.** All images come from content JSON as `{ url, width, height, alt }`.
- **Do not skip the EditableText/EditableImage wrappers.** Without them, the editor portal can't see the field, and click-to-edit breaks.
- **Do not invent new field path formats.** Use dotted paths with bracket indices: `hero.image`, `features[2].title`.
- **Do not store images as bare URL strings.** Always `{ url, width, height, alt }`.
- **Do not read from Supabase on production pages.** Production reads from local JSON files only. Only the `/preview/[pageId]` route calls Captive Studio's API.
- **Do not add authentication to production routes.** The site is public. Only `/preview/*` is loaded by the editor.
- **Do not allow clients to add/remove sections.** Templates have fixed structure.

---

## 16. Acceptance Checklist

Before considering the site done:

- [ ] Every user-visible string comes from content JSON, not hardcoded in JSX
- [ ] Every editable element is wrapped in `EditableText` or `EditableImage`
- [ ] Every template is registered in `registry.ts`
- [ ] `/content/` directory exists with at least one seed JSON file
- [ ] `/preview/[pageId]?editor=1` renders with click-to-edit instrumentation
- [ ] `postMessage({ type: "ready" })` fires on preview mount
- [ ] Field clicks send `{ type: "select", fieldPath, ... }` to parent
- [ ] `NEXT_PUBLIC_PORTAL_ORIGIN` is set and used for origin validation
- [ ] `next.config.js` allows Bunny CDN images (`*.b-cdn.net`)
- [ ] Production routes use `generateMetadata` from content JSON
- [ ] Schema validation errors render an error state, not a crash

---

## 17. Seed Content

For the initial build, create seed JSON files in `/content/` with placeholder content. These will be overwritten by Captive Studio on first publish. The seed files let you develop and test the templates without needing Captive Studio connected.

Example `/content/home.json`:

```json
{
  "templateKey": "homepage",
  "slug": "home",
  "metadata": {
    "title": "Acme Corp — Build Better Products",
    "description": "We help companies ship faster with modern web solutions."
  },
  "content": {
    "hero": {
      "headline": "Build Better Products",
      "subhead": "We help companies ship faster with modern web solutions.",
      "image": {
        "url": "https://placehold.co/1920x1080/FF6400/white?text=Hero+Image",
        "width": 1920,
        "height": 1080,
        "alt": "Hero image"
      },
      "ctaLabel": "Get Started",
      "ctaHref": "/contact"
    },
    "features": [
      {
        "title": "Fast Delivery",
        "body": "Ship in weeks, not months. Our streamlined process gets you to market faster.",
        "icon": {
          "url": "https://placehold.co/64x64/333/white?text=⚡",
          "width": 64,
          "height": 64,
          "alt": "Speed icon"
        }
      },
      {
        "title": "Modern Stack",
        "body": "Built on cutting-edge technology for performance and reliability.",
        "icon": {
          "url": "https://placehold.co/64x64/333/white?text=🔧",
          "width": 64,
          "height": 64,
          "alt": "Tech icon"
        }
      },
      {
        "title": "Ongoing Support",
        "body": "Dedicated team for bug fixes, updates, and continuous improvement.",
        "icon": {
          "url": "https://placehold.co/64x64/333/white?text=🛟",
          "width": 64,
          "height": 64,
          "alt": "Support icon"
        }
      }
    ]
  },
  "publishedAt": "2026-04-28T00:00:00.000Z"
}
```

---

**End of specification. The Captive Studio editor portal depends on this contract — field paths, data attributes, postMessage types, and content JSON shape must match exactly.**
