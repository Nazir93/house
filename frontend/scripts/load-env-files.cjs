const fs = require("fs");
const path = require("path");

/**
 * Как у Next.js: .env, затем .env.local перезаписывает значения из .env.
 * Не перезаписывает уже заданные в process.env (например из PM2), пока override=false для первого файла;
 * для .env.local ключи из файла перезаписывают process.env, если они присутствуют в файле.
 * Упрощённый парсер (без многострочных значений).
 */
function applyEnvFile(absPath, fileOverridesProcess) {
  if (!fs.existsSync(absPath)) return;
  const text = fs.readFileSync(absPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (fileOverridesProcess) {
      process.env[key] = val;
    } else if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function loadEnvFiles() {
  const root = path.join(__dirname, "..");
  applyEnvFile(path.join(root, ".env"), false);
  applyEnvFile(path.join(root, ".env.local"), true);
}

module.exports = { loadEnvFiles };
