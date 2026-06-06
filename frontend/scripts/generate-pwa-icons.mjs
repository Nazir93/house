import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "src", "app", "icon.svg");
const outDir = path.join(root, "public", "icons");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

const svg = await readFile(svgPath);

for (const { name, size } of sizes) {
  const buffer = await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(path.join(outDir, name), buffer);
  console.log(`Wrote ${name} (${size}x${size})`);
}
