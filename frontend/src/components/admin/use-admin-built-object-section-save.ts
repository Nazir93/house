"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { DraftSectionSaveUiState } from "@/components/admin/admin-draft-section-save";
import {
  type BuiltObjectAdminSection,
  builtObjectSectionPayloadString,
} from "@/lib/built-object-admin-sections";
import { isDraftPayloadDirty } from "@/lib/draft-section-baseline";

const SECTIONS: BuiltObjectAdminSection[] = ["main", "history", "media", "phases"];

type SectionSaveMeta =
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string };

export function useAdminBuiltObjectSectionSave({
  objectId,
  baselineKey,
  buildSectionPayload,
  buildFormSnapshot,
  router,
  setGlobalErr,
  onObjectCreated,
}: {
  objectId: string;
  baselineKey: string;
  buildSectionPayload: (section: BuiltObjectAdminSection) => Record<string, unknown>;
  buildFormSnapshot: () => Parameters<typeof builtObjectSectionPayloadString>[1];
  router: AppRouterInstance;
  setGlobalErr: (message: string) => void;
  onObjectCreated?: (id: string) => void;
}) {
  const [savingSection, setSavingSection] = useState<BuiltObjectAdminSection | null>(null);
  const [saveMeta, setSaveMeta] = useState<Partial<Record<BuiltObjectAdminSection, SectionSaveMeta>>>({});
  const [snapshotsReady, setSnapshotsReady] = useState(false);

  const snapshotsRef = useRef<Partial<Record<BuiltObjectAdminSection, string>>>({});
  const lastBaselineKeyRef = useRef(baselineKey);

  const payloadBySection = useMemo(() => {
    const snapshot = buildFormSnapshot();
    const out: Partial<Record<BuiltObjectAdminSection, string>> = {};
    for (const section of SECTIONS) {
      out[section] = builtObjectSectionPayloadString(section, snapshot);
    }
    return out as Record<BuiltObjectAdminSection, string>;
  }, [buildFormSnapshot]);

  useEffect(() => {
    if (lastBaselineKeyRef.current === baselineKey) return;
    lastBaselineKeyRef.current = baselineKey;
    snapshotsRef.current = {};
    setSnapshotsReady(false);
    setSaveMeta({});
  }, [baselineKey]);

  useEffect(() => {
    if (snapshotsReady) return;

    const timer = window.setTimeout(() => {
      for (const section of SECTIONS) {
        snapshotsRef.current[section] = payloadBySection[section];
      }
      setSnapshotsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [payloadBySection, snapshotsReady, baselineKey]);

  const isSectionDirty = useCallback(
    (section: BuiltObjectAdminSection) =>
      isDraftPayloadDirty(snapshotsReady, payloadBySection[section], snapshotsRef.current[section]),
    [payloadBySection, snapshotsReady],
  );

  const getUiState = useCallback(
    (section: BuiltObjectAdminSection): DraftSectionSaveUiState => {
      if (savingSection === section) return "saving";
      const meta = saveMeta[section];
      if (meta?.kind === "error") return "error";
      if (meta?.kind === "saved" && !isSectionDirty(section)) return "saved";
      if (isSectionDirty(section)) return "dirty";
      return "idle";
    },
    [savingSection, saveMeta, isSectionDirty],
  );

  const getErrorMessage = useCallback(
    (section: BuiltObjectAdminSection): string | undefined => {
      const meta = saveMeta[section];
      return meta?.kind === "error" ? meta.message : undefined;
    },
    [saveMeta],
  );

  const saveSection = useCallback(
    async (section: BuiltObjectAdminSection) => {
      setSavingSection(section);
      setGlobalErr("");
      setSaveMeta((prev) => {
        const next = { ...prev };
        delete next[section];
        return next;
      });

      try {
        const payload = buildSectionPayload(section);
        const isCreate = !objectId && section === "main";
        const endpoint = isCreate ? "/api/admin/built-objects" : `/api/admin/built-objects/${objectId}`;
        const method = isCreate ? "POST" : "PUT";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            draftSection: section,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = typeof data?.error === "string" ? data.error : "Ошибка сохранения";
          setSaveMeta((prev) => ({
            ...prev,
            [section]: { kind: "error", message },
          }));
          return { ok: false as const };
        }

        if (isCreate && typeof data?.id === "string") {
          onObjectCreated?.(data.id);
        }

        snapshotsRef.current[section] = payloadBySection[section];
        setSaveMeta((prev) => ({
          ...prev,
          [section]: { kind: "saved", at: Date.now() },
        }));

        router.refresh();
        return {
          ok: true as const,
          hasUnpublishedDraft: Boolean(data.hasUnpublishedDraft),
        };
      } catch {
        setSaveMeta((prev) => ({
          ...prev,
          [section]: { kind: "error", message: "Сеть" },
        }));
        return { ok: false as const };
      } finally {
        setSavingSection(null);
      }
    },
    [objectId, buildSectionPayload, payloadBySection, router, setGlobalErr, onObjectCreated],
  );

  useEffect(() => {
    for (const section of SECTIONS) {
      if (!isSectionDirty(section)) continue;
      setSaveMeta((prev) => {
        const meta = prev[section];
        if (meta?.kind !== "saved") return prev;
        const next = { ...prev };
        delete next[section];
        return next;
      });
    }
  }, [payloadBySection, isSectionDirty]);

  return {
    savingSection,
    getUiState,
    getErrorMessage,
    saveSection,
    isSectionDirty,
    sectionsReady: Boolean(objectId),
  };
}
