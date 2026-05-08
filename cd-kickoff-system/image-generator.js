// image-generator.js
// Reads brief image requirements, generates via Gemini, saves optimized images

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

// Image slots needed per section — what to generate
const IMAGE_SLOTS = {
  'hero-men': {
    prompt_template: (style) => `A confident male professional in his early 40s, business casual attire, in a clean modern medical consultation office. ${style.lighting}. ${style.perspective}. Color grade: ${style.color_grade}. Horizontal composition, landscape 16:9. NOT: ${style.banned}.`,
    filename: 'hero-men.jpg',
    width: 1440,
    height: 900,
    usage: 'Hero section — Men\'s side background'
  },
  'hero-women': {
    prompt_template: (style) => `A confident woman in her late 30s to early 50s, dressed in tasteful casual attire, in a bright warm medical wellness office. Natural warm lighting, slightly overexposed highlights. Calm, confident expression. Horizontal 16:9 composition. Eye level. Shallow depth of field. Color grade: warm cream tones, soft shadows. NOT: ${style.banned}.`,
    filename: 'hero-women.jpg',
    width: 1440,
    height: 900,
    usage: 'Hero section — Women\'s side background'
  },
  'section-abstract': {
    prompt_template: (style) => `Abstract macro photography of biological cellular structures, DNA helix visualization, or molecular patterns. Dark background, gold and teal light accents, clinical precision aesthetic. No people. Horizontal composition. Ultra high detail. Suitable as a dark website background texture.`,
    filename: 'section-abstract.jpg',
    width: 1440,
    height: 600,
    usage: 'Background texture for CTA or why-us sections'
  },
  'location-tampa': {
    prompt_template: (style) => `Modern medical clinic waiting room interior. Clean, warm, upscale. Warm wood tones, white walls, tasteful plants, natural light through large windows. Empty room, no people. Wide angle interior shot. Professional real estate photography style.`,
    filename: 'location-tampa.jpg',
    width: 800,
    height: 600,
    usage: 'Tampa location card'
  },
  'team-doctor': {
    prompt_template: (style) => `Professional headshot of a male physician in his 40s. Clean white or light gray background. Business attire or smart casual, no white coat. Confident warm expression. Studio lighting, slightly softened. Square crop 1:1.`,
    filename: 'team-doctor-placeholder.jpg',
    width: 600,
    height: 600,
    usage: 'Doctor headshot placeholder until real photos arrive'
  }
};

async function generateImage(genAI, slot, slotKey, style, outputDir) {
  const prompt = slot.prompt_template(style);
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp-image-generation',
    });

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    });

    const parts = response.response.candidates[0].content.parts;
    const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
    
    if (!imagePart) throw new Error('No image in response');

    const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
    const outputPath = path.join(outputDir, 'public/images', slot.filename);
    
    // Optimize with sharp
    await sharp(imageBuffer)
      .resize(slot.width, slot.height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outputPath);

    return { success: true, file: slot.filename, usage: slot.usage };
  } catch (err) {
    // If API fails (no key set up yet), write a placeholder readme
    return { 
      success: false, 
      file: slot.filename, 
      error: err.message,
      prompt, // Return the prompt so you can run it manually in AI Studio
      usage: slot.usage
    };
  }
}

export async function generateImages(brief, outputDir, apiKey = null) {
  await fs.ensureDir(path.join(outputDir, 'public/images'));
  
  const style = brief.image_style;
  const results = [];

  if (!apiKey) {
    // No API key — write prompt file for manual AI Studio generation
    const promptFile = Object.entries(IMAGE_SLOTS).map(([key, slot]) => {
      const prompt = slot.prompt_template(style);
      return `## ${slot.filename}\n**Usage:** ${slot.usage}\n**Size:** ${slot.width}×${slot.height}px\n\n**Prompt to paste into aistudio.google.com:**\n\n${prompt}\n\n**After generating:** Save as \`public/images/${slot.filename}\`\n`;
    }).join('\n---\n\n');

    await fs.outputFile(
      path.join(outputDir, 'brief/image-prompts.md'),
      `# Image Generation Prompts\n\nPaste each prompt into https://aistudio.google.com (free, Gemini Flash image generation).\nSave each result to the path shown.\n\n---\n\n${promptFile}`
    );

    return { mode: 'manual', promptFile: 'brief/image-prompts.md' };
  }

  // API key available — generate automatically
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const [key, slot] of Object.entries(IMAGE_SLOTS)) {
    console.log(`  Generating: ${slot.filename}...`);
    const result = await generateImage(genAI, slot, key, style, outputDir);
    results.push(result);
    
    // Rate limit — Gemini free tier is 10 req/min
    await new Promise(r => setTimeout(r, 6000));
  }

  return { mode: 'auto', results };
}
