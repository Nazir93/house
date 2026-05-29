/** Публичные метаданные вакансии для карточек на сайте. */
export type PublicVacancyMeta = {
  location?: string | null;
  schedule?: string | null;
  salaryLabel?: string | null;
};

/** Чипы «локация / график / зарплата» — только непустые поля. */
export function getVacancyMetaChips(meta: PublicVacancyMeta): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  const location = meta.location?.trim();
  const schedule = meta.schedule?.trim();
  const salary = meta.salaryLabel?.trim();
  if (location) chips.push({ key: "location", label: location });
  if (schedule) chips.push({ key: "schedule", label: schedule });
  if (salary) chips.push({ key: "salary", label: salary });
  return chips;
}

/** Ссылка на контакты с подсказкой позиции для отклика. */
export function buildVacancyResponseHref(title: string): string {
  const params = new URLSearchParams();
  const position = title.trim();
  if (position) params.set("position", position);
  params.set("topic", "vacancy");
  const q = params.toString();
  return q ? `/contacts?${q}` : "/contacts";
}

/** Нормализация полей при сохранении из админки. */
export function normalizeVacancyInput(input: {
  title?: string;
  location?: string;
  schedule?: string;
  salaryLabel?: string;
  description?: string;
  requirements?: string;
  visible?: boolean;
  order?: number;
}) {
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  return {
    title,
    description,
    location: input.location?.trim() || null,
    schedule: input.schedule?.trim() || null,
    salaryLabel: input.salaryLabel?.trim() || null,
    requirements: input.requirements?.trim() || null,
    visible: input.visible ?? true,
    order: typeof input.order === "number" && Number.isFinite(input.order) ? input.order : 0,
  };
}

export function isVacancyInputValid(input: ReturnType<typeof normalizeVacancyInput>): boolean {
  return input.title.length >= 2 && input.description.length >= 10;
}
