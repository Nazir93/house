import { describe, expect, it } from "vitest";
import {
  companyRegistrationLabels,
  companyRegistrationLegalSuffix,
  normalizeCompanyWebsiteUrl,
} from "@/lib/company-requisites";

describe("company-requisites", () => {
  it("normalizeCompanyWebsiteUrl: пустое → null", () => {
    expect(normalizeCompanyWebsiteUrl("")).toBeNull();
    expect(normalizeCompanyWebsiteUrl("   ")).toBeNull();
  });

  it("normalizeCompanyWebsiteUrl: добавляет https при домене без схемы", () => {
    expect(normalizeCompanyWebsiteUrl("chastdushi.ru")).toBe("https://chastdushi.ru");
    expect(normalizeCompanyWebsiteUrl("https://chastdushi.ru/about")).toBe("https://chastdushi.ru/about");
  });

  it("companyRegistrationLabels: ОГРН и ОГРНИП по отдельности", () => {
    expect(companyRegistrationLabels({ ogrn: "1255300000537", ogrnip: "" })).toEqual([
      { label: "ОГРН", value: "1255300000537" },
    ]);
    expect(companyRegistrationLabels({ ogrn: "", ogrnip: "304500116000157" })).toEqual([
      { label: "ОГРНИП", value: "304500116000157" },
    ]);
    expect(companyRegistrationLabels({ ogrn: "1", ogrnip: "2" })).toHaveLength(2);
  });

  it("companyRegistrationLegalSuffix: для юр. текстов", () => {
    expect(companyRegistrationLegalSuffix({ ogrn: "1255300000537", ogrnip: "" })).toBe(
      ", ОГРН 1255300000537",
    );
    expect(companyRegistrationLegalSuffix({ ogrn: "", ogrnip: "" })).toBe("");
  });
});
