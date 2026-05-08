#!/usr/bin/env node
// live-reference-hunter.js
// Internet-connected reference hunter for Captive client builds.
//
// Goal:
// 1. Read a client brief.
// 2. Generate reference search queries by vertical + page section needs.
// 3. Discover candidate websites using search APIs when keys are available.
// 4. Optionally screenshot full pages and detected sections with Playwright.
// 5. Catalog references by section type so Cursor can build from organized packets.
//
// Free/default behavior:
// - Uses curated seed references and writes manual search queries.
// - Scrapes public URLs with fetch when reachable.
// - Writes a screenshot queue if Playwright is not installed.
//
// Optional automation:
// - BRAVE_SEARCH_API_KEY, BING_SEARCH_API_KEY, or SERPAPI_API_KEY for live web discovery.
// - npm install -D playwright && npx playwright install chromium for screenshots.

import fs from "node:fs/promises";
import path from "node:path";

const SECTION_TYPES = {
  hero: {
    queries: ["hero section", "landing page hero", "above the fold"],
    keywords: ["hero", "headline", "start", "get started", "consult", "book"],
  },
  services: {
    queries: ["services section", "treatments section", "conditions section"],
    keywords: ["services", "treatments", "therapy", "programs", "care"],
  },
  "value-props": {
    queries: ["value proposition section", "why choose us section", "benefits section"],
    keywords: ["why", "benefits", "personalized", "physician", "protocol"],
  },
  process: {
    queries: ["how it works section", "process section", "steps section"],
    keywords: ["how it works", "steps", "process", "consult", "labs"],
  },
  pricing: {
    queries: ["pricing cards", "plans section", "membership pricing"],
    keywords: ["pricing", "plans", "membership", "cost", "per month"],
  },
  testimonials: {
    queries: ["testimonials section", "reviews section", "patient stories"],
    keywords: ["reviews", "testimonials", "patients", "stories", "rating"],
  },
  locations: {
    queries: ["locations page", "clinic locations section", "multi location healthcare"],
    keywords: ["locations", "clinic", "address", "directions", "near you"],
  },
  cta: {
    queries: ["call to action section", "consultation CTA", "booking CTA"],
    keywords: ["book", "schedule", "consultation", "start", "talk to"],
  },
};

