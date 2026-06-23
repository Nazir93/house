/**
 * PM2: процесс переживает выход из SSH и перезапускается при падении.
 *
 * ВАЖНО: переменные из `frontend/.env` подмешиваются сюда явно, чтобы дочерний
 * `next start` гарантированно видел NEXTAUTH_*, ADMIN_*, DATABASE_URL (иначе
 * сессия/админка «не работают», если PM2 не наследует окружение).
 *
 * Файл `.env` должен лежать в ЭТОЙ папке (рядом с package.json), не в корне репо.
 * После правок ecosystem: `pm2 delete house-next 2>/dev/null; pm2 start ecosystem.config.cjs && pm2 save`
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

function parseEnvFile(absPath) {
  if (!fs.existsSync(absPath)) {
    return {};
  }
  let text = fs.readFileSync(absPath, "utf8");
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  const out = {};
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
    out[key] = val;
  }
  return out;
}

/** Как у Next.js: сначала `.env`, затем `.env.local` перезаписывает ключи. */
const envPath = path.join(__dirname, ".env");
const envLocalPath = path.join(__dirname, ".env.local");
const fileEnv = {
  ...parseEnvFile(envPath),
  ...parseEnvFile(envLocalPath),
};
if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
  // eslint-disable-next-line no-console
  console.warn(
    "[ecosystem] нет ни .env, ни .env.local — создайте frontend/.env из .env.example (иначе PM2 не получит NEXTAUTH_SECRET и т.д.).",
  );
}

function resolvePm2Instances() {
  const explicit = fileEnv.PM2_INSTANCES?.trim() || process.env.PM2_INSTANCES?.trim();
  if (explicit) {
    const n = parseInt(explicit, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 4) return n;
  }
  const ramGb = os.totalmem() / 1024 ** 3;
  return ramGb >= 6 ? 2 : 1;
}

const pm2Instances = resolvePm2Instances();

module.exports = {
  apps: [
    {
      name: "house-next",
      cwd: __dirname,
      script: path.join(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -H 0.0.0.0",
      instances: pm2Instances,
      exec_mode: pm2Instances > 1 ? "cluster" : "fork",
      autorestart: true,
      watch: false,
      max_restarts: 15,
      min_uptime: "10s",
      max_memory_restart: "900M",
      env: {
        ...fileEnv,
        NODE_ENV: "production",
        PORT: Number(fileEnv.PORT) || 3000,
      },
    },
  ],
};
