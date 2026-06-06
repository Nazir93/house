import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

function routeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) return routeFiles(full);
    return entry === "route.ts" ? [full] : [];
  });
}

describe("admin API guards", () => {
  it("requires admin session in every admin route", () => {
    const adminApiDir = path.join(process.cwd(), "src", "app", "api", "admin");
    const files = routeFiles(adminApiDir);

    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, path.relative(process.cwd(), file)).toContain("requireAdminApiSession");
    }
  });
});
