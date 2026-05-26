"use client";

import { useState, type ComponentProps, type CSSProperties } from "react";
import { ChevronUp, MessageCircle, Phone, Send, X } from "lucide-react";

import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { useContactConfig } from "@/lib/contact-config-context";
import { maxChatUrlFromRawPhone, telegramChatUrlFromRawPhone } from "@/lib/messenger-links";
import { useModal } from "@/lib/modal-context";
import { cn } from "@/lib/utils";

const FAB_RIGHT =
  "right-[max(1rem,env(safe-area-inset-right))] lg:right-[max(1.5rem,env(safe-area-inset-right))]";
const FAB_BOTTOM =
  "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-10";

const fabBtnClass =
  "flex h-12 w-12 touch-manipulation items-center justify-center rounded-full text-white shadow-[0_4px_20px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-[1.06] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80";

function FabCircle({
  className,
  children,
  style,
  ...props
}: ComponentProps<"button"> & { style?: CSSProperties }) {
  return (
    <button
      type="button"
      className={cn(fabBtnClass, className)}
      style={{
        backgroundColor: "var(--accent)",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function FabLink({
  href,
  className,
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      href={href}
      className={cn(fabBtnClass, className)}
      style={{ backgroundColor: "var(--accent)" }}
      {...props}
    >
      {children}
    </a>
  );
}

function scrollToTop() {
  const lenis = typeof window !== "undefined" ? window.__lenis : undefined;
  if (lenis) {
    lenis.scrollTo(0);
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Плавающая колонка: чат (Max), Telegram, телефон, свернуть, наверх.
 * Свернуто — иконка чата; в меню сверху Max, ниже Telegram, телефон, закрыть, наверх.
 */
export function DiscussProjectFab() {
  const { isOpen } = useModal();
  const contact = useContactConfig();
  const [contactOpen, setContactOpen] = useState(false);

  const telegramHref =
    telegramChatUrlFromRawPhone(contact.phone2Raw) ?? contact.social.telegram?.trim() ?? null;
  const maxHref =
    contact.social.max?.trim() || maxChatUrlFromRawPhone(contact.phone2Raw) || null;
  const phoneHref =
    contact.phone.trim() && contact.phoneRaw.trim() ? `tel:${contact.phoneRaw}` : null;

  if (isOpen) return null;

  return (
    <div
      className={cn("fixed z-[115] flex flex-col items-center gap-2.5", FAB_RIGHT, FAB_BOTTOM)}
      aria-label="Быстрые действия"
    >
      {contactOpen ? (
        <>
          {maxHref ? (
            <FabLink
              href={maxHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в Max"
            >
              <MaxMessengerIcon className="h-5 w-5 opacity-95" aria-hidden />
            </FabLink>
          ) : null}

          {telegramHref ? (
            <FabLink
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в Telegram"
            >
              <Send className="h-5 w-5" strokeWidth={2} aria-hidden />
            </FabLink>
          ) : null}

          {phoneHref ? (
            <FabLink href={phoneHref} aria-label={`Позвонить: ${contact.phone}`}>
              <Phone className="h-5 w-5" strokeWidth={2} aria-hidden />
            </FabLink>
          ) : null}

          <FabCircle onClick={() => setContactOpen(false)} aria-label="Скрыть контакты">
            <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </FabCircle>
        </>
      ) : (
        <FabCircle onClick={() => setContactOpen(true)} aria-label="Показать контакты">
          <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
        </FabCircle>
      )}

      <FabCircle onClick={scrollToTop} aria-label="Прокрутить наверх">
        <ChevronUp className="h-5 w-5" strokeWidth={2.25} aria-hidden />
      </FabCircle>
    </div>
  );
}
