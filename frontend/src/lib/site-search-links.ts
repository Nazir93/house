import { NAV_SECTIONS, isNavGroup } from "@/lib/nav-sections";

export type SiteSearchLink = {
  section: string;
  label: string;
  href: string;
};

/** Плоский список ссылок для поиска по сайту (без пунктов только с модалкой). */
export function getSiteSearchLinks(): SiteSearchLink[] {
  const fromNav: SiteSearchLink[] = [];

  for (const sec of NAV_SECTIONS) {
    for (const item of sec.items) {
      if (isNavGroup(item)) {
        for (const ch of item.children) {
          if ("href" in ch) {
            fromNav.push({
              section: `${sec.label} · ${item.label}`,
              label: ch.label,
              href: ch.href,
            });
          }
        }
      } else if ("href" in item) {
        fromNav.push({ section: sec.label, label: item.label, href: item.href });
      }
    }
  }

  const extra: SiteSearchLink[] = [
    { section: "Разделы", label: "Главная", href: "/" },
    { section: "Разделы", label: "Блог", href: "/blog" },
    { section: "Финансы", label: "Ипотека на дом", href: "/mortgage" },
    { section: "Партнёрам", label: "Поставщикам", href: "/partners/supplier" },
    { section: "Партнёрам", label: "Партнёрская программа", href: "/partners/partner" },
    { section: "Технологии", label: "Материалы стен", href: "/technology/materials" },
    { section: "Технологии", label: "Площадь дома", href: "/technology/house-area" },
    { section: "Документы", label: "Политика конфиденциальности", href: "/privacy" },
    { section: "Документы", label: "Согласие на обработку ПДн", href: "/consent" },
  ];

  const seenHref = new Set<string>();
  const merged: SiteSearchLink[] = [];
  for (const row of [...extra, ...fromNav]) {
    if (seenHref.has(row.href)) continue;
    seenHref.add(row.href);
    merged.push(row);
  }
  return merged;
}

/** Группировка по полю section для сетки в панели поиска. */
export function groupSearchLinksBySection(links: SiteSearchLink[]): Map<string, SiteSearchLink[]> {
  const map = new Map<string, SiteSearchLink[]>();
  for (const link of links) {
    const list = map.get(link.section) ?? [];
    list.push(link);
    map.set(link.section, list);
  }
  return map;
}
