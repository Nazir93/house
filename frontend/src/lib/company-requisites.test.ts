import { describe, expect, it } from "vitest";
import {
  companyRegistrationLabels,
  companyRegistrationLegalSuffix,
  isCompanyRequisiteMonoField,
  isCompanyRequisiteWideField,
  keepBrandNameTogether,
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

  it("keepBrandNameTogether: не рвёт «Часть Души»", () => {
    expect(keepBrandNameTogether("Общество с ограниченной ответственностью «Часть Души»")).toBe(
      "Общество с ограниченной ответственностью «Часть\u00A0Души»",
    );
    expect(keepBrandNameTogether("ООО Часть Души")).toBe("ООО Часть\u00A0Души");
    expect(keepBrandNameTogether("сейчас строит Часть души.")).toBe("сейчас строит Часть\u00A0души.");
  });

  it("классификация полей реквизитов", () => {
    expect(isCompanyRequisiteMonoField("ИНН")).toBe(true);
    expect(isCompanyRequisiteMonoField("Полное наименование")).toBe(false);
    expect(isCompanyRequisiteWideField("Полное наименование")).toBe(true);
    expect(isCompanyRequisiteWideField("БИК")).toBe(false);
  });
});