const VERTICAL_SEEDS = {
  longevity: [
    "https://hims.com",
    "https://ro.co",
    "https://honehealth.com",
    "https://www.functionhealth.com",
    "https://superpower.com",
    "https://marekhealth.com",
    "https://www.maximustribe.com",
    "https://www.getmaple.ca",
  ],
  wellness: [
    "https://thewell.nyc",
    "https://www.sollishealth.com",
    "https://www.onepeloton.com",
    "https://www.eightsleep.com",
  ],
  medspa: [
    "https://www.idealimage.com",
    "https://www.milanlaser.com",
  ],
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseLimit(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function detectVerticals(brief) {
  const text = `${brief.industry || ""} ${brief.positioning || ""}`.toLowerCase();
  const verticals = [];
  if (/(trt|hormone|peptide|longevity|men'?s health|function health)/.test(text)) {
    verticals.push("longevity");
  }
  if (/(wellness|clinic|medical|health)/.test(text)) {
    verticals.push("wellness");
  }
  if (/(medspa|aesthetic|clinic)/.test(text)) {
    verticals.push("medspa");
  }
  return verticals.length ? verticals : ["longevity", "wellness"];
}

function buildSearchQueries(brief, firstTwoPages) {
  const industry = brief.industry || "premium healthcare clinic";
  const positioning = brief.positioning || "premium clinical website";
  const baseTerms = [
    industry,
    positioning,
    `${industry} website design`,
    `best ${industry} websites`,
    `premium ${industry} landing page`,
  ];

  const pageTerms = firstTwoPages.flatMap((page) => {
    return (page.sections || []).flatMap((section) => {
      const config = SECTION_TYPES[section] || SECTION_TYPES[normalizeSection(section)];
      if (!config) return [];
      return config.queries.map((query) => `${industry} ${query}`);
    });
  });

  const inspirationTerms = [
    "Awwwards wellness healthcare website",
    "godly website health landing page",
    "lapa ninja healthcare landing page",
    "land-book health landing page",
    "Refero design healthcare website",
  ];

  return unique([...baseTerms, ...pageTerms, ...inspirationTerms]).slice(0, 30);
}

function normalizeSection(section) {
  if (/hero/.test(section)) return "hero";
  if (/service|treatment/.test(section)) return "services";
  if (/why|benefit|value/.test(section)) return "value-props";
  if (/works|process|step/.test(section)) return "process";
  if (/price|plan/.test(section)) return "pricing";
  if (/testimonial|review/.test(section)) return "testimonials";
  if (/location/.test(section)) return "locations";
  if (/cta|consult|book/.test(section)) return "cta";
  return section;
}

function seedUrlsForBrief(brief) {
  const verticals = detectVerticals(brief);
  const fromVerticals = verticals.flatMap((vertical) => VERTICAL_SEEDS[vertical] || []);
  const fromBrief = (brief.reference_brands || []).flatMap((brand) => {
    const normalized = brand.toLowerCase();
    const known = Object.values(VERTICAL_SEEDS)
      .flat()
      .find((url) => getDomain(url).includes(slugify(normalized).replaceAll("-", "")) || url.toLowerCase().includes(normalized.split(" ")[0]));
    return known ? [known] : [];
  });
  return unique([...fromBrief, ...fromVerticals]);
}

async function searchBrave(query) {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "10");
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": key,
    },
  });
  if (!response.ok) throw new Error(`Brave search failed: ${response.status}`);
  const data = await response.json();
  return (data.web?.results || []).map((result) => ({
    url: result.url,
    title: result.title,
    description: result.description,
    source: "brave",
    query,
  }));
}

async function searchBing(query) {
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.bing.microsoft.com/v7.0/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "10");
  const response = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": key,
    },
  });
  if (!response.ok) throw new Error(`Bing search failed: ${response.status}`);
  const data = await response.json();
  return (data.webPages?.value || []).map((result) => ({
    url: result.url,
    title: result.name,
    description: result.snippet,
    source: "bing",
    query,
  }));
}

async function searchSerpApi(query) {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) return [];
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", key);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`SerpAPI search failed: ${response.status}`);
  const data = await response.json();
  return (data.organic_results || []).map((result) => ({
    url: result.link,
    title: result.title,
    description: result.snippet,
    source: "serpapi",
    query,
  }));
}

