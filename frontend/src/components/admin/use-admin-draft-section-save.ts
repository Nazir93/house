"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { DraftSectionSaveUiState } from "@/components/admin/admin-draft-section-save";
import type { ClientProjectDraftSection } from "@/lib/client-project-draft";
import { isDraftPayloadDirty, stableDraftPayloadString } from "@/lib/draft-section-baseline";

const PAYLOAD_SECTIONS: ClientProjectDraftSection[] = ["main", "stages", "payments"];
const MEDIA_SECTIONS: ClientProjectDraftSection[] = ["documents", "photos"];

type SectionSaveMeta =
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string };

export function useAdminDraftSectionSave({
  projectId,
  baselineKey,
  buildDraftPayload,
  router,
  setGlobalErr,
}: {
  projectId: string;
  /** Меняется при загрузке объекта с сервера (обновление страницы, router.refresh). */
  baselineKey: string;
  buildDraftPayload: (section: ClientProjectDraftSection) => Record<string, unknown>;
  router: AppRouterInstance;
  setGlobalErr: (message: string) => void;
}) {
  const [savingSection, setSavingSection] = useState<ClientProjectDraftSection | null>(null);
  const [saveMeta, setSaveMeta] = useState<Partial<Record<ClientProjectDraftSection, SectionSaveMeta>>>({});
  const [mediaDirty, setMediaDirty] = useState<Partial<Record<"documents" | "photos", boolean>>>({});
  const [snapshotsReady, setSnapshotsReady] = useState(false);

  const snapshotsRef = useRef<Partial<Record<ClientProjectDraftSection, string>>>({});
  const lastBaselineKeyRef = useRef(baselineKey);

  const payloadBySection = useMemo(() => {
    const out: Partial<Record<ClientProjectDraftSection, string>> = {};
    for (const section of PAYLOAD_SECTIONS) {
      out[section] = stableDraftPayloadString(buildDraftPayload(section));
    }
    return out as Record<(typeof PAYLOAD_SECTIONS)[number], string>;
  }, [buildDraftPayload]);

  useEffect(() => {
    if (lastBaselineKeyRef.current === baselineKey) return;
    lastBaselineKeyRef.current = baselineKey;
    snapshotsRef.current = {};
    setSnapshotsReady(false);
    setMediaDirty({});
    setSaveMeta({});
  }, [baselineKey]);

  useEffect(() => {
    if (snapshotsReady) return;

    const timer = window.setTimeout(() => {
      for (const section of PAYLOAD_SECTIONS) {
        snapshotsRef.current[section] = payloadBySection[section];
      }
      setSnapshotsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [payloadBySection, snapshotsReady, baselineKey]);

  const isPayloadDirty = useCallback(
    (section: (typeof PAYLOAD_SECTIONS)[number]) =>
      isDraftPayloadDirty(snapshotsReady, payloadBySection[section], snapshotsRef.current[section]),
    [payloadBySection, snapshotsReady]
  );

  const isSectionDirty = useCallback(
    (section: ClientProjectDraftSection): boolean => {
      if (section === "documents" || section === "photos") {
        return Boolean(mediaDirty[section]);
      }
      return isPayloadDirty(section);
    },
    [isPayloadDirty, mediaDirty]
  );

  const getUiState = useCallback(
    (section: ClientProjectDraftSection): DraftSectionSaveUiState => {
      if (savingSection === section) return "saving";
      const meta = saveMeta[section];
      if (meta?.kind === "error") return "error";
      if (meta?.kind === "saved" && !isSectionDirty(section)) return "saved";
      if (isSectionDirty(section)) return "dirty";
      return "idle";
    },
    [savingSection, saveMeta, isSectionDirty]
  );

  const getErrorMessage = useCallback(
    (section: ClientProjectDraftSection): string | undefined => {
      const meta = saveMeta[section];
      return meta?.kind === "error" ? meta.message : undefined;
    },
    [saveMeta]
  );

  const markMediaSectionDirty = useCallback((section: "documents" | "photos") => {
    setMediaDirty((prev) => ({ ...prev, [section]: true }));
    setSaveMeta((prev) => {
      if (!prev[section]) return prev;
      const next = { ...prev };
      delete next[section];
      return next;
    });
  }, []);

  const saveDraftSection = useCallback(
    async (section: ClientProjectDraftSection) => {
      setSavingSection(section);
      setGlobalErr("");
      setSaveMeta((prev) => {
        const next = { ...prev };
        delete next[section];
        return next;
      });

      try {
        const res = await fetch(`/api/admin/client-projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...buildDraftPayload(section),
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

        if (PAYLOAD_SECTIONS.includes(section as (typeof PAYLOAD_SECTIONS)[number])) {
          snapshotsRef.current[section] = payloadBySection[section as (typeof PAYLOAD_SECTIONS)[number]];
        }
        if (section === "documents" || section === "photos") {
          setMediaDirty((prev) => ({ ...prev, [section]: false }));
        }

        setSaveMeta((prev) => ({
          ...prev,
          [section]: { kind: "saved", at: Date.now() },
        }));

        router.refresh();
        return { ok: true as const, hasUnpublishedDraft: Boolean(data.hasUnpublishedDraft) };
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
    [projectId, buildDraftPayload, payloadBySection, router, setGlobalErr]
  );

  useEffect(() => {
    for (const section of [...PAYLOAD_SECTIONS, ...MEDIA_SECTIONS]) {
      if (!isSectionDirty(section)) continue;
      setSaveMeta((prev) => {
        const meta = prev[section];
        if (meta?.kind !== "saved") return prev;
        const next = { ...prev };
        delete next[section];
        return next;
      });
    }
  }, [payloadBySection, mediaDirty, isSectionDirty]);

  return {
    savingSection,
    getUiState,
    getErrorMessage,
    saveDraftSection,
    markMediaSectionDirty,
    isSectionDirty,
  };
}
