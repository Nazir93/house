#!/usr/bin/env node
/**
 * Оптимизация рендеров для карточек «Материалы и старт цены».
 * Usage: node scripts/optimize-material-images.mjs gazobeton path/to/render.png
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/images/materials");

const name = process.argv[2]?.trim();
const input = process.argv[3]?.trim();

if (!name || !input) {
  console.error("Usage: node scripts/optimize-material-images.mjs <gazobeton|keramoblok|kirpich> <input.png|jpg>");
  process.exit(1);
}

if (!fs.existsSync(input)) {
  console.error("File not found:", input);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const meta = await sharp(input).metadata();
const targetWidth = Math.min(meta.width ?? 1920, 2400);

const outWebp = path.join(outDir, `${name}.webp`);
const info = await sharp(input)
  .resize({ width: targetWidth, withoutEnlargement: true })
  .webp({ quality: 88, effort: 6 })
  .toFile(outWebp);

console.log(`Wrote ${outWebp}`);
console.log(`  ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB (source ${meta.width}x${meta.height})`);
