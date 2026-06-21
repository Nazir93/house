"use client";

import { useState, type ReactNode } from "react";
import { Section, SectionTitle } from "@/components/ui/section";
import type { LucideIcon } from "lucide-react";
import {
  Phone, Mail, MapPin, Clock, Send, TrainFront,
  Building2, CreditCard, ChevronDown, ExternalLink, Route,
} from "lucide-react";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { VkIcon } from "@/components/icons/vk-icon";
import {
  getYandexOfficeMapEmbedUrl,
  getYandexOfficeMapLinkUrl,
  getYandexOfficePedestrianRouteUrl,
  formatOfficeMetroWalkingLabel,
  OFFICE_METRO_DIRECTIONS,
} from "@/lib/office-map";
import { useContactConfig } from "@/lib/contact-config-context";
import { maxMessengerChatUrl } from "@/lib/messenger-links";

function RequisitesBlock() {
  const [open, setOpen] = useState(false);
  const contact = useContactConfig();
  const c = contact.company;
  const rows = [
    { label: "Полное наименование", value: c.fullName },
    { label: "Сокращённое", value: c.shortName },
    { label: "ИНН", value: c.inn },
    { label: "ОГРНИП", value: c.ogrnip },
    { label: "Юридический адрес", value: c.postalAddress },
    { label: "Банк", value: c.bank.name },
    { label: "Расчётный счёт", value: c.bank.account },
    { label: "Корр. счёт", value: c.bank.corrAccount },
    { label: "БИК", value: c.bank.bic },
  ].filter((r) => r.value.trim());

  if (rows.length === 0) return null;

  return (
    <div
      className="mt-8 rounded-2xl overflow-hidden transition-colors"
      style={{ border: "1px solid var(--border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left group"
      >
        <div className="flex items-center gap-3">
          <CreditCard size={18} style={{ color: "var(--accent)" }} />
          <span className="font-heading text-sm sm:text-base" style={{ color: "var(--text)" }}>
            Реквизиты компании
          </span>
        </div>
        <ChevronDown
          size={16}
          className="transition-transform duration-300"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? "600px" : "0", opacity: open ? 1 : 0 }}
      >
        <div
          className="px-5 sm:px-6 pb-5 sm:pb-6 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4">
            {rows.map(({ label, value }) => (
              <div key={label} className="py-1">
                <p
                  className="text-[10px] uppercase tracking-[0.15em] mb-1"
                  style={{ color: "var(--text-subtle)" }}
                >
                  {label}
                </p>
                <p
                  className="text-xs sm:text-sm font-mono tabular-nums break-all"
                  style={{ color: "var(--text-muted)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactsSection({ embedded }: { embedded?: boolean }) {
  const contact = useContactConfig();
  /** Метка на карте — координаты офиса в constants (см. ADDRESS / OFFICE_GEO_*) */
  const mapIframeSrc = getYandexOfficeMapEmbedUrl();

  const phoneText = [contact.phone, contact.phone2].filter((s) => s.trim()).join(" / ");
  const phoneHref = contact.phoneRaw.trim()
    ? `tel:${contact.phoneRaw}`
    : contact.phone2Raw.trim()
      ? `tel:${contact.phone2Raw}`
      : undefined;
  const maxHref = maxMessengerChatUrl(contact.social.maxChat);

  const contactRows: {
    icon: LucideIcon;
    label: string;
    value: string;
    href?: string;
  }[] = [
    {
      icon: Phone,
      label: "Телефон",
      value: phoneText || "Укажите в админке → Настройки",
      ...(phoneHref ? { href: phoneHref } : {}),
    },
    {
      icon: Mail,
      label: "Email",
      value: contact.email.trim() || "Укажите в админке → Настройки",
      ...(contact.email.trim() ? { href: `mailto:${contact.email.trim()}` } : {}),
    },
    {
      icon: MapPin,
      label: "Адрес",
      value: contact.address.trim() || "Укажите в админке → Настройки",
    },
    { icon: Clock, label: "Режим работы", value: contact.workingHours },
  ];

  return (
    <Section id="contacts" dark className={embedded ? "!pt-4 pb-16 md:!pt-6 md:pb-20" : "!pt-8 md:!pt-12"}>
      {embedded ? (
        <p className="mb-8 max-w-3xl text-[15px] leading-relaxed md:mb-10" style={{ color: "var(--text-muted)" }}>
          Свяжитесь с нами любым удобным способом — перезвоним и подскажем по проекту и срокам.
        </p>
      ) : (
        <SectionTitle subtitle="Свяжитесь с нами любым удобным способом" className="!mb-8 md:!mb-12">
          Контакты
        </SectionTitle>
      )}

      <div className="max-w-3xl w-full">
        {/* Company badge */}
        {contact.company.shortName.trim() ? (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              backgroundColor: "rgba(15,61,46,0.08)",
              border: "1px solid rgba(15,61,46,0.2)",
            }}
          >
            <Building2 size={14} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-heading" style={{ color: "var(--accent)" }}>
              {contact.company.shortName}
            </span>
          </div>
        ) : null}

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {contactRows.map(({ icon: Icon, label, value, href }) => {
            const Wrapper = href ? "a" : "div";
            return (
              <Wrapper
                key={label}
                {...(href ? { href } : {})}
                className="flex items-start gap-4 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: "rgba(15,61,46,0.08)",
                    border: "1px solid rgba(15,61,46,0.15)",
                  }}
                >
                  <Icon size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] mb-1"
                    style={{ color: "var(--text-subtle)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-sm sm:text-base transition-colors group-hover:text-[var(--accent)]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {value}
                  </p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* Карта офиса */}
        <div className="mb-8">
          <p
            className="text-[10px] uppercase tracking-[0.2em] mb-3"
            style={{ color: "var(--text-subtle)" }}
          >
            Как добраться
          </p>

          <div
            className="mb-4 rounded-2xl border p-4 sm:p-5"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: "rgba(15,61,46,0.08)",
                  border: "1px solid rgba(15,61,46,0.15)",
                }}
              >
                <TrainFront size={16} style={{ color: "var(--accent)" }} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  От метро пешком
                </p>
                <ul className="mt-3 space-y-3">
                  {OFFICE_METRO_DIRECTIONS.map((metro) => (
                    <li key={metro.name} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          {formatOfficeMetroWalkingLabel(metro)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                          {metro.line}
                        </p>
                      </div>
                      <a
                        href={getYandexOfficePedestrianRouteUrl(metro)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        <Route size={14} aria-hidden />
                        Маршрут
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-2xl border min-h-[280px] h-[min(404px,62vw)] sm:h-[404px]"
            style={{ borderColor: "var(--border)" }}
          >
            <iframe
              title={`Карта: ${contact.address}`}
              src={mapIframeSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              allow="geolocation"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={getYandexOfficeMapLinkUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <ExternalLink size={14} aria-hidden />
              Открыть в Яндекс.Картах
            </a>
          </div>
        </div>

        {/* Messengers */}
        <div className="flex gap-3 flex-wrap">
          {(
            [
              contact.social.telegram.trim()
                ? { href: contact.social.telegram, label: "Telegram" as const, icon: <Send size={14} /> }
                : null,
              contact.social.vk?.trim()
                ? { href: contact.social.vk, label: "ВКонтакте" as const, icon: <VkIcon className="h-3.5 w-3.5" /> }
                : null,
              maxHref
                ? { href: maxHref, label: "Max" as const, icon: <MaxMessengerIcon className="h-3.5 w-3.5" /> }
                : null,
            ].filter(Boolean) as {
              href: string;
              label: "Telegram" | "ВКонтакте" | "Max";
              icon: ReactNode;
            }[]
          ).map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.02]"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent)";
                e.currentTarget.style.color = "#000";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {icon}{label}
            </a>
          ))}
        </div>

        {/* Requisites accordion */}
        <RequisitesBlock />
      </div>
    </Section>
  );
}
