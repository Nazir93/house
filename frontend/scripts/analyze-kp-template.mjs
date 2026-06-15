import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, "../assets/proposal/kp-master-template.pdf");
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

for (let p = 1; p <= Math.min(doc.numPages, 3); p++) {
  const page = await doc.getPage(p);
  const content = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  console.log(`\n=== PAGE ${p} ${viewport.width}x${viewport.height} ===`);
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const [a, b, c, d, e, f] = item.transform;
    console.log(JSON.stringify({ x: Math.round(e), y: Math.round(f), text: item.str.trim() }));
  }
}
