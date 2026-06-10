/**
 * Подготовка схем опций: убирает вшитую клетку, сохраняя тёмные детали (радиаторы, трубы).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OPTIONS_DIR = path.resolve("public/images/calculator/options");

function isNeutralLight(r, g, b) {
  const avg = (r + g + b) / 3;
  return avg >= 185 && Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8;
}

function isStrongChecker(r, g, b) {
  const avg = (r + g + b) / 3;
  return avg >= 236 && Math.abs(r - g) <= 6 && Math.abs(g - b) <= 6;
}

function isWeakChecker(r, g, b) {
  const avg = (r + g + b) / 3;
  return avg >= 185 && avg < 236 && Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8;
}

function isCheckerLike(r, g, b) {
  return isStrongChecker(r, g, b) || isWeakChecker(r, g, b);
}

function avgRgb(r, g, b) {
  return (r + g + b) / 3;
}

function isCheckerPatternPixel(data, width, height, x, y) {
  const i = (y * width + x) * 4;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (!isNeutralLight(r, g, b)) return false;

  const avg = avgRgb(r, g, b);
  let mates = 0;

  for (const [nx, ny] of [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ]) {
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const j = (ny * width + nx) * 4;
    if (!isNeutralLight(data[j], data[j + 1], data[j + 2])) continue;
    const diff = Math.abs(avg - avgRgb(data[j], data[j + 1], data[j + 2]));
    if (diff >= 5 && diff <= 22) mates++;
  }

  return mates >= 1;
}

function darkNeighbors(data, width, height, x, y) {
  let count = 0;
  let rs = 0;
  let gs = 0;
  let bs = 0;

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const j = (ny * width + nx) * 4;
      const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
      if (avg < 120) {
        count++;
        rs += data[j];
        gs += data[j + 1];
        bs += data[j + 2];
      }
    }
  }

  return {
    count,
    r: Math.round(rs / Math.max(count, 1)),
    g: Math.round(gs / Math.max(count, 1)),
    b: Math.round(bs / Math.max(count, 1)),
  };
}

function darkestOpaqueNeighbor(data, width, height, x, y) {
  let best = 999;
  let br = 0;
  let bg = 0;
  let bb = 0;

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const j = (ny * width + nx) * 4;
      if (data[j + 3] < 20) continue;
      const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
      if (avg < best) {
        best = avg;
        br = data[j];
        bg = data[j + 1];
        bb = data[j + 2];
      }
    }
  }

  return { r: br, g: bg, b: bb, avg: best };
}

function defringe(data) {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 20) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }
}

function floodBackdrop(data, width, height) {
  const visited = new Uint8Array(width * height);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    stack.push([x, y]);
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
    const [x, y] = stack.pop();
    const pos = y * width + x;
    if (visited[pos]) continue;
    visited[pos] = 1;
    const i = pos * 4;
    if (!isCheckerLike(data[i], data[i + 1], data[i + 2])) continue;
    data[i + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

function peelMatch(data, width, height, match, passes = 4) {
  for (let pass = 0; pass < passes; pass++) {
    let changed = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] === 0) continue;
        if (!match(data[i], data[i + 1], data[i + 2])) continue;
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

function cleanEdgeFringe(data, width, height) {
  for (let pass = 0; pass < 4; pass++) {
    let changed = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 20) continue;
        const touch = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ].some(([nx, ny]) => data[(ny * width + nx) * 4 + 3] < 20);
        if (!touch) continue;
        if (isNeutralLight(data[i], data[i + 1], data[i + 2]) && avgRgb(data[i], data[i + 1], data[i + 2]) >= 190) {
          const neighbor = darkestOpaqueNeighbor(data, width, height, x, y);
          if (neighbor.avg < 140) {
            data[i] = neighbor.r;
            data[i + 1] = neighbor.g;
            data[i + 2] = neighbor.b;
            changed++;
          } else {
            data[i + 3] = 0;
            changed++;
          }
        }
      }
    }
    if (!changed) break;
  }
}

function removeCheckerBackdrop(data, width, height) {
  floodBackdrop(data, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      if (!isCheckerPatternPixel(data, width, height, x, y)) continue;

      const neighbors = darkNeighbors(data, width, height, x, y);
      if (neighbors.count >= 3) {
        data[i] = neighbors.r;
        data[i + 1] = neighbors.g;
        data[i + 2] = neighbors.b;
      } else {
        data[i + 3] = 0;
      }
    }
  }

  peelMatch(data, width, height, isCheckerLike, 12);
  cleanEdgeFringe(data, width, height);
}

async function prepare(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  defringe(data);
  removeCheckerBackdrop(data, width, height);
  defringe(data);

  const tmp = `${filePath}.tmp`;
  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .trim({ threshold: 8 })
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
