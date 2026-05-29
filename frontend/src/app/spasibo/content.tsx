"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Phone, Send } from "lucide-react";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { VkIcon } from "@/components/icons/vk-icon";
import { SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { isWorkingHours } from "@/lib/utils";
import { cn } from "@/lib/utils";

function countdownLabel(n: number): string {
  if (n === 1) return "секунду";
  if (n >= 2 && n <= 4) return "секунды";
  return "секунд";
}

export function ThankYouContent() {
  const contact = useContactConfig();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [countdown, setCountdown] = useState(15);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }
    setValid(true);
  }, [token, router]);

  useEffect(() => {
    if (!valid) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [valid, router]);

  if (valid === null) return null;

  if (!valid) {
    router.replace("/");
    return null;
  }

  const workingHours = isWorkingHours();
  const hasPhones =
    (contact.phone.trim() && contact.phoneRaw.trim()) ||
    (contact.phone2.trim() && contact.phone2Raw.trim());

  const socialLinks = [
    contact.social.telegram.trim()
      ? { href: contact.social.telegram, label: "Telegram", icon: "telegram" as const }
      : null,
    contact.social.vk?.trim()
      ? { href: contact.social.vk, label: "ВКонтакте", icon: "vk" as const }
      : null,
    contact.social.max?.trim()
      ? { href: contact.social.max, label: "Max", icon: "max" as const }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: "telegram" | "vk" | "max" }[];

  return (
    <section
      className="flex min-h-[calc(100dvh-var(--site-header-sticky-offset))] items-center justify-center px-4 py-10 pt-[calc(var(--site-header-sticky-offset)+1.5rem)] pb-24 lg:pb-10"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-80"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 50%)",
        }}
      />

      <div className="w-full max-w-lg">
        <div
          className={cn(
            "overflow-hidden rounded-[1.75rem] border shadow-[0_20px_56px_rgb(var(--accent-rgb)/0.1)]",
            "bg-gradient-to-br from-[var(--bg)] via-[var(--bg-secondary)]/50 to-[color-mix(in_srgb,var(--accent)_6%,var(--bg))]",
            "dark:shadow-[0_24px_64px_rgba(0,0,0,0.45)]",
          )}
          style={{ borderColor: "var(--border)" }}
        >
          <div className="px-6 pt-8 pb-6 text-center sm:px-8 sm:pt-10">
            <div
              className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                color: "var(--accent)",
              }}
            >
              <CheckCircle2 className="h-10 w-10" strokeWidth={1.75} aria-hidden />
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Заявка принята
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              Спасибо за заявку!
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]">
              Мы получили ваш запрос. Инженер {SITE_NAME} свяжется с вами{" "}
              <span className="font-semibold text-[var(--text)]">
                {workingHours ? "в течение 30 минут" : "в начале следующего рабочего дня"}
              </span>
              .
            </p>

            <p
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg))",
                color: "var(--text-muted)",
              }}
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
              {workingHours ? "Сейчас рабочее время" : "Сейчас нерабочее время — ответим утром"}
            </p>
          </div>

          {hasPhones ? (
            <div
              className="mx-5 mb-5 rounded-2xl border px-5 py-5 sm:mx-6"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "color-mix(in srgb, var(--card-bg) 55%, var(--bg))",
              }}
            >
              <p className="text-center text-sm font-medium text-[var(--text-muted)]">
                Если вопрос срочный — позвоните:
              </p>
              <div className="mt-4 flex flex-col items-center gap-3">
                {contact.phone.trim() && contact.phoneRaw.trim() ? (
                  <a
                    href={`tel:${contact.phoneRaw}`}
                    className="inline-flex items-center gap-2.5 text-xl font-bold tabular-nums text-[var(--accent)] transition hover:opacity-80"
                  >
                    <Phone className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                    {contact.phone}
                  </a>
                ) : null}
                {contact.phone2.trim() && contact.phone2Raw.trim() ? (
                  <a
                    href={`tel:${contact.phone2Raw}`}
                    className="inline-flex items-center gap-2.5 text-lg font-bold tabular-nums text-[var(--accent)] transition hover:opacity-80"
                  >
                    <Phone className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                    {contact.phone2}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="px-5 pb-5 sm:px-6">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                Или напишите в мессенджер
              </p>
              <div
                className={cn(
                  "grid gap-2",
                  socialLinks.length >= 3 ? "sm:grid-cols-3" : socialLinks.length === 2 ? "sm:grid-cols-2" : "grid-cols-1",
                )}
              >
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                      "text-[var(--text)] hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]",
                      "hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))]",
                    )}
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg)",
                    }}
                  >
                    {item.icon === "telegram" ? (
                      <Send className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    ) : null}
                    {item.icon === "vk" ? <VkIcon className="h-4 w-4 shrink-0" aria-hidden /> : null}
                    {item.icon === "max" ? (
                      <MaxMessengerIcon className="h-4 w-4 shrink-0" aria-hidden />
                    ) : null}
                    <span className="truncate">{item.label === "Telegram" ? "Telegram" : item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div
            className="border-t px-5 py-6 sm:px-8"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "color-mix(in srgb, var(--bg-secondary) 40%, var(--bg))",
            }}
          >
            <p className="text-center text-sm text-[var(--text-muted)]">
              Пока ждёте — посмотрите наши проекты
            </p>
            <Link
              href="/portfolio"
              className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-[0.08em] transition hover:opacity-[0.96]"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--accent-contrast)",
              }}
            >
              Перейти в портфолио
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </Link>
          </div>

          <div
            className="flex flex-col items-center gap-1 border-t px-5 py-4 text-center sm:flex-row sm:justify-center sm:gap-3"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "color-mix(in srgb, var(--text) 4%, var(--bg))",
            }}
          >
            <p className="text-sm text-[var(--text-muted)]">
              На главную через{" "}
              <span className="font-bold tabular-nums text-[var(--accent)]">{countdown}</span>{" "}
              {countdownLabel(countdown)}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm font-semibold text-[var(--accent)] underline-offset-4 transition hover:underline"
            >
              Вернуться сейчас
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
