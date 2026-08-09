import { describe, expect, it } from "vitest";

import { getServiceHubCopy } from "@/lib/services-hub-data";
import {
  isCodeOwnedServiceHubSegment,
  resolveServiceHubDisplay,
} from "@/lib/resolve-service-hub-display";

describe("isCodeOwnedServiceHubSegment", () => {
  it("проектирование — code-owned", () => {
    expect(isCodeOwnedServiceHubSegment("proektirovanie")).toBe(true);
    expect(isCodeOwnedServiceHubSegment("projecting")).toBe(true);
  });

  it("остальные услуги — CMS", () => {
    expect(isCodeOwnedServiceHubSegment("fundament")).toBe(false);
    expect(isCodeOwnedServiceHubSegment("karkas")).toBe(false);
  });
});

describe("resolveServiceHubDisplay", () => {
  it("fundament: title и shortDescription из CMS перекрывают хаб-шаблон", () => {
    const hub = getServiceHubCopy("fundament");
    const display = resolveServiceHubDisplay(
      "fundament",
      { title: "Фундамент CMS", shortDescription: "Описание из админки" },
      hub,
    );
    expect(display.navTitle).toBe("Фундамент CMS");
    expect(display.cardTitle).toBe("Фундамент CMS");
    expect(display.cardDescription).toBe("Описание из админки");
    expect(display.features.length).toBeGreaterThan(0);
    expect(display.features[0]?.label).toBe(hub?.features[0]?.label);
  });

  it("fundament: пустой CMS — fallback на хаб-шаблон", () => {
    const hub = getServiceHubCopy("fundament");
    const display = resolveServiceHubDisplay("fundament", { title: "  ", shortDescription: "" }, hub);
    expect(display.navTitle).toBe(hub?.navTitle);
    expect(display.cardDescription).toBe(hub?.cardDescription);
  });

  it("proektirovanie: хаб-копирайт побеждает CMS", () => {
    const hub = getServiceHubCopy("proektirovanie");
    const display = resolveServiceHubDisplay(
      "proektirovanie",
      { title: "Другое название из CMS", shortDescription: "Чужой текст" },
      hub,
    );
    expect(display.navTitle).toBe(hub?.navTitle);
    expect(display.cardDescription).toBe(hub?.cardDescription);
  });

  it("proektirovanie: без хаб-копирайта — CMS как fallback", () => {
    const display = resolveServiceHubDisplay(
      "proektirovanie",
      { title: "Fallback title", shortDescription: "Fallback desc" },
      null,
    );
    expect(display.navTitle).toBe("Fallback title");
    expect(display.cardDescription).toBe("Fallback desc");
  });
});
