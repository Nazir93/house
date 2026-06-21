/**
 * Export sales brochure HTML to PDF via Playwright.
 * Usage: npm run brochure:pdf (from frontend/)
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brochureDir = path.resolve(__dirname, "../../docs/sales-brochure");
const htmlPath = path.join(brochureDir, "index.html");
const outputDir = path.join(brochureDir, "output");
const outputPath = path.join(outputDir, "platform-brochure.pdf");

async function main() {
  if (!fs.existsSync(htmlPath)) {
    console.error("Missing:", htmlPath);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath.replace(/\\/g, "/")}`, {
    waitUntil: "networkidle",
  });

  await page.waitForFunction(() => {
    const imgs = [...document.querySelectorAll("img")];
    return imgs.length === 0 || imgs.every((img) => img.complete);
  }).catch(() => {});

  await page.waitForTimeout(300);

  await page.emulateMedia({ media: "print" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await browser.close();

  console.log("PDF saved:", outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
