#!/usr/bin/env node
// palette-adjacency-hunter.js
// Finds and ranks color-adjacent brand references from screenshots.
//
// This intentionally separates palette research from industry research:
// - Palette references can come from any industry.
// - They only need to share useful color DNA with the client brand.
// - Layout/section references are handled by live-reference-hunter.js.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_CANDIDATES = [
  {
    name: "Aman",
    url: "https://www.aman.com",
    category: "luxury hospitality",
    why: "Warm neutrals, black restraint, premium quiet spacing.",
  },
  {
    name: "Rosewood Hotels",
    url: "https://www.rosewoodhotels.com",
    category: "luxury hospitality",
    why: "Premium hospitality palette and refined editorial image treatment.",
  },
  {
    name: "Six Senses",
    url: "https://www.sixsenses.com",
    category: "luxury wellness hospitality",
    why: "Wellness-adjacent warmth without generic spa softness.",
  },
  {
    name: "Aesop",
    url: "https://www.aesop.com",
    category: "premium skincare",
    why: "Sophisticated earth neutrals, serif/sans restraint, product trust.",
  },
  {
    name: "Augustinus Bader",
    url: "https://augustinusbader.com",
    category: "premium skincare",
    why: "Clinical-luxury balance and premium treatment/product framing.",
  },
  {
    name: "La Prairie",
    url: "https://www.laprairie.com",
    category: "luxury skincare",
    why: "Black/cream/luxury science palette behavior.",
  },
  {
    name: "Equinox",
    url: "https://www.equinox.com",
    category: "premium fitness",
    why: "Dark premium body/health positioning; useful only if softened away from gym energy.",
  },
  {
    name: "Sollis Health",
    url: "https://www.sollishealth.com",
    category: "premium healthcare",
    why: "Luxury healthcare tone and restrained trust presentation.",
  },
  {
    name: "The Well NYC",
    url: "https://thewell.nyc",
    category: "luxury wellness",
    why: "Warm cream wellness system and quiet premium palette.",
  },
  {
    name: "Hone Health",
    url: "https://honehealth.com",
    category: "longevity healthcare",
    why: "Directly adjacent category with warm clinical conversion design.",
  },
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hexToRgb(hex) {
  const cleaned = hex.replace("#", "").trim();
  const full = cleaned.length === 3 ? cleaned.split("").map((char) => char + char).join("") : cleaned;
  const int = Number.parseInt(full.slice(0, 6), 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function rgbDistance(a, b) {
  // Weighted perceptual-ish RGB distance. Good enough for ranking website palettes.
  const rMean = (a.r + b.r) / 2;
  const r = a.r - b.r;
  const g = a.g - b.g;
  const blue = a.b - b.b;
  return Math.sqrt((2 + rMean / 256) * r * r + 4 * g * g + (2 + (255 - rMean) / 256) * blue * blue);
}

function luminance({ r, g, b }) {
  const transform = (value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function colorRole(rgb) {
  const l = luminance(rgb);
  if (l < 0.08) return "deep-base";
  if (l < 0.22) return "dark-surface";
  if (l > 0.86) return "light-base";
  if (rgb.r > rgb.b + 25 && rgb.g > rgb.b + 5 && rgb.r > 130 && rgb.g > 95) return "warm-accent";
  if (rgb.r > rgb.g && rgb.b > rgb.g && rgb.r > 120) return "mauve-accent";
  return "support";
}

async function loadPlaywright() {
  try {
    const playwright = await import("playwright");
    return playwright.chromium;
  } catch {
    return null;
  }
}

async function screenshotCandidate(page, candidate, screenshotDir) {
  const file = `${slugify(candidate.name)}-palette-source.png`;
  const filePath = path.join(screenshotDir, file);
  await page.goto(candidate.url, { waitUntil: "domcontentloaded", timeout: 18_000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: filePath, fullPage: false, timeout: 12_000 });
  return filePath;
}

function quantize(value, size = 24) {
  return Math.max(0, Math.min(255, Math.round(value / size) * size));
}

async function extractDominantColors(imagePath, maxColors = 8) {
  const { data, info } = await sharp(imagePath)
    .resize({ width: 420, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const counts = new Map();
  const channels = info.channels;

  for (let index = 0; index < data.length; index += channels * 6) {
    const rgb = {
      r: quantize(data[index]),
      g: quantize(data[index + 1]),
      b: quantize(data[index + 2]),
    };
    const l = luminance(rgb);
    // Skip near-random mid-grays that usually come from antialiasing and photos.
    const saturation = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
    if (l > 0.96 || (saturation < 8 && l > 0.25 && l < 0.75)) continue;
    const key = rgbToHex(rgb);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([hex, count]) => ({
      hex,
      count,
      role: colorRole(hexToRgb(hex)),
    }));
}

function scorePalette(colors, targetColors) {
  const extracted = colors.map((color) => hexToRgb(color.hex));
  const targets = targetColors.map(hexToRgb);

  if (!extracted.length) return 0;

  const distances = targets.map((target) => Math.min(...extracted.map((color) => rgbDistance(target, color))));
  const similarity = distances.reduce((sum, distance) => sum + Math.max(0, 100 - distance / 3), 0) / distances.length;

  const roles = new Set(colors.map((color) => color.role));
  const roleBonus =
    (roles.has("deep-base") ? 10 : 0) +
    (roles.has("light-base") ? 8 : 0) +
    (roles.has("warm-accent") ? 10 : 0) +
    (roles.has("mauve-accent") ? 6 : 0);

  return Math.round(similarity + roleBonus);
}

function renderPaletteSwatches(colors) {
  return colors.map((color) => `\`${color.hex}\` (${color.role})`).join(", ");
}

function synthesizeTokens(results, targetColors) {
  const allColors = results.flatMap((result) => result.colors);
  const byRole = (role) => allColors.find((color) => color.role === role)?.hex;

  return {
    "color-bg": targetColors[0] || byRole("deep-base") || "#0C0F0E",
    "color-surface": "#161A19",
    "color-surface-reference": byRole("dark-surface") || "#2A2F2E",
    "color-text-primary": targetColors[2] || byRole("light-base") || "#F0EDE6",
    "color-accent": targetColors[1] || byRole("warm-accent") || "#C9A96E",
    "color-accent-reference": byRole("warm-accent") || targetColors[1] || "#C9A96E",
    "color-bg-women": targetColors[3] || "#FAF8F4",
    "color-accent-women": byRole("mauve-accent") || targetColors[4] || "#9B7FA6",
  };
}

function renderReport(brief, results, tokenDraft) {
  return `# Palette Adjacency Report

Client: ${brief.client}

## Starting Client Colors

${(brief.brand_colors || []).map((color) => `- \`${color}\``).join("\n")}

## Ranked Palette-Adjacent References

| Rank | Score | Brand | Category | URL | Extracted Palette | Why It Helps |
|---:|---:|---|---|---|---|---|
${results
  .map(
    (result, index) =>
      `| ${index + 1} | ${result.score} | ${result.name} | ${result.category} | ${result.url} | ${renderPaletteSwatches(result.colors)} | ${result.why} |`
  )
  .join("\n")}

## Draft Token Direction

These are a conservative synthesis. Reference colors influence supporting choices, but the client's own palette remains the anchor.

| Token | Value |
|---|---|
${Object.entries(tokenDraft)
  .map(([token, value]) => `| \`--${token}\` | \`${value}\` |`)
  .join("\n")}

## Creative Director Notes

- Use this for color logic only. Do not copy these brands' layouts unless they also appear in the section-reference catalog.
- Prefer palette behavior over exact hex values.
- Validate final colors against the real client logo.
- Check contrast before committing tokens to production.
`;
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}

async function main() {
  const briefPath = process.argv[2] || "cd-kickoff-system/brief.json";
  const projectRoot = process.argv[3] || ".";
  const raw = await fs.readFile(briefPath, "utf8");
  const brief = JSON.parse(raw);
  const targetColors = brief.brand_colors || ["#0C0F0E", "#C9A96E", "#F0EDE6", "#FAF8F4", "#9B7FA6"];
  const outputDir = path.join(projectRoot, "agency/refs/palette-hunt", new Date().toISOString().replace(/[:.]/g, "-"));
  const screenshotDir = path.join(outputDir, "screenshots");

  const chromium = await loadPlaywright();
  if (!chromium) {
    throw new Error("Playwright is required. Run: npm install -D playwright && npx playwright install chromium");
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const results = [];

  for (const candidate of DEFAULT_CANDIDATES) {
    try {
      console.log(`Palette capture: ${candidate.name}`);
      const screenshotPath = await screenshotCandidate(page, candidate, screenshotDir);
      const colors = await extractDominantColors(screenshotPath);
      const score = scorePalette(colors, targetColors);
      results.push({
        ...candidate,
        screenshot: path.relative(projectRoot, screenshotPath),
        colors,
        score,
      });
    } catch (error) {
      results.push({
        ...candidate,
        screenshot: "",
        colors: [],
        score: 0,
        error: error.message,
      });
    }
  }

  await browser.close();

  results.sort((a, b) => b.score - a.score);
  const tokenDraft = synthesizeTokens(results, targetColors);

  await writeFile(path.join(outputDir, "palette-adjacency-report.md"), renderReport(brief, results, tokenDraft));
  await writeFile(path.join(outputDir, "palette-adjacency.json"), JSON.stringify({ brief: brief.client, targetColors, results, tokenDraft }, null, 2));
  await writeFile(
    path.join(projectRoot, "agency/refs/palette-adjacent-brands.md"),
    renderReport(brief, results, tokenDraft)
  );

  console.log(`Palette adjacency complete.`);
  console.log(`Output: ${path.resolve(outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
