/**
 * Убирает вшитый фон схем калькулятора (чистый чёрный или белый),
 * не трогая тёмные детали внутри объекта: flood-fill только с краёв кадра.
 *
 * Запуск из frontend/:
 *   node scripts/knockout-calculator-diagram-bg.mjs
 *   node scripts/knockout-calculator-diagram-bg.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../public/images/calculator");
const DRY = process.argv.includes("--dry-run");

const BLACK_MAX = 14;
const WHITE_MIN = 242;
const WHITE_CHROMA_MAX = 10;

function isNearBlack(r, g, b) {
  return r <= BLACK_MAX && g <= BLACK_MAX && b <= BLACK_MAX;
}

function isNearWhite(r, g, b) {
  if (r < WHITE_MIN || g < WHITE_MIN || b < WHITE_MIN) return false;
  return Math.abs(r - g) <= WHITE_CHROMA_MAX && Math.abs(g - b) <= WHITE_CHROMA_MAX;
}

function sampleCornerMode(data, width, height) {
  const samples = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [0, Math.floor(height / 2)],
  ];
  let blackVotes = 0;
  let whiteVotes = 0;
  let transparentVotes = 0;
  for (const [x, y] of samples) {
    const i = (y * width + x) * 4;
    if (data[i + 3] < 24) {
      transparentVotes++;
      continue;
    }
    if (isNearBlack(data[i], data[i + 1], data[i + 2])) blackVotes++;
    else if (isNearWhite(data[i], data[i + 1], data[i + 2])) whiteVotes++;
  }
  if (transparentVotes >= 3 && blackVotes === 0 && whiteVotes === 0) return "transparent";
  if (blackVotes >= whiteVotes && blackVotes >= 2) return "black";
  if (whiteVotes >= 2) return "white";
  return "transparent";
}

function floodKnockout(data, width, height, match) {
  const visited = new Uint8Array(width * height);
  const stack = [];
  let cleared = 0;

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
    const i = pos * 4;
    if (data[i + 3] < 16) continue;
    if (!match(data[i], data[i + 1], data[i + 2])) continue;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;
    cleared++;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  return cleared;
}

/** Слегка снимает кайму того же цвета, прилегающую к уже прозрачным пикселям. */
function peelBorder(data, width, height, match, passes = 3) {
  let total = 0;
  for (let pass = 0; pass < passes; pass++) {
    let changed = 0;
    const mark = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 16) continue;
        if (!match(data[i], data[i + 1], data[i + 2])) continue;
        const touch = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ].some(([nx, ny]) => {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
          return data[(ny * width + nx) * 4 + 3] < 16;
        });
        if (touch) mark.push(i);
      }
    }
    for (const i of mark) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      changed++;
    }
    total += changed;
    if (!changed) break;
  }
  return total;
}

function listPngs(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((ent) => {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) return listPngs(full);
      if (ent.isFile() && /\.png$/i.test(ent.name)) return [full];
      return [];
    });
}

async function processFile(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const mode = sampleCornerMode(data, width, height);

  if (mode === "transparent") {
    return { filePath, mode, cleared: 0, skipped: true };
  }

  const match = mode === "black" ? isNearBlack : isNearWhite;
  let cleared = floodKnockout(data, width, height, match);
  cleared += peelBorder(data, width, height, match, mode === "black" ? 2 : 4);

  if (!DRY && cleared > 0) {
    const tmp = `${filePath}.tmp.png`;
    await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(tmp);
    fs.renameSync(tmp, filePath);
  }

  return { filePath, mode, cleared, skipped: false };
}

async function main() {
  const files = listPngs(ROOT);
  let changed = 0;
  for (const file of files) {
    const result = await processFile(file);
    const rel = path.relative(ROOT, result.filePath);
    if (result.skipped) {
      console.log(`skip  ${rel} (already transparent edges)`);
      continue;
    }
    console.log(
      `${DRY ? "dry   " : "ok    "}${rel} mode=${result.mode} cleared=${result.cleared}`,
    );
    if (result.cleared > 0) changed++;
  }
  console.log(`\nDone: ${files.length} png, ${changed} updated${DRY ? " (dry-run)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
