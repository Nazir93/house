import { describe, expect, it } from "vitest";

import {
  computeTransportSurchargeRub,
  DEFAULT_TRANSPORT_BANDS,
  normalizeTransportBands,
  transportBandPercentLabel,
} from "@/lib/project-transport-surcharge";

describe("project-transport-surcharge", () => {
  it("проценты по зонам: 30→1.5%, 40→2.25%, 50→3%, 100→6.5%", () => {
    const base = 10_000_000;
    expect(computeTransportSurchargeRub(base, DEFAULT_TRANSPORT_BANDS[1])).toBe(150_000);
    expect(computeTransportSurchargeRub(base, DEFAULT_TRANSPORT_BANDS[2])).toBe(225_000);
    expect(computeTransportSurchargeRub(base, DEFAULT_TRANSPORT_BANDS[3])).toBe(300_000);
    expect(computeTransportSurchargeRub(base, DEFAULT_TRANSPORT_BANDS[4])).toBe(650_000);
  });

  it("неизвестное расстояние — 0 ₽", () => {
    expect(computeTransportSurchargeRub(5_000_000, DEFAULT_TRANSPORT_BANDS[0])).toBe(0);
  });

  it("normalizeTransportBands подставляет percent из пресета", () => {
    const bands = normalizeTransportBands([
      { id: "30", label: "до 30 км", surcharge: 0 },
    ]);
    expect(bands[0].percent).toBe(1.5);
    expect(computeTransportSurchargeRub(2_000_000, bands[0])).toBe(30_000);
  });

  it("фиксированный surcharge, если percent не задан", () => {
    expect(
      computeTransportSurchargeRub(1_000_000, { id: "custom", label: "x", surcharge: 50_000 }),
    ).toBe(50_000);
  });

  it("transportBandPercentLabel", () => {
    expect(transportBandPercentLabel(DEFAULT_TRANSPORT_BANDS[1])).toBe("1.5%");
    expect(transportBandPercentLabel(DEFAULT_TRANSPORT_BANDS[0])).toBeNull();
  });
});
