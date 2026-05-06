"use client";

import { useState } from "react";
import { Section, SectionTitle } from "@/components/ui/section";
import type { LucideIcon } from "lucide-react";
import {
  Phone, Mail, MapPin, Clock, Send,
  Building2, CreditCard, ChevronDown,
} from "lucide-react";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { VkIcon } from "@/components/icons/vk-icon";
import { getYandexOfficeMapEmbedUrl } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";

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
            className="relative w-full rounded-2xl overflow-hidden border aspect-[16/10] max-h-[400px] sm:aspect-[21/9] sm:max-h-[360px]"
            style={{ borderColor: "var(--border)" }}
          >
            <iframe
              title={`Карта: ${contact.address}`}
              src={mapIframeSrc}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Messengers */}
        <div className="flex gap-3 flex-wrap">
          {[
            { href: contact.social.telegram, label: "Telegram" as const, icon: <Send size={14} /> },
            { href: contact.social.vk, label: "ВКонтакте" as const, icon: <VkIcon className="h-3.5 w-3.5" /> },
            { href: contact.social.max, label: "Max" as const, icon: <MaxMessengerIcon className="h-3.5 w-3.5" /> },
          ]
            .filter((x) => x.href)
            .map(({ href, label, icon }) => (
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
