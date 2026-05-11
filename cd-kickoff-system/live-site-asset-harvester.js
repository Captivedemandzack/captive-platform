#!/usr/bin/env node
// live-site-asset-harvester.js
// Pulls image assets from the client's existing site, saves usable files locally,
// and writes a catalog for the design/code agent.

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function ensureUrl(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function normalizeUrl(raw, baseUrl) {
  if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) return null;
  const cleaned = raw.trim().replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
  try {
    return new URL(cleaned, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseSrcset(srcset, baseUrl) {
  return String(srcset || "")
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .map((url) => normalizeUrl(url, baseUrl))
    .filter(Boolean);
}

function extensionFromContentType(contentType, fallbackUrl) {
  if (/image\/jpeg/.test(contentType)) return ".jpg";
  if (/image\/png/.test(contentType)) return ".png";
  if (/image\/webp/.test(contentType)) return ".webp";
  if (/image\/svg/.test(contentType)) return ".svg";
  if (/image\/gif/.test(contentType)) return ".gif";
  const ext = path.extname(new URL(fallbackUrl).pathname);
  return ext && ext.length <= 6 ? ext : ".img";
}

function rankAsset(asset) {
  let score = 0;
  const text = `${asset.url} ${asset.alt || ""} ${asset.source || ""}`.toLowerCase();
  if (/hero|banner|cover|about|team|doctor|clinic|patient|consult|wellness|provider/.test(text)) score += 30;
  if (/logo|icon|favicon|sprite|tracking|pixel/.test(text)) score -= 40;
  if ((asset.width || 0) >= 900 || (asset.height || 0) >= 700) score += 30;
  if ((asset.bytes || 0) >= 50_000) score += 20;
  if ((asset.bytes || 0) < 8_000) score -= 30;
  return score;
}

async function readBrief(briefPath) {
  const raw = await fs.readFile(briefPath, "utf8");
  return JSON.parse(raw);
}

function getTargetUrls(brief, cliUrls) {
  const fromBrief = [
    brief.current_website,
    brief.current_site,
    brief.destination_url,
    ...(brief.current_site_urls || []),
    ...(brief.existing_urls || []),
  ];
  return [...new Set([...cliUrls, ...fromBrief].map(ensureUrl).filter(Boolean))];
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function getAttr(tag, attr) {
  const match = tag.match(new RegExp(`${attr}=[\"']([^\"']+)[\"']`, "i"));
  return match ? match[1] : "";
}

function collectImageCandidates(html, pageUrl) {
  const candidates = [];

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgTags) {
    const src = normalizeUrl(getAttr(tag, "src"), pageUrl);
    const srcset = parseSrcset(getAttr(tag, "srcset"), pageUrl);
    const alt = getAttr(tag, "alt") || "";
    const width = Number.parseInt(getAttr(tag, "width") || "", 10) || null;
    const height = Number.parseInt(getAttr(tag, "height") || "", 10) || null;
    for (const url of [src, ...srcset].filter(Boolean)) {
      candidates.push({ url, alt, width, height, source: "img" });
    }
  }

  const sourceTags = html.match(/<source\b[^>]*>/gi) || [];
  for (const tag of sourceTags) {
    for (const url of parseSrcset(getAttr(tag, "srcset"), pageUrl)) {
      candidates.push({ url, alt: "", width: null, height: null, source: "source[srcset]" });
    }
  }

  const metaTags = html.match(/<meta\b[^>]*(?:og:image|twitter:image)[^>]*>/gi) || [];
  for (const tag of metaTags) {
    const url = normalizeUrl(getAttr(tag, "content"), pageUrl);
    if (url) candidates.push({ url, alt: "Social preview image", width: null, height: null, source: "meta" });
  }

  const styleAttrs = html.match(/style=["'][^"']+["']/gi) || [];
  for (const attr of styleAttrs) {
    const style = attr.replace(/^style=["']|["']$/gi, "");
    const matches = [...style.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
    for (const match of matches) {
      const url = normalizeUrl(match[1], pageUrl);
      if (url) candidates.push({ url, alt: "", width: null, height: null, source: "inline background" });
    }
  }

  const seen = new Set();
  return candidates.filter((candidate) => {
    if (!candidate.url || seen.has(candidate.url)) return false;
    seen.add(candidate.url);
    return /^https?:\/\//.test(candidate.url);
  });
}

async function downloadAsset(candidate, outputDir) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const response = await fetch(candidate.url, {
    headers: { "User-Agent": USER_AGENT },
    signal: controller.signal,
  });
  clearTimeout(timeout);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentType = String(response.headers.get("content-type") || "");
  if (!contentType.startsWith("image/")) return null;

  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = crypto.createHash("sha1").update(candidate.url).digest("hex").slice(0, 10);
  const domain = slugify(new URL(candidate.url).hostname.replace(/^www\./, ""));
  const ext = extensionFromContentType(contentType, candidate.url);
  const filename = `${domain}-${hash}${ext}`;
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, bytes);

  return {
    ...candidate,
    localPath: filePath,
    publicPath: `/client-assets/source/${filename}`,
    bytes: bytes.length,
    contentType,
    width: candidate.width,
    height: candidate.height,
  };
}

function catalogMarkdown(projectName, sourceUrls, assets) {
  const rows = assets
    .map((asset) => {
      const size = [asset.width, asset.height].filter(Boolean).join("x") || "unknown";
      const score = rankAsset(asset);
      return `| ${score} | ${size} | ${asset.publicPath} | ${asset.source} | ${asset.alt || ""} | ${asset.url} |`;
    })
    .join("\n");

  return `# Client Asset Catalog

Project: ${projectName}

Source URLs:

${sourceUrls.map((url) => `- ${url}`).join("\n")}

## How To Use This

Use this catalog to decide which existing client assets should be kept, replaced, or used as references for generated imagery.

- Keep: usable real clinic/team/location/product images.
- Replace: low-quality, off-brand, outdated, or compliance-risk images.
- Generate: missing hero/lifestyle/section imagery using the image style guide.

Approved production assets should move from \`public/client-assets/source/\` into the relevant \`public/images/{client}/\` folder and then be referenced from \`content/*.json\`.

## Candidates

| Score | Size | Local Public Path | Source | Alt | Original URL |
|---:|---|---|---|---|---|
${rows}
`;
}

async function main() {
  const briefPath = process.argv[2] || "cd-kickoff-system/brief.json";
  const projectRoot = process.argv[3] || ".";
  const cliUrls = process.argv.slice(4).filter((arg) => !arg.startsWith("--"));
  const brief = await readBrief(briefPath);
  const sourceUrls = getTargetUrls(brief, cliUrls);

  if (!sourceUrls.length) {
    throw new Error("No source URLs found. Add destination_url/current_site to the brief or pass URLs as arguments.");
  }

  const publicDir = path.join(projectRoot, "public", "client-assets", "source");
  const refsDir = path.join(projectRoot, "agency", "refs");
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(refsDir, { recursive: true });

  const downloaded = [];
  for (const sourceUrl of sourceUrls) {
    console.log(`Harvesting ${sourceUrl}`);
    try {
      const html = await fetchHtml(sourceUrl);
      const candidates = collectImageCandidates(html, sourceUrl);
      for (const candidate of candidates.slice(0, 80)) {
        try {
          const asset = await downloadAsset(candidate, publicDir);
          if (asset) downloaded.push(asset);
        } catch (error) {
          console.warn(`Skipped ${candidate.url}: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`Could not harvest ${sourceUrl}: ${error.message}`);
    }
  }

  const uniqueAssets = [...new Map(downloaded.map((asset) => [asset.publicPath, asset])).values()]
    .sort((a, b) => rankAsset(b) - rankAsset(a));

  await fs.writeFile(path.join(refsDir, "client-assets.json"), JSON.stringify(uniqueAssets, null, 2));
  await fs.writeFile(
    path.join(refsDir, "client-assets.md"),
    catalogMarkdown(brief.project || brief.client || "client", sourceUrls, uniqueAssets),
  );

  console.log(`Saved ${uniqueAssets.length} assets to ${publicDir}`);
  console.log("Wrote agency/refs/client-assets.md and agency/refs/client-assets.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
