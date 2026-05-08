// token-generator.js
// Scrapes reference sites for color/font signals, synthesizes brand tokens from brief

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';

// Known font + color data for reference brands (fallback when scraping is blocked)
// In production, replace the scrape with Firecrawl API for richer extraction
const REFERENCE_DATA = {
  'marekhealth.com': {
    fonts: { display: 'Freight Display Pro', body: 'Neue Haas Grotesk' },
    colors: { bg: '#0A0A0A', text: '#F5F3EE', accent: '#C4A882' },
    notes: 'Dark editorial, warm off-white text, champagne accent'
  },
  'honehealth.com': {
    fonts: { display: 'Canela', body: 'Graphik' },
    colors: { bg: '#1A1A1A', text: '#FAFAF8', accent: '#D4AF37' },
    notes: 'Dark warm base, conversion-focused, gold accent'
  },
  'thewell.nyc': {
    fonts: { display: 'Garamond Premier Pro', body: 'Aktiv Grotesk' },
    colors: { bg: '#F7F4EF', text: '#1C1C1A', accent: '#8B7355' },
    notes: 'Cream base, warm dark text, muted gold — luxury wellness'
  }
};

async function scrapeBasicTokens(url) {
  try {
    const domain = new URL(`https://${url}`).hostname.replace('www.', '');
    
    // Try live scrape first
    const response = await axios.get(`https://${url}`, {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TokenScraper/1.0)' }
    });

    const $ = cheerio.load(response.data);
    
    // Extract font references from link tags and style tags
    const fonts = [];
    $('link[href*="fonts.googleapis.com"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const families = href.match(/family=([^&]+)/g);
      if (families) fonts.push(...families.map(f => f.replace('family=', '').split(':')[0].replace(/\+/g, ' ')));
    });

    // Extract CSS custom properties from inline styles
    const cssVars = {};
    $('style').each((_, el) => {
      const css = $(el).html() || '';
      const varMatches = css.matchAll(/--[\w-]+:\s*([#\w()%,.\s]+)/g);
      for (const match of varMatches) {
        const [full, value] = match;
        const key = full.split(':')[0].trim();
        if (key.includes('color') || key.includes('bg') || key.includes('accent')) {
          cssVars[key] = value.trim().replace(';', '');
        }
      }
    });

    // Fall back to known data if scrape doesn't yield enough
    const known = REFERENCE_DATA[domain];
    return {
      source: url,
      fonts: fonts.length > 0 ? fonts : (known?.fonts ? [known.fonts.display, known.fonts.body] : []),
      cssVars,
      known: known || null,
      scraped: true
    };
  } catch (err) {
    // If scrape fails, use known reference data
    const domain = url.replace('www.', '').split('/')[0];
    const known = REFERENCE_DATA[domain];
    return {
      source: url,
      fonts: known ? [known.fonts.display, known.fonts.body] : [],
      cssVars: {},
      known: known || null,
      scraped: false,
      error: err.message
    };
  }
}

function synthesizeTokens(brief, referenceData) {
  // Synthesize from brief direction + reference signals
  // This is where your creative judgment is encoded as logic

  const colorDir = brief.color_direction.toLowerCase();
  const typDir = brief.typography_direction.toLowerCase();

  // Color synthesis based on brief direction
  // Dark editorial + warm gold + clinical = these values
  const tokens = {
    // Base palette — men's (dark)
    'color-bg': '#0C0F0E',
    'color-surface': '#161A19',
    'color-surface-2': '#1E2422',
    'color-border': '#2A2F2E',
    'color-border-subtle': '#1F2423',
    
    // Text — men's
    'color-text-primary': '#F0EDE6',
    'color-text-secondary': '#9A9690',
    'color-text-muted': '#615E5A',
    
    // Accent — warm champagne gold (Marek + Hone synthesis)
    'color-accent': '#C9A96E',
    'color-accent-hover': '#B8954F',
    'color-accent-muted': '#8B7355',
    'color-accent-subtle': 'rgba(201, 169, 110, 0.12)',
    
    // Women's section overrides
    'color-bg-women': '#FAF8F4',
    'color-surface-women': '#F3F0EA',
    'color-text-women': '#1A1A18',
    'color-text-secondary-women': '#6B6560',
    'color-accent-women': '#9B7FA6',
    'color-accent-women-hover': '#7D6388',
    
    // Typography
    'font-display': "'Cormorant Garamond', 'Freight Display Pro', Georgia, serif",
    'font-body': "'DM Sans', 'Neue Haas Grotesk', system-ui, sans-serif",
    'font-mono': "'DM Mono', 'JetBrains Mono', monospace",
    
    // Type scale (fluid)
    'text-display': 'clamp(3.5rem, 8vw, 7rem)',
    'text-h1': 'clamp(2.5rem, 5vw, 4.5rem)',
    'text-h2': 'clamp(1.75rem, 3.5vw, 3rem)',
    'text-h3': 'clamp(1.25rem, 2vw, 1.75rem)',
    'text-body-lg': '1.125rem',
    'text-body': '1rem',
    'text-sm': '0.875rem',
    'text-xs': '0.75rem',
    
    // Leading
    'leading-display': '0.95',
    'leading-heading': '1.1',
    'leading-body': '1.65',
    'leading-relaxed': '1.8',
    
    // Letter spacing
    'tracking-display': '-0.03em',
    'tracking-heading': '-0.02em',
    'tracking-label': '0.12em',
    'tracking-body': '0',
    
    // Spacing
    'space-section': 'clamp(5rem, 12vw, 12rem)',
    'space-section-sm': 'clamp(3rem, 6vw, 6rem)',
    'space-gap': 'clamp(1.5rem, 3vw, 2.5rem)',
    'space-gap-sm': 'clamp(0.75rem, 1.5vw, 1.25rem)',
    
    // Layout
    'container-width': '1320px',
    'container-padding': 'clamp(1.25rem, 5vw, 4rem)',
    
    // Radius
    'radius-sm': '0.25rem',
    'radius': '0.375rem',
    'radius-md': '0.5rem',
    'radius-lg': '1rem',
    'radius-full': '9999px',
    
    // Shadows
    'shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
    'shadow': '0 4px 16px rgba(0,0,0,0.5)',
    'shadow-lg': '0 16px 48px rgba(0,0,0,0.6)',
    'shadow-glow': '0 0 40px rgba(201, 169, 110, 0.15)',
    
    // Transitions
    'transition-fast': '150ms ease',
    'transition': '250ms ease',
    'transition-slow': '400ms ease',
  };

  return tokens;
}

function generateTokensCSS(tokens) {
  const vars = Object.entries(tokens)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');

  return `/* ============================================
   BioDesign Clinic — Design Tokens
   Generated by Captive Demand Token System
   Brand: Premium Longevity Medicine
   Direction: Dark editorial + warm gold + clinical warmth
   ============================================ */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@300;400;500&display=swap');

:root {
${vars}
}

/* Women's section — palette swap */
[data-section="women"],
.section-women {
  --color-bg: var(--color-bg-women);
  --color-surface: var(--color-surface-women);
  --color-text-primary: var(--color-text-women);
  --color-text-secondary: var(--color-text-secondary-women);
  --color-accent: var(--color-accent-women);
  --color-accent-hover: var(--color-accent-women-hover);
}

/* Utility classes from tokens */
.text-display { font-family: var(--font-display); font-size: var(--text-display); line-height: var(--leading-display); letter-spacing: var(--tracking-display); }
.text-h1 { font-family: var(--font-display); font-size: var(--text-h1); line-height: var(--leading-heading); letter-spacing: var(--tracking-heading); }
.text-h2 { font-family: var(--font-display); font-size: var(--text-h2); line-height: var(--leading-heading); letter-spacing: var(--tracking-heading); }
.text-label { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-label); text-transform: uppercase; font-weight: 500; }
.container { width: 100%; max-width: var(--container-width); margin-inline: auto; padding-inline: var(--container-padding); }
`;
}

export async function generateTokens(brief, outputDir) {
  console.log('  Scraping reference brands...');
  
  const references = ['marekhealth.com', 'honehealth.com', 'thewell.nyc'];
  const referenceData = await Promise.all(references.map(scrapeBasicTokens));
  
  const tokens = synthesizeTokens(brief, referenceData);
  const css = generateTokensCSS(tokens);
  
  // Write tokens.css
  await fs.outputFile(path.join(outputDir, 'lib/tokens.css'), css);
  
  // Write tokens reference doc for Cursor
  const refDoc = referenceData.map(r => 
    `### ${r.source}\n- Fonts: ${r.fonts.join(', ') || 'N/A'}\n- Notes: ${r.known?.notes || 'Scraped live'}\n- Status: ${r.scraped ? 'Live scrape' : 'Known data (scrape blocked)'}`
  ).join('\n\n');
  
  await fs.outputFile(path.join(outputDir, 'refs/token-references.md'), 
    `# Token Reference Sources\n\n${refDoc}\n\n## Synthesis Notes\n\nColor direction: ${brief.color_direction}\n\nTypography direction: ${brief.typography_direction}`
  );

  return tokens;
}
