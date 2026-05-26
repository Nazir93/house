"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ProjectCalculatorQuoteResponse = {
  quote: {
    categoryId: string;
    shellTotalRub: number;
    facadeTotalRub: number;
    engineeringLines: { id: string; label: string; amountRub: number }[];
    engineeringTotalRub: number;
    constructionLines: { id: string; label: string; amountRub: number }[];
    constructionTotalRub: number;
    transportSurchargeRub: number;
    grandTotalRub: number;
  };
  meta: {
    projectSlug: string;
    categoryId: string;
    area: number;
  };
};

export function useProjectCalculatorQuote(params: {
  projectSlug: string;
  tierId: string;
  tierLabel: string;
  facadeSlug: string | null;
  engineeringSlugs: string[];
  constructionSlugs: string[];
  transportBandId: string;
  enabled?: boolean;
}) {
  const [data, setData] = useState<ProjectCalculatorQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);

  const fetchQuote = useCallback(async () => {
    if (params.enabled === false) return;
    const seq = ++seqRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(params.projectSlug)}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: params.tierId,
          tierLabel: params.tierLabel,
          facadeSlug: params.facadeSlug,
          engineeringSlugs: params.engineeringSlugs,
          constructionSlugs: params.constructionSlugs,
          transportBandId: params.transportBandId,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Ошибка расчёта (${res.status})`);
      }
      const json = (await res.json()) as ProjectCalculatorQuoteResponse;
      if (seq === seqRef.current) setData(json);
    } catch (e) {
      if (seq === seqRef.current) {
        setError(e instanceof Error ? e.message : "Ошибка расчёта");
        setData(null);
      }
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, [
    params.enabled,
    params.projectSlug,
    params.tierId,
    params.tierLabel,
    params.facadeSlug,
    params.engineeringSlugs,
    params.constructionSlugs,
    params.transportBandId,
  ]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchQuote();
    }, 180);
    return () => window.clearTimeout(t);
  }, [fetchQuote]);

  return { data, loading, error, refetch: fetchQuote };
}
