/**
 * При сохранении услуги подставляет «Название» в первый блок hero лендинга,
 * чтобы карточка и заголовок на странице совпадали с полем в админке (если не перекрыто SEO H1).
 */
export function mergeServiceTitleIntoLandingJson(landingJson: unknown, title: string): unknown {
  if (landingJson === null || landingJson === undefined) return landingJson;
  if (typeof landingJson !== "object" || Array.isArray(landingJson)) return landingJson;
  const o = landingJson as { sections?: unknown[] };
  if (!Array.isArray(o.sections)) return landingJson;
  let applied = false;
  const sections = o.sections.map((s) => {
    if (applied) return s;
    if (
      s &&
      typeof s === "object" &&
      !Array.isArray(s) &&
      (s as { type?: string }).type === "hero"
    ) {
      applied = true;
      return { ...(s as Record<string, unknown>), title };
    }
    return s;
  });
  return { ...o, sections };
}
