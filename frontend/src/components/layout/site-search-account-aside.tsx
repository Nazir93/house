"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, FileText, LayoutDashboard, ListOrdered, MessageCircle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type ClientDashboardPreview = {
  clientName: string | null;
  title: string | null;
  contractNumber: string;
  overallProgress: number;
  currentStageLabel: string | null;
};

function accountLinkClass(isLight: boolean, primary = false) {
  if (primary) {
    return cn(
      "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap transition hover:-translate-y-0.5",
      isLight
        ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_12px_32px_rgba(15,61,46,0.22)] hover:bg-[var(--accent-hover)]"
        : "bg-white text-[#0f3d2e] shadow-[0_12px_36px_rgba(0,0,0,0.22)] hover:bg-white/95",
    );
  }
  return cn(
    "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap transition",
    isLight
      ? "border-[rgba(26,30,29,0.12)] bg-white/70 text-[var(--text)] hover:bg-white"
      : "border-white/15 bg-black/25 text-white/90 hover:bg-black/40",
  );
}

export function SiteSearchAccountAside({
  open,
  onClose,
  openModal,
  isLight,
  glassPane,
}: {
  open: boolean;
  onClose: () => void;
  openModal: () => void;
  isLight: boolean;
  glassPane: string;
}) {
  const { data: session, status } = useSession();
  const isClient = session?.user?.role === "client";
  const [preview, setPreview] = useState<ClientDashboardPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (!open || !isClient) {
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
  }, [open, isClient]);

  const displayName =
    session?.user?.name?.trim() ||
    preview?.clientName?.trim() ||
    "Клиент";
  const projectLine =
    preview?.title?.trim() ||
    (preview?.contractNumber ? `Договор № ${preview.contractNumber}` : null);

  return (
    <aside
      className={cn(
        glassPane,
        "order-2 flex w-full shrink-0 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:order-2 lg:col-start-2 lg:max-h-full lg:min-h-0 lg:justify-between lg:gap-4 lg:p-5",
      )}
    >
      <div className="min-w-0">
        <div
          className={cn(
            "overflow-hidden rounded-2xl border p-1.5 shadow-lg sm:rounded-[1.25rem] sm:p-2 lg:mb-3",
            isLight
              ? "border-[rgba(26,30,29,0.12)] bg-[var(--stone)] shadow-[0_8px_24px_rgba(15,61,46,0.06)]"
              : "border-black/40 bg-black/35 shadow-black/30",
          )}
        >
          <div
            className={cn(
              "flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 sm:gap-3 sm:rounded-[1.05rem] sm:px-4 sm:py-3.5",
              isLight ? "bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]" : "bg-black/30",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md sm:h-12 sm:w-12 sm:rounded-2xl",
                isLight ? "bg-[var(--accent)] text-[var(--on-accent)]" : "bg-white text-[#0f3d2e]",
              )}
            >
              <UserRound className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "font-heading text-sm font-bold sm:text-base lg:text-lg",
                  isLight ? "text-[var(--text)]" : "text-white",
                )}
              >
                {isClient ? displayName : "Личный кабинет"}
              </h3>

              {isClient ? (
                <div className="mt-1.5 space-y-1.5 sm:mt-2 sm:space-y-2">
                  {loadingPreview && !preview ? (
                    <p
                      className={cn(
                        "text-xs",
                        isLight ? "text-[color:var(--text-subtle)]" : "text-white/55",
                      )}
                    >
                      Загрузка данных…
                    </p>
                  ) : null}

                  {projectLine ? (
                    <p
                      className={cn(
                        "line-clamp-2 text-xs font-medium leading-snug sm:text-sm",
                        isLight ? "text-[var(--text)]" : "text-white/92",
                      )}
                    >
                      {projectLine}
                    </p>
                  ) : null}

                  {preview?.currentStageLabel ? (
                    <p
                      className={cn(
                        "hidden text-xs leading-snug sm:block",
                        isLight ? "text-[color:var(--text-subtle)]" : "text-white/62",
                      )}
                    >
                      Сейчас: {preview.currentStageLabel}
                    </p>
                  ) : null}

                  {preview != null ? (
                    <div className="hidden sm:block">
                      <div
                        className={cn(
                          "mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em]",
                          isLight ? "text-[color:var(--text-subtle)]" : "text-white/55",
                        )}
                      >
                        <span>Готовность</span>
                        <span>{Math.round(preview.overallProgress)}%</span>
                      </div>
                      <div
                        className={cn(
                          "h-2 overflow-hidden rounded-full",
                          isLight ? "bg-black/[0.08]" : "bg-white/10",
                        )}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isLight ? "bg-[var(--accent)]" : "bg-emerald-400",
                          )}
                          style={{ width: `${Math.min(100, Math.max(0, preview.overallProgress))}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p
                  className={cn(
                    "mt-1 line-clamp-2 text-[11px] leading-snug sm:text-xs lg:text-sm",
                    isLight ? "text-[color:var(--text-subtle)]" : "text-white/62",
                  )}
                >
                  Статус стройки, документы и связь с менеджером.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 border-t pt-3 sm:gap-2.5 sm:pt-4",
          isLight ? "border-[rgba(26,30,29,0.12)]" : "border-white/10",
        )}
      >
        {isClient ? (
          <>
            <Link href="/account/dashboard" onClick={onClose} className={accountLinkClass(isLight, true)}>
              В кабинет
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            </Link>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <Link href="/account/stages" onClick={onClose} className={accountLinkClass(isLight)}>
                <ListOrdered className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Этапы
              </Link>
              <Link href="/account/documents" onClick={onClose} className={accountLinkClass(isLight)}>
                <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Документы
              </Link>
              <Link href="/account/support" onClick={onClose} className={accountLinkClass(isLight)}>
                <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Связь
              </Link>
            </div>
          </>
        ) : (
          <Link href="/account/login" onClick={onClose} className={accountLinkClass(isLight, true)}>
            Войти в кабинет
            <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          </Link>
        )}

        {!isClient && status !== "loading" ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              openModal();
            }}
            className={cn(
              "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] transition",
              isLight
                ? "border-transparent bg-[var(--sale)] text-[var(--on-sale)] shadow-[0_10px_28px_rgba(110,42,31,0.22)] hover:bg-[var(--sale-hover)]"
                : "border-black/40 bg-black/55 text-white shadow-[0_12px_36px_rgba(0,0,0,0.25)] hover:bg-black/70",
            )}
          >
            Оставить заявку
          </button>
        ) : null}
      </div>
    </aside>
  );
}
