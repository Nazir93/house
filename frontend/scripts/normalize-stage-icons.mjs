/**
 * Нормализация PNG этапов:
 * 1) light — оставляем только зелёные штрихи (+ 1px сглаживание), фон прозрачный
 * 2) dark — из light: штрихи → белые
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/images/stage-icons");

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isGreenStroke(r, g, b) {
  return g >= r - 12 && g >= b - 12 && g > 22 && g - Math.min(r, b) > 4;
}

function idx(x, y, w) {
  return (y * w + x) * 4;
}

function dilateGreenMask(data, w, h, radius = 1) {
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(x, y, w);
      if (data[i + 3] > 0 && isGreenStroke(data[i], data[i + 1], data[i + 2])) {
        mask[y * w + x] = 1;
      }
    }
  }

  const out = new Uint8Array(mask);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x]) continue;
      let near = false;
      for (let dy = -radius; dy <= radius && !near; dy++) {
        for (let dx = -radius; dx <= radius && !near; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (mask[ny * w + nx]) near = true;
        }
      }
      if (near) out[y * w + x] = 1;
    }
  }
  return out;
}

async function processLight(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const keep = dilateGreenMask(data, w, h, 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(x, y, w);
      if (!keep[y * w + x]) {
        data[i + 3] = 0;
        continue;
      }
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isGreenStroke(r, g, b)) continue;
      const l = lum(r, g, b);
      if (l > 200) {
        data[i] = Math.min(255, Math.round(g * 0.55));
        data[i + 1] = g;
        data[i + 2] = Math.min(255, Math.round(g * 0.45));
      }
    }
  }

  const out = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 })
    .resize(320, 320, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const tmp = `${filePath}.tmp`;
  await sharp(out).toFile(tmp);
  fs.renameSync(tmp, filePath);
}

async function deriveDarkFromLight(lightPath, darkPath) {
  const { data, info } = await sharp(lightPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 24) {
      out[i + 3] = 0;
      continue;
    }
    out[i] = 255;
    out[i + 1] = 255;
    out[i + 2] = 255;
    out[i + 3] = 255;
  }

  const buf = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize(320, 320, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const tmp = `${darkPath}.tmp`;
  await sharp(buf).toFile(tmp);
  fs.renameSync(tmp, darkPath);
}

async function report(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  let white = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) transparent++;
    else if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) white++;
  }
  const n = data.length / 4;
  console.log(
    path.basename(filePath).padEnd(22),
    `${info.width}x${info.height}`.padEnd(10),
    `transparent=${((transparent / n) * 100).toFixed(1)}%`,
    `white=${((white / n) * 100).toFixed(1)}%`,
  );
}

const keys = [
  "foundation",
  "walls",
  "windows",
  "roof",
  "interior",
  "landscaping",
  "engineering",
  "facade",
];

for (const key of keys) {
  const light = path.join(DIR, `${key}-light.png`);
  const dark = path.join(DIR, `${key}-dark.png`);
  await processLight(light);
  await deriveDarkFromLight(light, dark);
}

console.log("\nAfter normalize:");
for (const key of keys) {
  await report(path.join(DIR, `${key}-light.png`));
  await report(path.join(DIR, `${key}-dark.png`));
}
