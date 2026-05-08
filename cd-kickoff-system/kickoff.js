#!/usr/bin/env node
// kickoff.js — Run this once to set up the entire project
// Usage: node kickoff.js ./brief.json ./output-dir [GEMINI_API_KEY]
// 
// What it does in order:
// 1. Reads your brief.json
// 2. Scaffolds the full project folder structure
// 3. Generates tokens.css from reference brand research
// 4. Builds section reference docs + ready-to-paste Cursor prompts
// 5. Generates images (auto if API key provided, manual prompt file if not)
// 6. Prints a summary of what was built and what to do next

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

// Import pipeline steps
import { scaffoldProject } from './scaffolder.js';
import { generateTokens } from './token-generator.js';
import { generateSectionRefs } from './section-references.js';
import { generateImages } from './image-generator.js';

async function step(label, fn) {
  process.stdout.write(chalk.blue(`\n→ ${label}...`));
  try {
    const result = await fn();
    console.log(chalk.green(' ✓'));
    return result;
  } catch (err) {
    console.log(chalk.red(' ✗'));
    console.error(chalk.red(`  Error: ${err.message}`));
    return null;
  }
}

async function main() {
  const briefPath = process.argv[2] || './brief.json';
  const outputDir = process.argv[3] || './project-output';
  const geminiKey = process.argv[4] || process.env.GEMINI_API_KEY || null;

  console.log(chalk.bold('\n🚀 Captive Demand — Project Kickoff System\n'));
  console.log(chalk.gray(`Brief: ${briefPath}`));
  console.log(chalk.gray(`Output: ${outputDir}`));
  console.log(chalk.gray(`Gemini: ${geminiKey ? 'API key provided — auto-generating images' : 'No key — writing manual prompts'}\n`));

  // Read brief
  const brief = await fs.readJSON(briefPath);
  console.log(chalk.bold(`Client: ${brief.client}`));
  console.log(chalk.bold(`Pages: ${brief.pages_to_build.map(p => p.name).join(', ')}\n`));

  // Run pipeline
  const scaffoldResult = await step('Scaffolding project structure', () => scaffoldProject(brief, outputDir));
  const tokenResult = await step('Generating brand tokens from references', () => generateTokens(brief, outputDir));
  const refResult = await step('Building section references + Cursor prompts', () => generateSectionRefs(brief, outputDir));
  const imageResult = await step('Setting up image pipeline', () => generateImages(brief, outputDir, geminiKey));

  // Print summary
  console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.green('✓ Project kickoff complete\n'));

  console.log(chalk.bold('What was built:'));
  if (scaffoldResult) {
    console.log(`  ${chalk.green('✓')} Project structure — ${scaffoldResult.dirs} directories + ${scaffoldResult.files} config files`);
    console.log(`    ${chalk.gray('CLAUDE.md, intake.md, cursor rules, voice rules, LegitScript rules, API route')}`);
  }
  if (tokenResult) {
    console.log(`  ${chalk.green('✓')} lib/tokens.css — full design token system`);
    console.log(`    ${chalk.gray('Colors, typography, spacing, shadows, transitions')}`);
    console.log(`    ${chalk.gray('refs/token-references.md — shows what was pulled from reference brands')}`);
  }
  if (refResult) {
    const total = refResult.reduce((sum, p) => sum + p.count, 0);
    console.log(`  ${chalk.green('✓')} ${total} section reference docs + Cursor build prompts`);
    refResult.forEach(p => {
      console.log(`    ${chalk.gray(`${p.page}: ${p.count} sections`)}`);
    });
    console.log(`    ${chalk.gray('→ .cursor/prompts/ — ready-to-paste prompts for each section')}`);
  }
  if (imageResult) {
    if (imageResult.mode === 'manual') {
      console.log(`  ${chalk.yellow('⚠')} Images — no API key. Manual prompts written to:`);
      console.log(`    ${chalk.cyan(`${outputDir}/brief/image-prompts.md`)}`);
      console.log(`    ${chalk.gray('Paste each prompt into aistudio.google.com (free)')}`);
    } else {
      const ok = imageResult.results?.filter(r => r.success).length || 0;
      const fail = imageResult.results?.filter(r => !r.success).length || 0;
      console.log(`  ${chalk.green('✓')} Images — ${ok} generated, ${fail} failed`);
    }
  }

  console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold('\nNext steps (in order):'));
  console.log(`
  ${chalk.cyan('1.')} Open ${chalk.bold(`${outputDir}/`)} in Cursor
  
  ${chalk.cyan('2.')} If you haven't already, scaffold Next.js into this folder:
     ${chalk.gray('cd ' + outputDir + ' && npx create-next-app@latest . --typescript --tailwind --eslint --app')}
  
  ${chalk.cyan('3.')} ${geminiKey ? 'Images are in public/images/ — check them.' : `Generate images:\n     Open ${chalk.bold('brief/image-prompts.md')} and paste each prompt into aistudio.google.com`}
  
  ${chalk.cyan('4.')} Open ${chalk.bold('.cursor/prompts/')} — pick the Homepage build prompts file
  
  ${chalk.cyan('5.')} In Cursor, run Prompt 1 (hero-split). Review output. Run Prompt 2. Repeat.
  
  ${chalk.cyan('6.')} Deploy to Netlify:
     ${chalk.gray('Connect GitHub repo → Netlify auto-deploys on push')}
     ${chalk.gray('Set env vars: PODIUM_WEBHOOK_URL, NEXT_PUBLIC_GA4_ID')}
  
  ${chalk.cyan('7.')} Share staging link with Lacie: ${chalk.bold(brief.project + '.netlify.app')}
`);

  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

main().catch(err => {
  console.error(chalk.red('\n✗ Kickoff failed:'), err.message);
  process.exit(1);
});
