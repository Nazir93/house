"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_HOUSE_CONSTRUCTION_CONFIG,
  type HouseConstructionCalculatorConfig,
} from "@/lib/house-construction-calculator";

/** Загрузка прайса калькулятора с сервера (админка → SiteSettings). Пока грузится — дефолт из кода. */
export function useHouseConstructionCalculatorConfig() {
  const [config, setConfig] = useState<HouseConstructionCalculatorConfig>(DEFAULT_HOUSE_CONSTRUCTION_CONFIG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/calculator-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: HouseConstructionCalculatorConfig | null) => {
        if (!cancelled && data && typeof data === "object" && data.baseRubPerM2 && data.smallArea) {
          setConfig(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, ready };
}