async function runSearches(queries) {
  const results = [];
  const searchers = [searchBrave, searchBing, searchSerpApi];
  const hasSearchKey = process.env.BRAVE_SEARCH_API_KEY || process.env.BING_SEARCH_API_KEY || process.env.SERPAPI_API_KEY;
  if (!hasSearchKey) return [];

  for (const query of queries.slice(0, 12)) {
    for (const searcher of searchers) {
      try {
        const found = await searcher(query);
        results.push(...found);
        if (found.length) break;
      } catch (error) {
        results.push({
          url: "",
          title: "Search error",
          description: error.message,
          source: "error",
          query,
        });
      }
    }
  }

  return results;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 CaptiveReferenceHunter/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}`);
  const html = await response.text();
  return html.slice(0, 1_000_000);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function extractMetaDescription(html) {
  return html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || "";
}

function extractColors(html) {
  return unique([...html.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => match[0].toUpperCase())).slice(0, 20);
}

function extractFonts(html) {
  const googleFonts = [...html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^"')&]+)/g)].map((match) =>
    decodeURIComponent(match[1]).replace(/\+/g, " ")
  );
  const cssFonts = [...html.matchAll(/font-family\s*:\s*([^;}"']+)/gi)].map((match) => match[1].trim());
  return unique([...googleFonts, ...cssFonts]).slice(0, 12);
}

function classifySections(text, pageSections) {
  const textLower = text.toLowerCase();
  const desired = unique(pageSections.map(normalizeSection));
  const all = desired.length ? desired : Object.keys(SECTION_TYPES);
  return all.filter((section) => {
    const config = SECTION_TYPES[section];
    if (!config) return false;
    return config.keywords.some((keyword) => textLower.includes(keyword));
  });
}

function scoreCandidate(candidate, brief, pageSections = []) {
  const haystack = `${candidate.title || ""} ${candidate.description || ""} ${candidate.textSample || ""} ${candidate.url || ""}`.toLowerCase();
  const terms = [
    ...(brief.industry || "").toLowerCase().split(/[^a-z0-9]+/),
    ...(brief.positioning || "").toLowerCase().split(/[^a-z0-9]+/),
    ...pageSections.map(normalizeSection),
  ].filter((term) => term.length > 3);

  const termScore = terms.reduce((score, term) => score + (haystack.includes(term) ? 2 : 0), 0);
  const sectionScore = (candidate.matchedSections || []).length * 4;
  const seedScore = candidate.seed ? 10 : 0;
  const titleScore = candidate.title ? 2 : 0;
  return termScore + sectionScore + seedScore + titleScore;
}

async function analyzeUrl(url, brief, pageSections, seed = false) {
  try {
    const html = await fetchHtml(url);
    const text = stripHtml(html);
    const candidate = {
      url,
      domain: getDomain(url),
      title: extractTitle(html),
      description: extractMetaDescription(html),
      colors: extractColors(html),
      fonts: extractFonts(html),
      matchedSections: classifySections(text, pageSections),
      textSample: text.slice(0, 700),
      seed,
      fetched: true,
    };
    candidate.score = scoreCandidate(candidate, brief, pageSections);
    return candidate;
  } catch (error) {
    const candidate = {
      url,
      domain: getDomain(url),
      title: "",
      description: "",
      colors: [],
      fonts: [],
      matchedSections: [],
      textSample: "",
      seed,
      fetched: false,
      error: error.message,
    };
    candidate.score = scoreCandidate(candidate, brief, pageSections);
    return candidate;
  }
}

async function loadPlaywright() {
  try {
    const playwright = await import("playwright");
    return playwright.chromium;
  } catch {
    return null;
  }
}

function scoreInternalLink(link, brief, normalizedSections) {
  const haystack = `${link.href} ${link.text} ${link.label}`.toLowerCase();
  const industryWords = `${brief.industry || ""} ${brief.positioning || ""}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 4);

  const pageWords = (brief.pages_to_build || [])
    .flatMap((page) => [page.name, ...(page.sections || [])])
    .map((word) => slugify(word));

  const priorityWords = [
    "service",
    "services",
    "treatment",
    "treatments",
    "pricing",
    "plans",
    "locations",
    "location",
    "about",
    "team",
    "testimonials",
    "reviews",
    "how-it-works",
    "process",
    "men",
    "women",
    "trt",
    "testosterone",
    "hormone",
    "peptide",
    "weight-loss",
    "book",
    "contact",
    ...normalizedSections,
    ...industryWords,
    ...pageWords,
  ];

  return unique(priorityWords).reduce((score, word) => {
    if (!word) return score;
    return score + (haystack.includes(word) ? 2 : 0);
  }, 0);
}

