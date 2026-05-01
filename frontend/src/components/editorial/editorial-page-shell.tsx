import type { ReactNode } from "react";
import { BackNavLink } from "@/components/ui/back-nav";

type EditorialPageShellProps = {
  backHref: string;
  backLabel: string;
  meta?: ReactNode;
  title: string;
  /** Заменяет классы H1 (по умолчанию крупный кейс/лендинг) */
  titleClassName?: string;
  /** Renders between H1 and lead (e.g. case meta grid) */
  belowTitle?: ReactNode;
  lead?: ReactNode;
  /** Full-width block above the text column (legacy; prefer mediaAfterTitle) */
  fullWidthTop?: ReactNode;
  /** Между заголовком (и belowTitle) и лидом: баннер как на лендинге услуги */
  mediaAfterTitle?: ReactNode;
  /** Content after title/lead (e.g. banner) — still inside max-width column */
  children?: ReactNode;
  /** Full-width blocks below the editorial column (e.g. portfolio extras) */
  after?: ReactNode;
  footer?: ReactNode;
};

/**
 * Shared article layout for blog posts and portfolio cases: padding, max width, typography scale.
 */
/** Спокойная шкала как у редакционных статей — без «билборд»-размеров */
const DEFAULT_TITLE_CLASS =
  "font-heading text-2xl sm:text-[1.65rem] md:text-[1.85rem] lg:text-[2rem] leading-[1.18] tracking-tight mb-6 md:mb-7 max-w-[min(100%,42rem)]";

export function EditorialPageShell({
  backHref,
  backLabel,
  meta,
  title,
  titleClassName,
  belowTitle,
  lead,
  fullWidthTop,
  mediaAfterTitle,
  children,
  after,
  footer,
}: EditorialPageShellProps) {
  const headingClass = titleClassName ?? DEFAULT_TITLE_CLASS;
  return (
    <article className="pt-12 pb-16 md:pt-16 md:pb-24" style={{ backgroundColor: "var(--bg)" }}>
      {fullWidthTop ? (
        <div className="mb-8 w-full md:mb-10">{fullWidthTop}</div>
      ) : null}
      <div className="container mx-auto max-w-3xl px-5">
        <div className="mb-6">
          <BackNavLink href={backHref}>{backLabel}</BackNavLink>
        </div>

        {meta ? <div className="mb-6">{meta}</div> : null}

        <h1 className={headingClass} style={{ color: "var(--text)" }}>
          {title}
        </h1>

        {belowTitle ? <div className="mb-8">{belowTitle}</div> : null}

        {mediaAfterTitle ? <div className="mb-8 sm:mb-10">{mediaAfterTitle}</div> : null}

        {lead ? (
          <div className="text-base md:text-lg leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
            {lead}
          </div>
        ) : null}

        {children}

        {footer ? (
          <div className="mt-16 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            {footer}
          </div>
        ) : null}
      </div>

      {after}
    </article>
  );
}
