"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

import { BackNavLink } from "@/components/ui/back-nav";
import { ProjectCompareTable, type CompareColumn } from "@/components/projects/project-compare-table";
import { ProjectCompareUnifiedPanel } from "@/components/projects/project-compare-unified-panel";
import { ProjectCompareStatusToast } from "@/components/projects/project-compare-status-toast";
import { useModal } from "@/lib/modal-context";
import { useProjectCompare } from "@/lib/project-compare-context";
import {
  PROJECT_COMPARE_MAX,
  PROJECT_COMPARE_PAGE_PATH,
  buildComparePageHref,
} from "@/lib/project-compare";
import {
  DEFAULT_COMPARE_UNIFIED_SETTINGS,
  aggregateCompareQuoteLineAmounts,
  compareColumnKey,
  findCheapestCompareQuoteKey,
  readCompareSettingsFromStorage,
  writeCompareSettingsToStorage,
  type CompareUnifiedSettings,
} from "@/lib/project-compare-unified";
import { useProjectCompareQuotes } from "@/lib/use-project-compare-quotes";

type Props = {
  columns: CompareColumn[];
  missingEntries: CompareColumn["entry"][];
};

function ruRemainingSlots(count: number): string {
  const left = PROJECT_COMPARE_MAX - count;
  if (left <= 0) return "Достигнут лимит — 4 проекта";
  const mod10 = left % 10;
  const mod100 = left % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "проект"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)
        ? "проекта"
        : "проектов";
  return `Можно добавить ещё ${left} ${word}`;
}

export function ProjectComparePageContent({ columns, missingEntries }: Props) {
  const compare = useProjectCompare();
  const router = useRouter();
  const { openModalToEstimate } = useModal();
  const [unifiedSettings, setUnifiedSettings] = useState<CompareUnifiedSettings>(
    DEFAULT_COMPARE_UNIFIED_SETTINGS,
  );
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatusMessage = useCallback((message: string) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    setStatusMessage(message);
    statusTimerRef.current = setTimeout(() => setStatusMessage(null), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setUnifiedSettings(readCompareSettingsFromStorage());
    setSettingsHydrated(true);
  }, []);

  const handleUnifiedSettingsChange = useCallback((next: CompareUnifiedSettings) => {
    setUnifiedSettings(next);
    writeCompareSettingsToStorage(next);
  }, []);

  const { quotes, loading: quotesLoading } = useProjectCompareQuotes({
    columns,
    settings: unifiedSettings,
    enabled: settingsHydrated && columns.length > 0,
  });

  const cheapestKey = useMemo(() => findCheapestCompareQuoteKey(quotes), [quotes]);
  const lineAmounts = useMemo(
    () => aggregateCompareQuoteLineAmounts(quotes, unifiedSettings.facadeSlug),
    [quotes, unifiedSettings.facadeSlug],
  );

  const entryKeys = useMemo(
    () => columns.map(({ entry }) => `${entry.catalogKind}:${entry.slug}`).join("|"),
    [columns],
  );

  useEffect(() => {
    compare.replaceEntries(columns.map(({ entry }) => entry));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync server columns once per fetch
  }, [entryKeys]);

  useEffect(() => {
    if (!compare.hydrated || typeof window === "undefined") return;
    const href = buildComparePageHref(compare.entries);
    if (href !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", href);
    }
  }, [compare.entries, compare.hydrated]);

  const handleClearList = useCallback(() => {
    compare.clear();
    router.replace(PROJECT_COMPARE_PAGE_PATH);
    showStatusMessage("Список сравнения очищен");
  }, [compare, router, showStatusMessage]);

  const slotsLeft = PROJECT_COMPARE_MAX - columns.length;

  const consultPayload = useMemo(
    () => ({
      source: "compare",
      service: "Сравнение проектов",
      calcData: {
        tierId: unifiedSettings.tierId,
        tierLabel: unifiedSettings.tierLabel,
        facadeSlug: unifiedSettings.facadeSlug,
        engineeringSlugs: unifiedSettings.engineeringSlugs,
        constructionSlugs: unifiedSettings.constructionSlugs,
        transportBandId: unifiedSettings.transportBandId,
        projects: columns.map(({ entry, project }) => {
          const key = compareColumnKey(entry);
          const quote = quotes.get(key);
          return {
            slug: entry.slug,
            catalogKind: entry.catalogKind,
            title: project.title,
            grandTotalRub: quote?.grandTotalRub ?? null,
          };
        }),
      },
    }),
    [columns, quotes, unifiedSettings],
  );

  return (
    <>
      <ProjectCompareStatusToast message={statusMessage} />

      <div className="container mx-auto px-5 pb-24 pt-8 md:pt-12">
      <BackNavLink href="/projects" className="mb-6">
        К каталогу проектов
      </BackNavLink>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-[var(--graphite)]">Сравнение проектов</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{ruRemainingSlots(columns.length)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{ borderColor: "var(--border)" }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Добавить проект
          </Link>
          {columns.length > 0 ? (
            <button
              type="button"
              onClick={handleClearList}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] underline-offset-4 hover:underline"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Очистить список
            </button>
          ) : null}
        </div>
      </div>

      {missingEntries.length > 0 ? (
        <p className="mt-4 rounded-2xl border px-4 py-3 text-sm text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
          Некоторые проекты из ссылки не найдены или сняты с публикации ({missingEntries.length}).
        </p>
      ) : null}

      {columns.length === 0 ? (
        <div className="mt-12 rounded-[28px] border px-6 py-16 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-lg text-[var(--text-muted)]">Список сравнения пуст</p>
          <p className="mt-2 text-sm text-[var(--text-subtle)]">
            Нажмите «+» на карточке проекта в каталоге — можно сравнить до {PROJECT_COMPARE_MAX} домов.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Перейти в каталог
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          <ProjectCompareUnifiedPanel
            settings={unifiedSettings}
            onChange={handleUnifiedSettingsChange}
            loading={quotesLoading}
            lineAmounts={lineAmounts}
            onStatusMessage={showStatusMessage}
          />

          <div className="mt-8 overflow-x-auto pb-2">
            <ProjectCompareTable
              columns={columns}
              slotsLeft={slotsLeft}
              quotes={quotes}
              quotesLoading={quotesLoading}
              cheapestKey={cheapestKey}
              onRemove={(entry) => compare.remove(entry)}
            />
          </div>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openModalToEstimate(consultPayload)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f3d2e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#134d3a]"
            >
              Консультация по выбранным проектам
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <p className="text-sm text-[var(--text-muted)]">
              Менеджер увидит проекты, комплектацию и рассчитанные цены.
            </p>
          </div>
        </>
      )}
      </div>
    </>
  );
}
