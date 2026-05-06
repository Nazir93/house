/**
 * В каждый route.ts под /api/admin добавляет проверку requireAdminApiSession.
 * Запуск из каталога frontend: node scripts/patch-admin-api-guards.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "app", "api", "admin");

const IMPORT_LINE = `import { requireAdminApiSession } from "@/lib/require-admin-api";`;
const GUARD = `  const gate = await requireAdminApiSession();\n  if (!gate.ok) return gate.response;\n`;

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name === "route.ts") acc.push(p);
  }
  return acc;
}

/** Индекс символа сразу после `{` тела функции handler */
function findHandlerBodyBraceIndices(content) {
  const indices = [];
  const decl =
    /\bexport\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
  let m;
  while ((m = decl.exec(content)) !== null) {
    const openParen = m.index + m[0].length - 1;
    let i = openParen + 1;
    let depth = 1;
    for (; i < content.length && depth > 0; i++) {
      const c = content[i];
      if (c === "(") depth++;
      else if (c === ")") depth--;
    }
    if (depth !== 0) continue;
    while (i < content.length && /\s/.test(content[i])) i++;
    if (content[i] === "{") indices.push(i + 1);
  }
  return indices.sort((a, b) => b - a);
}

const files = walk(root);
let changed = 0;
for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  if (s.includes("requireAdminApiSession")) continue;

  if (!s.includes(IMPORT_LINE)) {
    const lines = s.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s/.test(lines[i])) lastImport = i;
    }
    if (lastImport === -1) {
      console.warn("skip (no imports):", file);
      continue;
    }
    lines.splice(lastImport + 1, 0, IMPORT_LINE);
    s = lines.join("\n");
  }

  const bracePositions = findHandlerBodyBraceIndices(s);
  if (bracePositions.length === 0) {
    console.warn("skip (no handlers):", file);
    continue;
  }

  for (const pos of bracePositions) {
    s = s.slice(0, pos) + "\n" + GUARD + s.slice(pos);
  }

  fs.writeFileSync(file, s);
  changed++;
  console.log("patched:", path.relative(path.join(__dirname, ".."), file));
}

console.log("done, files changed:", changed);
