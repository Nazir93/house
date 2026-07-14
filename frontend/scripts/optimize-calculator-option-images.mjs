/**
 * Сжимает схемы опций калькулятора для быстрой отдачи в миниатюре ~150px (retina до 640).
 * Запуск: node scripts/optimize-calculator-option-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "../public/images/calculator/options");
const MAX_EDGE = 512;
const WEBP_QUALITY = 75;

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => /\.png$/i.test(f));
  if (!files.length) {
    console.error("No PNG files in", DIR);
    process.exit(1);
  }

  let before = 0;
  let after = 0;

  for (const file of files) {
    const srcPath = path.join(DIR, file);
    const outPath = path.join(DIR, file.replace(/\.png$/i, ".webp"));
    before += fs.statSync(srcPath).size;

    const meta = await sharp(srcPath).metadata();
    const pipeline = sharp(srcPath).resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });

    await pipeline.webp({ quality: WEBP_QUALITY, alphaQuality: 90, effort: 6 }).toFile(outPath);
    after += fs.statSync(outPath).size;

    console.log(
      `${file} ${meta.width}x${meta.height} -> ${path.basename(outPath)} ` +
        `${(fs.statSync(srcPath).size / 1024).toFixed(0)}KB -> ${(fs.statSync(outPath).size / 1024).toFixed(0)}KB`,
    );
  }

  console.log(
    `\nTotal: ${(before / 1024 / 1024).toFixed(2)}MB PNG -> ${(after / 1024 / 1024).toFixed(2)}MB WebP ` +
      `(${Math.round((1 - after / before) * 100)}% smaller)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
