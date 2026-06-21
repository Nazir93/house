/**
 * Capture brochure screenshots from a running site.
 *
 * Usage:
 *   cd frontend
 *   npm run dev   # in another terminal
 *   npm run brochure:screenshots
 *
 * Env:
 *   BROCHURE_BASE_URL=http://localhost:3000
 *   ADMIN_EMAIL / ADMIN_SECRET — for admin pages
 *   E2E_SECRET — for client cabinet seed (default: local-e2e-secret)
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../docs/sales-brochure/screenshots");
const baseUrl = (process.env.BROCHURE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const VIEWPORT = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function shot(page, filename, fullPage = false) {
  const filePath = path.join(outDir, filename);
  await page.screenshot({ path: filePath, fullPage });
  console.log("  ✓", filename);
}

async function adminLogin(page) {
  const email = process.env.ADMIN_EMAIL;
  const secret = process.env.ADMIN_SECRET;
  if (!email || !secret) {
    console.warn("  ⚠ ADMIN_EMAIL / ADMIN_SECRET not set — skipping admin shots");
    return false;
  }
  await page.goto(`${baseUrl}/admin/login`);
  await page.getByLabel(/email|почта/i).fill(email).catch(() =>
    page.locator('input[type="email"]').fill(email)
  );
  await page.locator('input[type="password"]').fill(secret);
  await page.getByRole("button", { name: /войти|login/i }).click();
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15_000 }).catch(() => null);
  return page.url().includes("/admin") && !page.url().includes("/login");
}

async function clientLogin(page) {
  const secret = process.env.E2E_SECRET?.trim() || "local-e2e-secret";
  const res = await page.request.post(`${baseUrl}/api/e2e/client-cabinet`, {
    headers: { "x-e2e-secret": secret },
  });
  if (!res.ok()) {
    console.warn("  ⚠ E2E cabinet seed failed — skipping account shots");
    return false;
  }
  const data = await res.json();
  await page.goto(`${baseUrl}/account/login`);
  await page.getByPlaceholder(/Д-2025/i).fill(data.contractNumber);
  await page.getByPlaceholder("••••••••").fill(data.password);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL(/\/account\//, { timeout: 15_000 });
  return true;
}

async function firstProjectSlug(page) {
  await page.goto(`${baseUrl}/projects`);
  const link = page.locator('a[href^="/projects/"]').first();
  const href = await link.getAttribute("href").catch(() => null);
  return href?.replace("/projects/", "") || null;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log("Capturing to:", outDir);
  console.log("Base URL:", baseUrl);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  // Public pages
  console.log("\nPublic pages:");
  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await shot(page, "01-home.png");

  await page.goto(`${baseUrl}/projects`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await shot(page, "02-projects-catalog.png");

  const slug = await firstProjectSlug(page);
  if (slug) {
    await page.goto(`${baseUrl}/projects/${slug}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await shot(page, "03-project-plans-public.png");
  } else {
    console.warn("  ⚠ No project slug — skip 03");
  }

  await page.goto(`${baseUrl}/calculator`);
  await shot(page, "05-calculator.png");

  await page.goto(`${baseUrl}/portfolio/map`);
  await shot(page, "17-portfolio-map.png");

  // Admin
  console.log("\nAdmin pages:");
  const adminOk = await adminLogin(page);
  if (adminOk) {
    await page.goto(`${baseUrl}/admin`);
    await shot(page, "15-admin-dashboard.png");

    await page.goto(`${baseUrl}/admin/leads`);
    await shot(page, "08-admin-leads.png");

    const leadLink = page.locator('a[href^="/admin/leads/"]').first();
    const leadHref = await leadLink.getAttribute("href").catch(() => null);
    if (leadHref) {
      await page.goto(`${baseUrl}${leadHref}`);
      await shot(page, "09-admin-lead-detail.png");
    }

    await page.goto(`${baseUrl}/admin/calculator`);
    await shot(page, "10-admin-calculator.png");

    await page.goto(`${baseUrl}/admin/seo`);
    await shot(page, "18-admin-seo.png");

    await page.goto(`${baseUrl}/admin/tickets`);
    await shot(page, "14-admin-tickets.png");

    if (slug) {
      await page.goto(`${baseUrl}/admin/house-projects`);
      const editLink = page.locator(`a[href*="/admin/house-projects/"]`).first();
      const editHref = await editLink.getAttribute("href").catch(() => null);
      if (editHref) {
        await page.goto(`${baseUrl}${editHref}`);
        await shot(page, "04-admin-plans-upload.png");
      }
    }

    await page.goto(`${baseUrl}/admin/client-projects`);
    const cpLink = page.locator('a[href^="/admin/client-projects/"]').first();
    const cpHref = await cpLink.getAttribute("href").catch(() => null);
    if (cpHref) {
      await page.goto(`${baseUrl}${cpHref}`);
      await shot(page, "13-admin-client-project.png");
    }
  }

  // Client cabinet
  console.log("\nClient cabinet:");
  const clientOk = await clientLogin(page);
  if (clientOk) {
    await page.goto(`${baseUrl}/account/dashboard`);
    await shot(page, "11-account-dashboard.png");

    await page.goto(`${baseUrl}/account/stages`);
    await shot(page, "12-account-stages.png");
  }

  // PWA mobile
  console.log("\nPWA (mobile):");
  await context.close();
  const mobileContext = await browser.newContext({
    viewport: MOBILE,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/`);
  await mobilePage.waitForTimeout(1500);
  await shot(mobilePage, "16-pwa-install.png");

  await browser.close();
  console.log("\nDone. Re-run: npm run brochure:pdf");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
