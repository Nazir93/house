"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import {
  ArrowRight,
  ChevronRight,
  Hammer,
  LayoutGrid,
  PenLine,
  PhoneCall,
} from "lucide-react";

import { NAV_SECTIONS, isNavGroup, type NavSection } from "@/lib/nav-sections";
import { cn } from "@/lib/utils";

const panelShell =
  "overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_24px_80px_rgba(15,61,46,0.14)]";

const accentBg = "#0f3d2e";
const iconTile = "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#e8f3eb] text-[#0f3d2e]";

const PROJECT_THUMBS = [
  "/images/banner/banner-hero-01.png",
  "/images/banner/banner-hero-03.png",
  "/images/banner/banner-hero-05.png",
] as const;

const PORTFOLIO_THUMBS = [
  "/images/banner/banner-hero-02.png",
  "/images/banner/banner-hero-04.png",
  "/images/banner/banner-hero-06.png",
] as const;

function serviceIconFor(label: string) {
  const l = label.toLowerCase();
  if (l.includes("строительств")) return Hammer;
  if (l.includes("проект")) return PenLine;
  if (l.includes("заяв")) return PhoneCall;
  return LayoutGrid;
}

function ProjectsDropdown({
  section,
  onClose,
}: {
  section: NavSection;
  onClose: () => void;
}) {
  const thumbLinks = section.items.filter((item) => {
    if (isNavGroup(item)) return false;
    if ("action" in item && item.action === "openModal") return false;
    return "href" in item;
  });

  return (
    <div className={cn(panelShell, "min-w-[300px] max-w-[340px] p-3")}>
      <Link
        href="/projects"
        onClick={onClose}
        className="mb-3 flex items-center justify-between gap-3 rounded-full bg-[#e8f0ea] px-4 py-3 transition hover:bg-[#dce8df]"
      >
        <span className="text-[13px] font-semibold text-[#1a1e1d]">Смотреть все проекты</span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: accentBg }}
          aria-hidden
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </Link>
      <ul className="flex flex-col gap-0.5">
        {thumbLinks.map((item, thumbIdx) => {
          if (!("href" in item)) return null;
          const thumb = PROJECT_THUMBS[thumbIdx % PROJECT_THUMBS.length] ?? PROJECT_THUMBS[0];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-black/[0.04]"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f0f2f0]">
                  <Image src={thumb} alt="" fill className="object-cover" sizes="48px" />
                </span>
                <span className="text-[13px] font-medium leading-snug text-[#1a1e1d]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PortfolioDropdown({
  section,
  onClose,
}: {
  section: NavSection;
  onClose: () => void;
}) {
  const thumbLinks = section.items.filter((item) => {
    if (isNavGroup(item)) return false;
    if ("action" in item && item.action === "openModal") return false;
    return "href" in item;
  });

  return (
    <div className={cn(panelShell, "min-w-[300px] max-w-[340px] p-3")}>
      <Link
        href="/portfolio"
        onClick={onClose}
        className="mb-3 flex items-center justify-between gap-3 rounded-full bg-[#e8f0ea] px-4 py-3 transition hover:bg-[#dce8df]"
      >
        <span className="text-[13px] font-semibold text-[#1a1e1d]">Все объекты портфолио</span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: accentBg }}
          aria-hidden
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </Link>
      <ul className="flex flex-col gap-0.5">
        {thumbLinks.map((item, thumbIdx) => {
          if (!("href" in item)) return null;
          const thumb = PORTFOLIO_THUMBS[thumbIdx % PORTFOLIO_THUMBS.length] ?? PORTFOLIO_THUMBS[0];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-black/[0.04]"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f0f2f0]">
                  <Image src={thumb} alt="" fill className="object-cover" sizes="48px" />
                </span>
                <span className="text-[13px] font-medium leading-snug text-[#1a1e1d]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ServicesDropdown({
  section,
  onClose,
  openModal,
}: {
  section: NavSection;
  onClose: () => void;
  openModal: () => void;
}) {
  return (
    <div className={cn(panelShell, "min-w-[300px] max-w-[min(96vw,400px)] p-3")}>
      <Link
        href="/services"
        onClick={onClose}
        className="mb-2 flex items-center justify-between gap-3 rounded-full bg-[#e8f0ea] px-4 py-3 transition hover:bg-[#dce8df]"
      >
        <span className="text-[13px] font-semibold text-[#1a1e1d]">Все услуги</span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: accentBg }}
          aria-hidden
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </Link>
      <ul className="flex flex-col gap-1">
        {section.items.map((item) =>
          isNavGroup(item) ? (
            <li key={item.label} className="rounded-xl py-0.5">
              <div className="flex items-center gap-3 px-2 py-2">
                <span className={iconTile}>
                  <Hammer className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="flex-1 text-[13px] font-semibold text-[#1a1e1d]">{item.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#0f3d2e]/40" strokeWidth={2} aria-hidden />
              </div>
              <ul className="flex flex-col gap-0.5 pb-1 pl-1 sm:pl-[3.25rem]">
                {item.children.map((child) =>
                  "action" in child && child.action === "openModal" ? (
                    <li key={child.label}>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openModal();
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#1a1e1d] transition hover:bg-black/[0.04]"
                      >
                        {child.label}
                      </button>
                    </li>
                  ) : "href" in child ? (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onClose}
                        className="block rounded-xl px-3 py-2 text-[13px] font-medium text-[#1a1e1d] transition hover:bg-black/[0.04]"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </li>
          ) : "action" in item && item.action === "openModal" ? (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openModal();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-black/[0.04]"
                >
                  <span className={iconTile}>
                    <PhoneCall className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-[13px] font-medium text-[#1a1e1d]">{item.label}</span>
                </button>
              </li>
            ) : "href" in item ? (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-black/[0.04]"
                >
                  <span className={iconTile}>
                    {(() => {
                      const Icon = serviceIconFor(item.label);
                      return <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />;
                    })()}
                  </span>
                  <span className="text-[13px] font-medium text-[#1a1e1d]">{item.label}</span>
                </Link>
              </li>
            ) : null,
          )}
      </ul>
    </div>
  );
}

function DefaultDropdown({
  section,
  onClose,
  openModal,
}: {
  section: NavSection;
  onClose: () => void;
  openModal: () => void;
}) {
  return (
    <div className={cn(panelShell, "min-w-[260px] max-w-[300px] p-2")}>
      <ul className="flex flex-col gap-0.5">
        {section.items.map((item) =>
          isNavGroup(item) ? (
            <li key={item.label} className="px-1 py-1">
              <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5c6562]">
                {item.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {item.children.map((child) =>
                  "action" in child && child.action === "openModal" ? (
                    <li key={child.label}>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openModal();
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#1a1e1d] transition hover:bg-black/[0.04]"
                      >
                        {child.label}
                      </button>
                    </li>
                  ) : "href" in child ? (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onClose}
                        className="block rounded-xl px-3 py-2 text-[13px] font-medium text-[#1a1e1d] transition hover:bg-black/[0.04]"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </li>
          ) : "action" in item && item.action === "openModal" ? (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openModal();
                }}
                className="w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-[#1a1e1d] transition hover:bg-black/[0.04]"
              >
                {item.label}
              </button>
            </li>
          ) : "href" in item ? (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="block rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#1a1e1d] transition hover:bg-black/[0.04]"
              >
                {item.label}
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}

export function NavDropdownPanel({
  sectionLabel,
  open,
  onClose,
  openModal,
}: {
  sectionLabel: string;
  open: boolean;
  onClose: () => void;
  openModal: () => void;
}) {
  const section = NAV_SECTIONS.find((s) => s.label === sectionLabel);

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open || !section) return null;

  let body: ReactNode;
  if (section.label === "Проекты") {
    body = <ProjectsDropdown section={section} onClose={onClose} />;
  } else if (section.label === "Портфолио") {
    body = <PortfolioDropdown section={section} onClose={onClose} />;
  } else if (section.label === "Услуги") {
    body = <ServicesDropdown section={section} onClose={onClose} openModal={openModal} />;
  } else {
    body = <DefaultDropdown section={section} onClose={onClose} openModal={openModal} />;
  }

  return (
    <div className="absolute left-0 top-full z-50 pt-2 lg:left-1/2 lg:-translate-x-1/2">
      <div className="relative overflow-visible">{body}</div>
    </div>
  );
}
