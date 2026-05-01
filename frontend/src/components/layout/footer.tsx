"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";

const FOOTER_COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Документация",
    links: [
      { href: "/privacy", label: "Политика конфиденциальности" },
      { href: "/consent", label: "Согласие на обработку данных" },
      { href: "/contacts", label: "Реквизиты и контакты" },
    ],
  },
  {
    title: "О компании",
    links: [
      { href: "/about", label: "О компании" },
      { href: "/partners/vacancies", label: "Вакансии" },
      { href: "/reviews", label: "Отзывы" },
      { href: "/blog", label: "Новости" },
    ],
  },
  {
    title: "Технологии",
    links: [
      { href: "/services/foundation", label: "Фундамент" },
      { href: "/services/roofing", label: "Кровля" },
      { href: "/services/projecting", label: "Проектирование" },
      { href: "/services/engineering", label: "Инженерия" },
    ],
  },
  {
    title: "Проекты",
    links: [
      { href: "/projects", label: "Каталог типовых домов" },
      { href: "/individual-design", label: "Индивидуальный проект" },
      { href: "/portfolio", label: "Наши проекты" },
      { href: "/mortgage", label: "Ипотека на дом" },
    ],
  },
];

export function Footer() {
  const contact = useContactConfig();
  const currentYear = new Date().getFullYear();
  const [newsEmail, setNewsEmail] = useState("");
  const [newsConsent, setNewsConsent] = useState(false);
  const [newsStatus, setNewsStatus] = useState<"idle" | "done">("idle");

  function newsletterSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newsConsent || !newsEmail.trim().includes("@")) return;
    setNewsStatus("done");
    setNewsEmail("");
    setNewsConsent(false);
  }

  return (
    <footer className="relative text-white" style={{ backgroundColor: "var(--footer-bar-bg)" }}>
      <div className="container mx-auto max-w-[1200px] px-5 pb-10 pt-12 md:pb-14 md:pt-16 lg:px-6">
        {/* Рассылка */}
        <div className="flex flex-col gap-8 border-b border-white/[0.12] pb-12 md:flex-row md:items-start md:justify-between md:gap-12 md:pb-14">
          <p className="max-w-md text-[14px] leading-relaxed text-white/[0.82] md:text-[15px]">
            Раз в неделю — полезные письма о строительстве: этапы работ, обзор проектов и акции.
          </p>
          <div className="w-full max-w-xl md:min-w-[320px]">
            {newsStatus === "done" ? (
              <p className="text-sm font-medium text-white/90">Спасибо! Проверьте почту для подтверждения.</p>
            ) : (
              <form onSubmit={newsletterSubmit} className="space-y-3">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Введите email"
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    className="w-full rounded-full border border-white/10 bg-white py-3 pl-5 pr-[3.25rem] text-[14px] text-[var(--text)] outline-none ring-offset-2 ring-offset-[var(--accent)] placeholder:text-neutral-400 focus:ring-2 focus:ring-white/35"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--accent)] shadow-sm transition hover:bg-white/95"
                    aria-label="Подписаться"
                  >
                    <ArrowRight size={18} strokeWidth={2} />
                  </button>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-snug text-white/65">
                  <input
                    type="checkbox"
                    checked={newsConsent}
                    onChange={(e) => setNewsConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/40 bg-white/10 accent-white"
                  />
                  <span>Я согласен на обработку персональных данных</span>
                </label>
              </form>
            )}
          </div>
        </div>

        {/* Колонки */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-12 md:grid-cols-4 md:gap-8 lg:pt-14">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-white/55">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13px] leading-snug text-white/78 transition hover:text-white md:text-[14px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Низ: бренд и контакты */}
        <div className="mt-12 flex flex-col gap-10 border-t border-white/[0.12] pt-10 md:mt-14 md:flex-row md:items-start md:justify-between md:gap-8 md:pt-12">
          <div className="max-w-md space-y-4">
            <p className="font-heading text-xl font-semibold tracking-wide text-white md:text-2xl">{SITE_NAME}</p>
            <div className="space-y-1 text-[13px] leading-relaxed text-white/78 md:text-[14px]">
              {contact.phone.trim() && contact.phoneRaw.trim() ? (
                <p>
                  <a href={`tel:${contact.phoneRaw}`} className="transition hover:text-white">
                    {contact.phone}
                  </a>
                </p>
              ) : null}
              {contact.phone2.trim() && contact.phone2Raw.trim() ? (
                <p>
                  <a href={`tel:${contact.phone2Raw}`} className="transition hover:text-white">
                    {contact.phone2}
                  </a>
                </p>
              ) : null}
              {contact.email.trim() ? (
                <p>
                  <a href={`mailto:${contact.email}`} className="transition hover:text-white">
                    {contact.email}
                  </a>
                </p>
              ) : null}
              {contact.address.trim() ? <p className="text-white/65">{contact.address}</p> : null}
              <p className="text-[12px] text-white/55">{contact.workingHours}</p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
              © {currentYear} {SITE_NAME}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {contact.social.telegram ? (
              <a
                href={contact.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/12"
                aria-label="Telegram"
              >
                <Send size={18} strokeWidth={2} />
              </a>
            ) : null}
            {contact.social.max ? (
              <a
                href={contact.social.max}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/12"
                aria-label="Max"
              >
                <MaxMessengerIcon className="h-[18px] w-[18px]" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Подпись студии */}
      <div className="border-t border-white/[0.08] bg-black/[0.12]">
        <div className="container mx-auto max-w-[1200px] px-5 py-5 safe-bottom lg:px-6">
          <p className="mx-auto max-w-3xl text-center text-[10px] leading-relaxed tracking-wide text-white/45 sm:text-[11px]">
            Визуальная концепция, интерфейс и техническая реализация этого сайта выполнены{" "}
            <a
              href="https://www.code1618.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading font-semibold text-white/65 underline-offset-2 transition hover:text-white"
            >
              студией CODE1618
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
