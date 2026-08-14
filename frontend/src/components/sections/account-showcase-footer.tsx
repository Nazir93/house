"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, UserRound } from "lucide-react";

import { ACCOUNT_SHOWCASE_FOOTER_GUEST_TEXT } from "@/lib/account-showcase";

type ClientDashboardPreview = {
  clientName: string | null;
  title: string | null;
  contractNumber: string;
  overallProgress: number;
  currentStageLabel: string | null;
};

export function AccountShowcaseFooter() {
  const { data: session, status } = useSession();
  const isClient = session?.user?.role === "client";
  const [preview, setPreview] = useState<ClientDashboardPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (!isClient) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);

    fetch("/api/client/dashboard", { credentials: "same-origin" })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.project) return;
        const p = data.project as ClientDashboardPreview;
        setPreview({
          clientName: p.clientName,
          title: p.title,
          contractNumber: p.contractNumber,
          overallProgress: p.overallProgress ?? 0,
          currentStageLabel: p.currentStageLabel,
        });
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  if (status === "loading") {
    return (
      <div className="mt-10 border-t border-[var(--border)] pt-10">
        <p className="text-sm text-[var(--text-muted)]">Загрузка…</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          {ACCOUNT_SHOWCASE_FOOTER_GUEST_TEXT}
        </p>
        <Link
          href="/account/login"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--accent-contrast)] shadow-[0_14px_40px_color-mix(in_srgb,var(--accent)_25%,transparent)] transition hover:bg-[var(--accent-hover)]"
        >
          Войти в кабинет
          <ArrowRight className="h-4 w-4" strokeWidth={2.1} aria-hidden />
        </Link>
      </div>
    );
  }

  const displayName =
    session?.user?.name?.trim() ||
    preview?.clientName?.trim() ||
    "Клиент";
  const projectLine =
    preview?.title?.trim() ||
    (preview?.contractNumber ? `Договор № ${preview.contractNumber}` : null);
  const progress = preview?.overallProgress ?? 0;

  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_28%,transparent)]"
        >
          <UserRound className="h-6 w-6" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold text-[var(--text)] sm:text-xl">{displayName}</p>
          {loadingPreview && !preview ? (
            <p className="mt-1 text-sm text-[var(--text-muted)]">Загрузка данных…</p>
          ) : null}
          {projectLine ? (
            <p className="mt-1 text-sm font-medium text-[var(--text)]">{projectLine}</p>
          ) : null}
          {preview?.currentStageLabel ? (
            <p className="mt-1 text-sm text-[var(--text-muted)]">Сейчас: {preview.currentStageLabel}</p>
          ) : null}
          {preview != null ? (
            <div className="mt-3 max-w-md">
              <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                <span>Готовность объекта</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_80%,transparent)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Link
        href="/account/dashboard"
        className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--accent-contrast)] shadow-[0_14px_40px_color-mix(in_srgb,var(--accent)_25%,transparent)] transition hover:bg-[var(--accent-hover)]"
      >
        В кабинет
        <ArrowRight className="h-4 w-4" strokeWidth={2.1} aria-hidden />
      </Link>
    </div>
  );
}
