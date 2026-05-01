import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, UserRound } from "lucide-react";
import { SITE_NAME, ACCOUNT_PORTAL_EXTERNAL_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Личный кабинет — ${SITE_NAME}`,
  description: `Вход в личный кабинет клиента ${SITE_NAME}.`,
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  if (ACCOUNT_PORTAL_EXTERNAL_URL) {
    redirect(ACCOUNT_PORTAL_EXTERNAL_URL);
  }

  return (
    <section className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto max-w-lg px-5">
        <div
          className="rounded-3xl border-2 p-8 md:p-10"
          style={{
            borderColor: "var(--accent)",
            background: `linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, var(--bg)) 0%, var(--card-bg) 100%)`,
          }}
        >
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            <UserRound className="h-8 w-8" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-center font-heading text-2xl font-bold tracking-tight md:text-3xl">Личный кабинет</h1>
          <p className="mt-4 text-center text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Раздел для клиентов {SITE_NAME} скоро будет доступен здесь: ход строительства, документы и сообщения. Пока задайте
            вопрос по телефону, в мессенджере или оставьте заявку — менеджер ответит и подключит вас к проекту.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contacts"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] transition hover:opacity-95"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              Контакты
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-sm font-semibold transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              На главную
            </Link>
          </div>
          <p className="mt-8 text-center text-xs leading-relaxed" style={{ color: "var(--text-subtle)" }}>
            Для перенаправления на внешний кабинет задайте переменную окружения{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">NEXT_PUBLIC_ACCOUNT_PORTAL_URL</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
