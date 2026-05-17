import { describe, expect, it } from "vitest";
import {
  CLIENT_DOCUMENT_ES_SIGNING_ENABLED,
  defaultAdminSignedDateInput,
  formatAdminSignedDateInput,
  formatDocumentSignedAtRu,
  parseAdminSignedDateInput,
} from "./client-document-signed-date";

describe("client-document-signed-date", () => {
  it("parseAdminSignedDateInput", () => {
    const d = parseAdminSignedDateInput("2026-05-16");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(parseAdminSignedDateInput("bad")).toBeNull();
  });

  it("formatAdminSignedDateInput", () => {
    expect(formatAdminSignedDateInput(new Date("2026-05-16T12:00:00"))).toBe("2026-05-16");
  });

  it("defaultAdminSignedDateInput", () => {
    expect(defaultAdminSignedDateInput(new Date("2026-01-05T12:00:00"))).toBe("2026-01-05");
  });

  it("formatDocumentSignedAtRu — дата без времени пока ЭП выключена", () => {
    expect(CLIENT_DOCUMENT_ES_SIGNING_ENABLED).toBe(false);
    const formatted = formatDocumentSignedAtRu(new Date("2026-05-16T15:30:00"));
    expect(formatted).toMatch(/16[./]05[./]2026/);
    expect(formatted).not.toMatch(/15:30/);
  });

  it("formatDocumentSignedAtRu — с временем при withTime", () => {
    const formatted = formatDocumentSignedAtRu(new Date("2026-05-16T15:30:00"), {
      withTime: true,
    });
    expect(formatted).toMatch(/16[./]05[./]2026/);
    expect(formatted).toMatch(/15:30/);
  });
});
