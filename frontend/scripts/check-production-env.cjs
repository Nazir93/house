/**
 * Чек-лист переменных для админки, NextAuth и личного кабинета.
 * Локально и на сервере: из каталога frontend выполните npm run env:check
 * (подхватит .env и .env.local). На VPS при переменных только в PM2: export … затем node scripts/…
 */
const fs = require("fs");
const path = require("path");
const { loadEnvFiles } = require("./load-env-files.cjs");

loadEnvFiles();

const envFile = path.join(__dirname, "..", ".env");
const envLocalFile = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envFile) && !fs.existsSync(envLocalFile)) {
  console.warn("");
  console.warn(`  ⚠ Нет ни .env, ни .env.local в ${path.join(__dirname, "..")}`);
  console.warn("    На сервере: cd …/frontend && cp .env.example .env && nano .env");
  console.warn("    Файл должен лежать в папке frontend (рядом с package.json), не в корне репозитория.");
  console.warn("");
}

const required = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "ADMIN_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
];

function normUrl(u) {
  if (!u || typeof u !== "string") return "";
  try {
    return new URL(u.trim()).origin;
  } catch {
    return "";
  }
}

let failed = false;

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.REQUIRE_PRODUCTION_ENV === "1";

console.log("");
console.log("  Проверка переменных окружения (production-ready)");
console.log("");

for (const key of required) {
  const v = process.env[key];
  if (!v || !String(v).trim()) {
    console.error(`  ✗ ${key} — не задано (обязательно)`);
    failed = true;
  } else {
    const show =
      key === "DATABASE_URL"
        ? String(v).replace(/:\/\/([^:]+):[^@]+@/, "://$1:***@")
        : key.includes("SECRET")
          ? "(скрыто)"
          : v;
    console.log(`  ✓ ${key} = ${show}`);
  }
}

const adminEmail = process.env.ADMIN_EMAIL?.trim();
if (!adminEmail) {
  if (isProduction) {
    console.error("  ✗ ADMIN_EMAIL — не задано (обязательно на production, не используйте admin@dom.ru)");
    failed = true;
  } else {
    console.log("  · ADMIN_EMAIL — не задано, вход в админку: admin@dom.ru (см. lib/auth.ts)");
  }
} else if (isProduction && adminEmail.toLowerCase() === "admin@dom.ru") {
  console.warn("  ⚠ ADMIN_EMAIL = admin@dom.ru — смените на уникальный адрес");
} else {
  console.log(`  ✓ ADMIN_EMAIL = ${adminEmail}`);
}

const site = normUrl(process.env.NEXT_PUBLIC_SITE_URL);
const auth = normUrl(process.env.NEXTAUTH_URL);
if (site && auth && site !== auth) {
  console.log("");
  console.warn(
    "  ⚠ NEXT_PUBLIC_SITE_URL и NEXTAUTH_URL имеют разный origin — вход по домену может ломаться.",
  );
  console.warn(`    SITE: ${site}`);
  console.warn(`    AUTH: ${auth}`);
}

if (process.env.NODE_ENV === "production") {
  console.log("  ✓ NODE_ENV=production");
} else {
  console.log(
    "  · NODE_ENV — для сервера задайте production (сейчас: " +
      (process.env.NODE_ENV || "(не задано)") +
      ")",
  );
}

const securityRecommended = [
  ["YANDEX_SMARTCAPTCHA_SERVER_KEY", "SmartCaptcha server key для публичных форм"],
  ["NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY", "SmartCaptcha client key для публичных форм"],
  ["HEALTH_CHECK_SECRET", "секрет для deep health-check (/api/health?deep=1)"],
  ["INTERNAL_API_SECRET", "секрет для /api/internal/* (не NEXTAUTH_SECRET)"],
];

const productionSecurityRequired = [
  ["YANDEX_SMARTCAPTCHA_SERVER_KEY", "SmartCaptcha server key"],
  ["NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY", "SmartCaptcha client key"],
  ["HEALTH_CHECK_SECRET", "HEALTH_CHECK_SECRET"],
];

console.log("");
console.log("  Рекомендуемые security-переменные:");
for (const [key, hint] of securityRecommended) {
  const v = process.env[key]?.trim();
  if (!v) {
    console.warn(`  ⚠ ${key} — не задано (${hint})`);
  } else {
    console.log(`  ✓ ${key} = ${key.includes("SECRET") || key.includes("KEY") ? "(скрыто)" : v}`);
  }
}

if (process.env.E2E_ENABLED === "1") {
  if (isProduction) {
    console.error("  ✗ E2E_ENABLED=1 — отключите на production (тестовый seed API)");
    failed = true;
  } else {
    console.warn("  ⚠ E2E_ENABLED=1 — только для dev/CI");
  }
}

if (isProduction) {
  console.log("");
  console.log("  Обязательные security-переменные (production):");
  for (const [key, hint] of productionSecurityRequired) {
    const v = process.env[key]?.trim();
    if (!v) {
      console.error(`  ✗ ${key} — не задано (${hint})`);
      failed = true;
    } else {
      console.log(`  ✓ ${key} = (скрыто)`);
    }
  }

  const internal = process.env.INTERNAL_API_SECRET?.trim();
  const nextAuth = process.env.NEXTAUTH_SECRET?.trim();
  if (!internal) {
    console.warn("  ⚠ INTERNAL_API_SECRET — не задан, fallback на NEXTAUTH_SECRET (лучше разделить)");
  } else if (internal === nextAuth) {
    console.warn("  ⚠ INTERNAL_API_SECRET совпадает с NEXTAUTH_SECRET — задайте отдельный секрет");
  } else {
    console.log("  ✓ INTERNAL_API_SECRET = (скрыто)");
  }
}

console.log("");

if (failed) {
  console.error("  Исправьте .env / .env.local на сервере и перезапустите процесс Node.");
  console.error("");
  process.exit(1);
}

console.log("  Все обязательные ключи на месте. Далее: npm run db:verify и prisma migrate deploy.");
console.log("");
