"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { FooterBlueprintBackdrop } from "@/components/layout/footer-blueprint-backdrop";
import { SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { VkIcon } from "@/components/icons/vk-icon";

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
      { href: "/team", label: "Команда" },
      { href: "/partners/vacancies", label: "Вакансии" },
      { href: "/reviews", label: "Отзывы" },
      { href: "/blog", label: "Новости" },
    ],
  },
  {
    title: "Технологии",
    links: [
      { href: "/services/proektirovanie", label: "Проектирование" },
      { href: "/services/fundament", label: "Фундамент" },
      { href: "/services/karkas", label: "Коробка дома" },
      { href: "/services/krovlya", label: "Кровля" },
      { href: "/services/inzheneriya", label: "Инженерия" },
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

  return (
    <footer className="relative overflow-hidden text-white" style={{ backgroundColor: "var(--footer-bar-bg)" }}>
      <FooterBlueprintBackdrop />
      {/* Плотнее «вуаль» над чертежами — текст не смешивается с линиями */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.38)_42%,rgba(0,0,0,0.5)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,rgba(15,61,46,0.35),transparent_62%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 pb-6 pt-8 safe-bottom md:px-6 md:pb-7 md:pt-9 lg:px-7">
        {/* Навигация */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-2 md:grid-cols-4 md:gap-x-7">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-white/70">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block text-[13px] leading-snug text-white/[0.92] transition duration-200 hover:text-white md:text-[13.5px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Контакты и соцсети */}
        <div className="mt-7 flex flex-col gap-5 border-t border-white/[0.08] pt-7 md:mt-8 md:flex-row md:items-center md:justify-between md:gap-7 md:pt-7">
          <div className="min-w-0 space-y-3 md:flex md:max-w-[70%] md:flex-wrap md:items-baseline md:gap-x-8 md:gap-y-2 md:space-y-0">
            <p className="font-heading text-base font-semibold tracking-tight text-white md:text-lg">{SITE_NAME}</p>
            <div className="flex flex-col gap-1.5 text-[13px] leading-snug text-white/[0.88] sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1 md:text-[14px]">
              {contact.phone.trim() && contact.phoneRaw.trim() ? (
                <a href={`tel:${contact.phoneRaw}`} className="w-fit transition hover:text-white">
                  {contact.phone}
                </a>
              ) : null}
              {contact.phone2.trim() && contact.phone2Raw.trim() ? (
                <a href={`tel:${contact.phone2Raw}`} className="w-fit transition hover:text-white">
                  {contact.phone2}
                </a>
              ) : null}
              {contact.email.trim() ? (
                <a href={`mailto:${contact.email}`} className="w-fit transition hover:text-white">
                  {contact.email}
                </a>
              ) : null}
              {contact.address.trim() ? <span className="text-white/72 sm:w-full sm:basis-full">{contact.address}</span> : null}
              <span className="text-[12px] text-white/62 sm:w-full sm:basis-full">{contact.workingHours}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 md:justify-end">
            {contact.social.telegram ? (
              <a
                href={contact.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] ring-1 ring-white/15 transition hover:bg-black/35 hover:ring-white/25"
                aria-label="Telegram"
              >
                <Send size={17} strokeWidth={2} />
              </a>
            ) : null}
            {contact.social.vk ? (
              <a
                href={contact.social.vk}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] ring-1 ring-white/15 transition hover:bg-black/35 hover:ring-white/25"
                aria-label="ВКонтакте"
              >
                <VkIcon className="h-[17px] w-[17px]" />
              </a>
            ) : null}
            {contact.social.max ? (
              <a
                href={contact.social.max}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] ring-1 ring-white/15 transition hover:bg-black/35 hover:ring-white/25"
                aria-label="Max"
              >
                <MaxMessengerIcon className="h-[17px] w-[17px]" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>

        {/* Юридическая строка — без отдельной «пятки» */}
        <div className="mt-5 flex flex-col gap-2 border-t border-white/[0.12] pt-4 text-[10px] leading-snug text-white/58 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:pt-4 md:text-[11px]">
          <p>
            © {currentYear} {SITE_NAME}
          </p>
          <p className="max-w-xl md:text-right">
            Визуальная концепция и реализация сайта —{" "}
            <a
              href="https://www.code1618.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading font-semibold text-white/72 underline-offset-2 transition hover:text-white"
            >
              студия CODE1618
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
