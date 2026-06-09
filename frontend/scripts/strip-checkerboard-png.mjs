/**
 * Убирает вшитую клетку и однотонный фон → настоящий alpha.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OPTIONS_DIR = path.resolve("public/images/calculator/options");

const CHECKER_COLORS = [
  [255, 255, 255],
  [240, 240, 240],
  [204, 204, 204],
  [192, 192, 192],
  [200, 200, 200],
  [160, 160, 160],
  [128, 128, 128],
];

function dist(rgb, tone) {
  return Math.abs(rgb[0] - tone[0]) + Math.abs(rgb[1] - tone[1]) + Math.abs(rgb[2] - tone[2]);
}

function isCheckerColor(r, g, b) {
  return CHECKER_COLORS.some((tone) => dist([r, g, b], tone) <= 24);
}

function isBackdrop(r, g, b) {
  const avg = (r + g + b) / 3;
  const neutral = Math.abs(r - g) <= 16 && Math.abs(g - b) <= 16;
  return (neutral && avg >= 120 && avg <= 255) || isCheckerColor(r, g, b);
}

function isVoidBlack(r, g, b) {
  return r <= 22 && g <= 22 && b <= 22;
}

function floodFrom(data, width, height, sx, sy, match) {
  const visited = new Uint8Array(width * height);
  const stack = [[sx, sy]];
  const si = (sy * width + sx) * 4;
  const seed = [data[si], data[si + 1], data[si + 2]];
  if (!match(seed[0], seed[1], seed[2])) return;

  while (stack.length) {
    const [x, y] = stack.pop();
    const pos = y * width + x;
    if (x < 0 || y < 0 || x >= width || y >= height || visited[pos]) continue;
    visited[pos] = 1;
    const i = pos * 4;
    if (!match(data[i], data[i + 1], data[i + 2])) continue;
    data[i + 3] = 0;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}

function peel(data, width, height, match, passes = 5) {
  for (let pass = 0; pass < passes; pass++) {
    let changed = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] === 0 || !match(data[i], data[i + 1], data[i + 2])) continue;
        const touch = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ].some(([nx, ny]) => {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
          return data[(ny * width + nx) * 4 + 3] === 0;
        });
        if (touch) {
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

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isCheckerColor(data[i], data[i + 1], data[i + 2])) data[i + 3] = 0;
    }
  }

  for (const [x, y] of [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [width >> 1, 0],
    [width >> 1, height - 1],
    [0, height >> 1],
    [width - 1, height >> 1],
  ]) {
    floodFrom(data, width, height, x, y, isBackdrop);
    floodFrom(data, width, height, x, y, isVoidBlack);
  }

  peel(data, width, height, isBackdrop, 6);
  peel(data, width, height, isCheckerColor, 4);
  peel(data, width, height, isVoidBlack, 4);
  peel(data, width, height, (r, g, b) => (r + g + b) / 3 >= 238, 3);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }

  const tmp = `${filePath}.tmp`;
  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .trim({ threshold: 10 })
    .toFile(tmp);
  fs.renameSync(tmp, filePath);
}

const args = process.argv.slice(2);
const only = new Set(args);
const files = fs
  .readdirSync(OPTIONS_DIR)
  .filter((f) => f.endsWith(".png"))
  .filter((f) => only.size === 0 || only.has(f));

for (const file of files) {
  await strip(path.join(OPTIONS_DIR, file));
  console.log(`OK ${file}`);
}
console.log(`Done: ${files.length}`);
