"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ProjectCompareEntry } from "@/lib/project-compare";
import {
  type CompareQuoteCell,
  type CompareUnifiedSettings,
  compareQuoteFallbackBodies,
  compareColumnKey,
  emptyCompareQuoteCell,
} from "@/lib/project-compare-unified";
import { buildCompareSettingsKey } from "@/lib/project-compare-unified";
import type { ProjectCalculatorQuoteResponse } from "@/lib/use-project-calculator-quote";

type Column = { entry: ProjectCompareEntry };

async function postProjectQuote(
  slug: string,
  body: ReturnType<typeof compareQuoteFallbackBodies>[number],
): Promise<{ ok: boolean; status: number; data: ProjectCalculatorQuoteResponse | { error?: string } }> {
  const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as ProjectCalculatorQuoteResponse | { error?: string };
  return { ok: res.ok, status: res.status, data };
}

function cellFromQuote(
  quote: ProjectCalculatorQuoteResponse,
  fallbackUsed: boolean,
): CompareQuoteCell {
  const q = quote.quote;
  return {
    grandTotalRub: q.grandTotalRub,
    shellTotalRub: q.shellTotalRub,
    facadeTotalRub: q.facadeTotalRub,
    engineeringTotalRub: q.engineeringTotalRub,
    constructionTotalRub: q.constructionTotalRub,
    transportSurchargeRub: q.transportSurchargeRub,
    engineeringLines: q.engineeringLines,
    constructionLines: q.constructionLines,
    fallbackUsed,
    error: null,
  };
}

async function fetchCompareQuoteForSlug(
  slug: string,
  settings: CompareUnifiedSettings,
): Promise<CompareQuoteCell> {
  const bodies = compareQuoteFallbackBodies(settings);

  for (let i = 0; i < bodies.length; i++) {
    const result = await postProjectQuote(slug, bodies[i]);
    if (result.ok && "quote" in result.data) {
      return cellFromQuote(result.data, i > 0);
    }
    const err = "error" in result.data ? result.data.error : undefined;
    const retryable =
      result.status === 400 && (err === "invalid_option" || err === "invalid_facade");
    if (!retryable) {
      return emptyCompareQuoteCell(err ?? "Ошибка расчёта");
    }
  }

  return emptyCompareQuoteCell("Ошибка расчёта");
}

export function useProjectCompareQuotes(params: {
  columns: Column[];
  settings: CompareUnifiedSettings;
  enabled?: boolean;
}) {
  const [quotes, setQuotes] = useState<Map<string, CompareQuoteCell>>(new Map());
  const [loading, setLoading] = useState(false);
  const seqRef = useRef(0);

  const columnKeys = useMemo(
    () => params.columns.map(({ entry }) => compareColumnKey(entry)).join("|"),
    [params.columns],
  );

  const settingsKey = useMemo(() => buildCompareSettingsKey(params.settings), [params.settings]);

  const fetchAll = useCallback(async () => {
    if (params.enabled === false || params.columns.length === 0) {
      setQuotes(new Map());
      return;
    }

    const seq = ++seqRef.current;
    setLoading(true);

    const results = await Promise.all(
      params.columns.map(async ({ entry }) => {
        const key = compareColumnKey(entry);
        try {
          const cell = await fetchCompareQuoteForSlug(entry.slug, params.settings);
          return [key, cell] as const;
        } catch {
          return [key, emptyCompareQuoteCell("Ошибка сети")] as const;
        }
      }),
    );

    if (seq !== seqRef.current) return;

    setQuotes(new Map(results));
    setLoading(false);
  }, [params.columns, params.enabled, params.settings]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchAll();
    }, 220);
    return () => window.clearTimeout(t);
  }, [fetchAll, columnKeys, settingsKey]);

  return { quotes, loading, refetch: fetchAll };
}