async function discoverInternalPages(page, candidate, brief, normalizedSections, maxPagesPerSite) {
  const currentUrl = page.url();
  const origin = new URL(currentUrl).origin;
  const host = new URL(currentUrl).hostname.replace(/^www\./, "");

  const links = await page.locator("a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute("href") || "",
      text: anchor.textContent?.replace(/\s+/g, " ").trim() || "",
      label: anchor.getAttribute("aria-label") || "",
    }))
  );

  const normalized = links
    .map((link) => {
      try {
        const url = new URL(link.href, origin);
        url.hash = "";
        return { ...link, href: url.toString() };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((link) => {
      const url = new URL(link.href);
      const linkHost = url.hostname.replace(/^www\./, "");
      if (linkHost !== host) return false;
      if (/mailto:|tel:|javascript:/i.test(link.href)) return false;
      if (/\.(pdf|zip|jpg|jpeg|png|webp|gif|svg)$/i.test(url.pathname)) return false;
      return true;
    })
    .map((link) => ({
      ...link,
      score: scoreInternalLink(link, brief, normalizedSections),
    }))
    .filter((link) => link.score > 0)
    .sort((a, b) => b.score - a.score);

  const urls = unique([candidate.url, ...normalized.map((link) => link.href)]);
  return urls.slice(0, maxPagesPerSite);
}

async function preparePageForScreenshots(page) {
  await page.waitForTimeout(700);
  await page.evaluate(async () => {
    const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
    const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const viewport = window.innerHeight || 900;
    for (let y = 0; y < height; y += Math.floor(viewport * 0.8)) {
      window.scrollTo(0, y);
      await sleep(80);
    }
    window.scrollTo(0, 0);
    await sleep(200);
  });
}

function guessSectionType(text, meta = {}) {
  const haystack = `${text || ""} ${meta.id || ""} ${meta.className || ""} ${meta.tagName || ""}`.toLowerCase();
  for (const [section, config] of Object.entries(SECTION_TYPES)) {
    if (config.keywords.some((keyword) => haystack.includes(keyword))) {
      return section;
    }
  }
  if (/hero|headline|above.fold|intro/.test(haystack)) return "hero";
  if (/footer/.test(haystack)) return "footer";
  if (/nav|menu/.test(haystack)) return "navigation";
  return "section";
}

function sectionSelector() {
  return [
    "main > section",
    "section",
    "article",
    "header",
    "[data-section]",
    "[class*='hero']",
    "[class*='Hero']",
    "[class*='pricing']",
    "[class*='Pricing']",
    "[class*='testimonial']",
    "[class*='Testimonial']",
    "[class*='service']",
    "[class*='Service']",
    "[class*='location']",
    "[class*='Location']",
    "[class*='cta']",
    "[class*='CTA']",
  ].join(", ");
}

function isDuplicateBox(box, boxes) {
  return boxes.some((seen) => {
    const xClose = Math.abs(seen.x - box.x) < 8;
    const yClose = Math.abs(seen.y - box.y) < 8;
    const wClose = Math.abs(seen.width - box.width) < 8;
    const hClose = Math.abs(seen.height - box.height) < 8;
    return xClose && yClose && wClose && hClose;
  });
}

async function capturePageSections(page, screenshotDir, baseName, sourceUrl, maxSectionsPerPage) {
  const handles = await page.locator(sectionSelector()).elementHandles();
  const captured = [];
  const seenBoxes = [];
  let index = 0;

  for (const handle of handles) {
    if (index >= maxSectionsPerPage) break;

    const box = await handle.boundingBox();
    if (!box || box.width < 420 || box.height < 220) continue;
    if (box.height > 5000) continue;
    if (isDuplicateBox(box, seenBoxes)) continue;

    const meta = await handle.evaluate((el) => ({
      text: el.textContent?.replace(/\s+/g, " ").trim().slice(0, 500) || "",
      id: el.id || "",
      className: typeof el.className === "string" ? el.className : "",
      tagName: el.tagName || "",
    }));

    const type = guessSectionType(meta.text, meta);
    const fileName = `${baseName}-${String(index + 1).padStart(2, "0")}-${type}.png`;
    const filePath = path.join(screenshotDir, fileName);

    try {
      await handle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await handle.screenshot({ path: filePath, timeout: 7000 });
      captured.push({
        file: fileName,
        type,
        url: sourceUrl,
        text: meta.text,
        width: Math.round(box.width),
        height: Math.round(box.height),
      });
      seenBoxes.push(box);
      index += 1;
    } catch {
      // Some animated/canvas/cross-origin sections cannot be element-screenshotted.
    }
  }

  return captured;
}

function renderScreenshotIndex(records) {
  const rows = records
    .map(
      (record) =>
        `| ${record.site} | ${record.pageTitle} | ${record.type} | ${record.file} | ${record.url} | ${(record.text || "").replaceAll("|", "/").slice(0, 120)} |`
    )
    .join("\n");

  return `# Screenshot Index

Screenshots are organized by reference site, internal page, and inferred section type.

| Site | Page | Type | File | URL | Text Sample |
|---|---|---|---|---|---|
${rows}
`;
}

async function screenshotCandidates(candidates, outputDir, brief, normalizedSections) {
  const chromium = await loadPlaywright();
  if (!chromium) {
    const queue = candidates
      .map((candidate) => `- [ ] ${candidate.url} -> ${candidate.domain}.png`)
      .join("\n");
    await writeFile(
      path.join(outputDir, "screenshots/Screenshot-Queue.md"),
      `# Screenshot Queue

Playwright is not installed, so screenshots were not captured automatically.

Install when ready:

\`\`\`bash
npm install -D playwright
npx playwright install chromium
\`\`\`

Then rerun:

\`\`\`bash
node cd-kickoff-system/live-reference-hunter.js cd-kickoff-system/brief.json .
\`\`\`

## URLs

${queue}
`
    );
    return { mode: "queue", count: candidates.length };
  }

  const maxSites = parseLimit(process.env.MAX_REFERENCE_SITES, 10);
  const maxPagesPerSite = parseLimit(process.env.MAX_REFERENCE_PAGES_PER_SITE, 4);
  const maxSectionsPerPage = parseLimit(process.env.MAX_SECTIONS_PER_PAGE, 14);
  const screenshotDir = path.join(outputDir, "screenshots");
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1400 },
    deviceScaleFactor: 1,
  });

  let count = 0;
  const records = [];

  for (const candidate of candidates.slice(0, maxSites)) {
    try {
      console.log(`  Capturing site: ${candidate.domain}`);
      await page.goto(candidate.url, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await preparePageForScreenshots(page);

      const internalPages = await discoverInternalPages(page, candidate, brief, normalizedSections, maxPagesPerSite);

      for (const internalUrl of internalPages) {
        try {
          console.log(`    Page: ${internalUrl}`);
          await page.goto(internalUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
          await preparePageForScreenshots(page);

          const urlPath = new URL(page.url()).pathname;
          const pageKey = slugify(urlPath === "/" ? "homepage" : urlPath);
          const baseName = `${slugify(candidate.domain)}-${pageKey}`;
          const title = await page.title().catch(() => pageKey);
          const fullPageFile = `${baseName}-fullpage.png`;

          await page.screenshot({
            path: path.join(screenshotDir, fullPageFile),
            fullPage: true,
            timeout: 12_000,
          });

          records.push({
            site: candidate.domain,
            pageTitle: title || pageKey,
            type: "full-page",
            file: fullPageFile,
            url: page.url(),
            text: "",
          });

          const sections = await capturePageSections(page, screenshotDir, baseName, page.url(), maxSectionsPerPage);
          console.log(`      Sections captured: ${sections.length}`);
          sections.forEach((section) => {
            records.push({
              site: candidate.domain,
              pageTitle: title || pageKey,
              ...section,
            });
          });
        } catch (error) {
          console.log(`      Capture skipped: ${error.message}`);
          records.push({
            site: candidate.domain,
            pageTitle: "capture-error",
            type: "error",
            file: "",
            url: internalUrl,
            text: error.message,
          });
        }
      }

      count += 1;
    } catch (error) {
      candidate.screenshotError = error.message;
    }
  }

  await writeFile(path.join(screenshotDir, "Screenshot-Index.md"), renderScreenshotIndex(records));

  await writeFile(
    path.join(outputDir, "screenshot-summary.md"),
    `# Screenshot Summary

Captured screenshots for ${count} reference sites.

Limits:

- Sites: ${maxSites}
- Pages per site: ${maxPagesPerSite}
- Sections per page: ${maxSectionsPerPage}

Index:

\`screenshots/Screenshot-Index.md\`
`
  );

  await browser.close();
  return { mode: "screenshots", count, records: records.length };
}

function renderCandidateTable(candidates) {
  return `| Score | URL | Matched Sections | Notes |
|---:|---|---|---|
${candidates
  .map((candidate) => {
    const sections = candidate.matchedSections?.join(", ") || "manual review";
    const notes = candidate.fetched ? candidate.description || candidate.title || "Fetched" : `Fetch issue: ${candidate.error}`;
    return `| ${candidate.score} | ${candidate.url} | ${sections} | ${notes.replaceAll("|", "/")} |`;
  })
  .join("\n")}`;
}

function renderSectionCatalog(sectionCatalog) {
  return Object.entries(sectionCatalog)
    .map(([section, candidates]) => {
      return `## ${section}

${renderCandidateTable(candidates)}
`;
    })
    .join("\n");
}

function renderQueries(queries) {
  return `# Live Reference Search Queries

Use these manually if no search API key is configured.

${queries.map((query) => `- ${query}`).join("\n")}
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
  const firstTwoPages = (brief.pages_to_build || []).slice(0, 2);
  const pageSections = unique(firstTwoPages.flatMap((page) => page.sections || []));
  const normalizedSections = unique(pageSections.map(normalizeSection));
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = path.join(projectRoot, "agency/refs/live-hunt", timestamp);

  const queries = buildSearchQueries(brief, firstTwoPages);
  await writeFile(path.join(outputDir, "search-queries.md"), renderQueries(queries));

  const seedUrls = seedUrlsForBrief(brief);
  const searchResults = await runSearches(queries);
  const discoveredUrls = searchResults.map((result) => result.url).filter(Boolean);
  const urls = unique([...seedUrls, ...discoveredUrls]).slice(0, 30);

  const analyzed = [];
  for (const url of urls) {
    analyzed.push(await analyzeUrl(url, brief, normalizedSections, seedUrls.includes(url)));
  }

  const candidates = analyzed.sort((a, b) => b.score - a.score);
  const topCandidates = candidates.slice(0, 12);
  const sectionCatalog = {};

  for (const section of normalizedSections) {
    sectionCatalog[section] = candidates
      .filter((candidate) => candidate.matchedSections?.includes(section) || candidate.seed)
      .slice(0, 8);
  }

  await writeFile(path.join(outputDir, "candidates.json"), JSON.stringify(candidates, null, 2));
  await writeFile(
    path.join(outputDir, "candidate-catalog.md"),
    `# Candidate Reference Catalog

Client: ${brief.client}

Search APIs active: ${process.env.BRAVE_SEARCH_API_KEY || process.env.BING_SEARCH_API_KEY || process.env.SERPAPI_API_KEY ? "yes" : "no"}

## Top Candidates

${renderCandidateTable(topCandidates)}

# Section Catalog

${renderSectionCatalog(sectionCatalog)}
`
  );

  await writeFile(
    path.join(projectRoot, "agency/refs/live-reference-latest.md"),
    `# Latest Live Reference Hunt

Output folder:

\`${outputDir}\`

## Top Candidates

${renderCandidateTable(topCandidates)}

## Next Step

Review the candidates and copy the best section references into:

- \`agency/refs/reference-sites.md\`
- \`agency/refs/layout-patterns.md\`
- \`agency/refs/section-packets/\`
`
  );

  const screenshotResult = await screenshotCandidates(topCandidates, outputDir, brief, normalizedSections);

  console.log(`Live reference hunt complete for ${brief.client}`);
  console.log(`Candidates: ${candidates.length}`);
  console.log(`Output: ${path.resolve(outputDir)}`);
  console.log(`Screenshot mode: ${screenshotResult.mode} (${screenshotResult.count})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
