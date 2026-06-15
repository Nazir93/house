import { describe, expect, it } from "vitest";
import {
  formatAuthorProjectTitle,
  formatProposalAmount,
  formatProposalPrintDate,
  proposalSiteHost,
} from "@/lib/proposal/proposal-format";

describe("proposal-format", () => {
  it("formats amounts like Braun PDF (spaces + руб., no ₽)", () => {
    expect(formatProposalAmount(7536540, false).replace(/\u00a0/g, " ")).toBe("7 536 540");
    expect(formatProposalAmount(425220)).toMatch(/425[\s\u00a0]?220 руб\./);
  });

  it("builds author project title in uppercase", () => {
    expect(formatAuthorProjectTitle("Браун")).toBe("АВТОРСКИЙ ПРОЕКТ «БРАУН»");
  });

  it("formats print datetime", () => {
    expect(formatProposalPrintDate("2026-06-11T20:21:00.000Z")).toMatch(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}/);
  });

  it("strips protocol from site url", () => {
    expect(proposalSiteHost("https://chastdushi.ru/")).toBe("chastdushi.ru");
  });
});
