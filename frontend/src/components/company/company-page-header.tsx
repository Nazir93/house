import Link from "next/link";
import { CompanySubnav } from "./company-subnav";

export function CompanyPageHeader({
  title,
  description,
  breadcrumbCurrent,
}: {
  title: string;
  description?: string;
  breadcrumbCurrent: string;
}) {
  return (
    <header
      className="page-top-offset border-b pb-8 sm:pb-10"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
    >
      <div className="container mx-auto max-w-[1200px] min-w-0 px-4 sm:px-5 lg:px-6">
        <nav
          className="text-[11px] tracking-[0.02em] sm:text-[12px] md:text-[13px]"
          style={{ color: "var(--text-muted)" }}
          aria-label="Навигация по разделу"
        >
          <Link href="/" className="transition-colors hover:text-[var(--accent)]">
            Главная
          </Link>
          <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
            {" › "}
          </span>
          <span className="text-[var(--text-muted)]">О компании</span>
          <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
            {" › "}
          </span>
          <span style={{ color: "var(--text)" }}>{breadcrumbCurrent}</span>
        </nav>
        <CompanySubnav />
        <h1
          className="mt-6 break-words font-heading text-[1.5rem] font-bold leading-tight tracking-tight sm:mt-8 sm:text-[1.85rem] md:text-4xl lg:text-[2.5rem]"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h1>
        {description ? (
          <p
            className="mt-3 max-w-3xl text-sm leading-relaxed sm:mt-4 sm:text-[15px] md:text-base"
            style={{ color: "var(--text-muted)" }}
          >
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
