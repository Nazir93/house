/**
 * Убирает вшитую серо-белую клетку → настоящий alpha.
 * Быстро: заливка от углов + «съедание» фона у прозрачных соседей.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OPTIONS_DIR = path.resolve("public/images/calculator/options");

function isBackdrop(r, g, b) {
  const avg = (r + g + b) / 3;
  return Math.abs(r - g) <= 14 && Math.abs(g - b) <= 14 && avg >= 160 && avg <= 255;
}

function floodFrom(data, width, height, sx, sy) {
  const visited = new Uint8Array(width * height);
  const stack = [[sx, sy]];
  const si = (sy * width + sx) * 4;
  const seed = [data[si], data[si + 1], data[si + 2]];
  if (!isBackdrop(seed[0], seed[1], seed[2])) return;

  while (stack.length) {
    const [x, y] = stack.pop();
    const pos = y * width + x;
    if (x < 0 || y < 0 || x >= width || y >= height || visited[pos]) continue;
    visited[pos] = 1;
    const i = pos * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (!isBackdrop(r, g, b)) continue;
    data[i + 3] = 0;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}

function detectCheckerTones(data, width, height) {
  const counts = new Map();
  const limit = Math.min(48, width, height);
  for (let y = 0; y < limit; y++) {
    for (let x = 0; x < limit; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (!isBackdrop(r, g, b)) continue;
      const key = `${r}|${g}|${b}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
  return sorted.map(([key]) => key.split("|").map(Number));
}

function stripCheckerCells(data, width, height) {
  const tones = detectCheckerTones(data, width, height);
  if (tones.length < 2) return;
  const [a, b] = tones;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const rgb = [data[i], data[i + 1], data[i + 2]];
      const expected = (x + y) % 2 === 0 ? a : b;
      const alt = (x + y) % 2 === 0 ? b : a;
      const d1 = Math.abs(rgb[0] - expected[0]) + Math.abs(rgb[1] - expected[1]) + Math.abs(rgb[2] - expected[2]);
      const d2 = Math.abs(rgb[0] - alt[0]) + Math.abs(rgb[1] - alt[1]) + Math.abs(rgb[2] - alt[2]);
      if (Math.min(d1, d2) <= 24 && isBackdrop(rgb[0], rgb[1], rgb[2])) data[i + 3] = 0;
    }
  }
}

function peelAdjacentBackdrop(data, width, height, passes = 6) {
  for (let pass = 0; pass < passes; pass++) {
    let changed = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] === 0) continue;
        if (!isBackdrop(data[i], data[i + 1], data[i + 2])) continue;
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ];
        const touchesTransparent = neighbors.some(([nx, ny]) => {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
          return data[(ny * width + nx) * 4 + 3] === 0;
        });
        if (touchesTransparent) {
          data[i + 3] = 0;
          changed++;
        }
      }
    }
    if (!changed) break;
  }
}

async function strip(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const seeds = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [width >> 1, 0],
    [width >> 1, height - 1],
    [0, height >> 1],
    [width - 1, height >> 1],
  ];
  for (const [x, y] of seeds) floodFrom(data, width, height, x, y);
  peelAdjacentBackdrop(data, width, height);
  stripCheckerCells(data, width, height);
  peelAdjacentBackdrop(data, width, height, 2);

  const tmp = `${filePath}.tmp`;
  await sharp(data, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(tmp);
  fs.renameSync(tmp, filePath);
}

const files = fs.readdirSync(OPTIONS_DIR).filter((f) => f.endsWith(".png"));
for (const file of files) {
  await strip(path.join(OPTIONS_DIR, file));
  console.log(`OK ${file}`);
}
console.log(`Done: ${files.length}`);
