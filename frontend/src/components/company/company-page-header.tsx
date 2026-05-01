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
    <header className="border-b pb-10 pt-28" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto max-w-[1200px] px-5">
        <nav className="text-[12px] tracking-[0.02em] sm:text-[13px]" style={{ color: "var(--text-muted)" }} aria-label="Навигация по разделу">
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
        <h1 className="mt-8 font-heading text-[1.85rem] font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.5rem]" style={{ color: "var(--text)" }}>
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
