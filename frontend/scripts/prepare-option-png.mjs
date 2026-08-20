/**
 * Убирает вшитую клетку у схем опций, НЕ съедая светлую штукатурку/бетон.
 * Flood только: почти белые клетки + пиксели с характерным «шахматным» соседом.
 *
 * Запуск из frontend/:
 *   OPTIONS_SOURCE_DIR=../_tmp_img/options-orig node scripts/prepare-option-png.mjs
 *   node scripts/prepare-option-png.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OPTIONS_DIR = path.resolve("public/images/calculator/options");

function avgRgb(r, g, b) {
  return (r + g + b) / 3;
}

function isNeutral(r, g, b) {
  return Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8;
}

/** Почти белая клетка шахматки (часто 220–255; порог 236 оставлял «серые» 222–235). */
function isStrongChecker(r, g, b) {
  return avgRgb(r, g, b) >= 220 && isNeutral(r, g, b);
}

/** Серая клетка шахматки: светло-серая И рядом есть клетка другого тона. */
function isCheckerPatternPixel(data, width, height, x, y) {
  const i = (y * width + x) * 4;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const avg = avgRgb(r, g, b);
  // Серая клетка шахматки обычно ~165–219; однотонная штукатурка тоже может быть здесь —
  // поэтому требуем контрастного «соседа-клетку».
  if (avg < 165 || avg >= 220 || !isNeutral(r, g, b)) return false;

  let mates = 0;
  for (const [nx, ny] of [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ]) {
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const j = (ny * width + nx) * 4;
    if (data[j + 3] < 20) continue;
    if (!isNeutral(data[j], data[j + 1], data[j + 2])) continue;
    const nAvg = avgRgb(data[j], data[j + 1], data[j + 2]);
    const diff = Math.abs(avg - nAvg);
    if (diff >= 6 && diff <= 50) mates++;
  }
  return mates >= 1;
}

function isBackdropSeed(data, width, height, x, y) {
  const i = (y * width + x) * 4;
  if (data[i + 3] < 20) return false;
  if (isStrongChecker(data[i], data[i + 1], data[i + 2])) return true;
  return isCheckerPatternPixel(data, width, height, x, y);
}

function floodBackdrop(data, width, height) {
  const visited = new Uint8Array(width * height);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    stack.push(x | (y << 16));
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length) {
    const packed = stack.pop();
    const x = packed & 0xffff;
    const y = packed >>> 16;
    const pos = y * width + x;
    if (visited[pos]) continue;
    visited[pos] = 1;
    if (!isBackdropSeed(data, width, height, x, y)) continue;
    const i = pos * 4;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

/** Снимает только почти-белую кайму у уже прозрачных краёв. */
function peelStrongBorder(data, width, height, passes = 4) {
  for (let pass = 0; pass < passes; pass++) {
    const mark = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 20) continue;
        if (!isStrongChecker(data[i], data[i + 1], data[i + 2])) continue;
        const touch = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ].some(([nx, ny]) => {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
          return data[(ny * width + nx) * 4 + 3] < 20;
        });
        if (touch) mark.push(i);
      }
    }
    if (!mark.length) break;
    for (const i of mark) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }
}

function defringeTransparent(data) {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 20) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }
}

async function prepare(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  floodBackdrop(data, width, height);
  peelStrongBorder(data, width, height, 10);
  defringeTransparent(data);

  const tmp = `${filePath}.tmp`;
  await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .trim({ threshold: 12 })
    .toFile(tmp);
  fs.renameSync(tmp, filePath);
}

const args = process.argv.slice(2);
const only = new Set(args);
const sourceDir = process.env.OPTIONS_SOURCE_DIR
  ? path.resolve(process.env.OPTIONS_SOURCE_DIR)
  : OPTIONS_DIR;
const files = fs
  .readdirSync(sourceDir)
  .filter((f) => f.endsWith(".png"))
  .filter((f) => only.size === 0 || only.has(f));

for (const file of files) {
  const src = path.join(sourceDir, file);
  const dest = path.join(OPTIONS_DIR, file);
  if (sourceDir !== OPTIONS_DIR) {
    fs.copyFileSync(src, dest);
  }
  await prepare(dest);
  console.log(`OK ${file}`);
}
console.log(`Done: ${files.length}`);
