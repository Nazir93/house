"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  PROJECT_COMPARE_MAX,
  type ProjectCompareEntry,
  type ToggleCompareResult,
  buildComparePageHref,
  normalizeCompareEntries,
  readCompareEntriesFromStorage,
  removeCompareEntry,
  toggleCompareEntry,
  writeCompareEntriesToStorage,
} from "@/lib/project-compare";

type ProjectCompareContextValue = {
  hydrated: boolean;
  entries: ProjectCompareEntry[];
  count: number;
  max: number;
  isSelected: (entry: ProjectCompareEntry) => boolean;
  toggle: (entry: ProjectCompareEntry) => ToggleCompareResult;
  remove: (entry: ProjectCompareEntry) => void;
  clear: () => void;
  replaceEntries: (entries: ProjectCompareEntry[]) => void;
  compareHref: string;
};

const ProjectCompareContext = createContext<ProjectCompareContextValue | null>(null);

export function ProjectCompareProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ProjectCompareEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(readCompareEntriesFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCompareEntriesToStorage(entries);
  }, [entries, hydrated]);

  const isSelected = useCallback(
    (entry: ProjectCompareEntry) =>
      entries.some(
        (item) => item.catalogKind === entry.catalogKind && item.slug === entry.slug,
      ),
    [entries],
  );

  const toggle = useCallback((entry: ProjectCompareEntry) => {
    let result: ToggleCompareResult = {
      entries: [],
      added: false,
      removed: false,
      rejectedFull: false,
    };
    setEntries((prev) => {
      result = toggleCompareEntry(prev, entry);
      return result.entries;
    });
    return result;
  }, []);

  const remove = useCallback((entry: ProjectCompareEntry) => {
    setEntries((prev) => removeCompareEntry(prev, entry));
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  const replaceEntries = useCallback((next: ProjectCompareEntry[]) => {
    setEntries(normalizeCompareEntries(next));
  }, []);

  const compareHref = useMemo(() => buildComparePageHref(entries), [entries]);

  const value = useMemo(
    (): ProjectCompareContextValue => ({
      hydrated,
      entries,
      count: entries.length,
      max: PROJECT_COMPARE_MAX,
      isSelected,
      toggle,
      remove,
      clear,
      replaceEntries,
      compareHref,
    }),
    [hydrated, entries, isSelected, toggle, remove, clear, replaceEntries, compareHref],
  );

  return (
    <ProjectCompareContext.Provider value={value}>{children}</ProjectCompareContext.Provider>
  );
}

export function useProjectCompare() {
  const ctx = useContext(ProjectCompareContext);
  if (!ctx) {
    throw new Error("useProjectCompare must be used within ProjectCompareProvider");
  }
  return ctx;
}

/** Безопасный хук для опционального использования (карточки вне провайдера не ломаются). */
export function useProjectCompareOptional(): ProjectCompareContextValue | null {
  return useContext(ProjectCompareContext);
}
