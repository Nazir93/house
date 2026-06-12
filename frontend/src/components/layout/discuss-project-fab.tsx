"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ChevronUp, MessageCircle, Phone, Send, X } from "lucide-react";

import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { useContactConfig } from "@/lib/contact-config-context";
import { MESSENGER_CHAT_PHONE_RAW } from "@/lib/constants";
import { maxMessengerChatUrl, telegramChatUrlFromRawPhone } from "@/lib/messenger-links";
import { useModal } from "@/lib/modal-context";
import { cn } from "@/lib/utils";

const FAB_RIGHT =
  "right-[max(1rem,env(safe-area-inset-right))] lg:right-[max(1.5rem,env(safe-area-inset-right))]";
const FAB_BOTTOM = "bottom-[var(--mobile-bottom-nav-offset)] lg:bottom-10";
const fabItemClass =
  "contact-fab-item relative z-10 flex min-w-0 items-center justify-center rounded-[1.65rem] py-2 transition-[color,transform,padding] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] touch-manipulation active:scale-95";

function FabIconWrap({
  children,
  active,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "contact-fab-icon-wrap relative flex h-8 w-8 items-center justify-center transition-[transform,width,height] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        active && "contact-fab-icon-wrap--active",
        className
      )}
    >
      {children}
    </span>
  );
}

function FabButton({
  className,
  children,
  active,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button type="button" className={cn(fabItemClass, className)} {...props}>
      <FabIconWrap active={active}>{children}</FabIconWrap>
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
    <a href={href} className={cn(fabItemClass, className)} {...props}>
      <FabIconWrap>{children}</FabIconWrap>
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
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollYRef = useRef(0);

  const telegramHref = telegramChatUrlFromRawPhone(MESSENGER_CHAT_PHONE_RAW);
  const maxHref = maxMessengerChatUrl(contact.social.maxChat);
  const phoneHref = `tel:${MESSENGER_CHAT_PHONE_RAW}`;

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 16) {
        setIsCompact(false);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (Math.abs(delta) < 4) {
        return;
      }

      setIsCompact(delta > 0);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!contactOpen) return;
    setIsCompact(false);
  }, [contactOpen]);

  if (isOpen) return null;

  return (
    <div
      className={cn("contact-fab-shell fixed z-[115]", FAB_RIGHT, FAB_BOTTOM)}
      aria-label="Быстрые действия"
    >
      <div
        className={cn(
          "contact-fab-bar pointer-events-auto relative flex flex-col items-center overflow-hidden px-1 py-1",
          contactOpen && "contact-fab-bar--expanded",
          isCompact && !contactOpen && "contact-fab-bar--compact"
        )}
      >
        <div className="contact-fab-expanded">
          <div className="contact-fab-expanded__inner">
            {maxHref ? (
              <FabLink
                href={maxHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в Max"
              >
                <MaxMessengerIcon className="h-[22px] w-[22px] shrink-0 text-[var(--text)]" />
              </FabLink>
            ) : null}

            {telegramHref ? (
              <FabLink
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в Telegram"
              >
                <Send
                  size={22}
                  strokeWidth={2.3}
                  className="shrink-0"
                  style={{ color: "var(--text)" }}
                  aria-hidden
                />
              </FabLink>
            ) : null}

            {phoneHref ? (
              <FabLink href={phoneHref} aria-label={`Позвонить: ${MESSENGER_CHAT_PHONE_RAW}`}>
                <Phone
                  size={22}
                  strokeWidth={2.3}
                  className="shrink-0"
                  style={{ color: "var(--text)" }}
                  aria-hidden
                />
              </FabLink>
            ) : null}

            <FabButton
              onClick={() => setContactOpen(false)}
              aria-label="Скрыть контакты"
              active
            >
              <X
                size={22}
                strokeWidth={2.55}
                className="shrink-0"
                style={{ color: "var(--accent)" }}
                aria-hidden
              />
            </FabButton>
          </div>
        </div>

        <div className="contact-fab-chat">
          <FabButton onClick={() => setContactOpen(true)} aria-label="Показать контакты" active>
            <MessageCircle
              size={22}
              strokeWidth={2.55}
              className="shrink-0"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </FabButton>
        </div>

        <FabButton onClick={scrollToTop} aria-label="Прокрутить наверх">
          <ChevronUp
            size={22}
            strokeWidth={2.3}
            className="shrink-0"
            style={{ color: "var(--text)" }}
            aria-hidden
          />
        </FabButton>
      </div>
    </div>
  );
}
