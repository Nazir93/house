/**
 * Человекочитаемые имена файлов при загрузке в CMS (SEO + «Сохранить как…»).
 * Мусорные имена от ChatGPT / камеры / скриншотов не попадают в URL.
 */

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

/** Имена/шаблоны, которые нельзя оставлять в публичном URL. */
const JUNK_STEM_RE =
  /^(chatgpt|dall-?e|dalle|midjourney|stable-?diffusion|flux|screenshot|screen-?shot|untitled|image|photo|picture|img|dsc|dcim|whatsapp|telegram|signal|clipboard|paste|new-image|file|upload|bez-nazvaniya|файл|без-названия)(-|$)/i;

const JUNK_CONTAINS_RE =
  /(chatgpt|dall-?e|midjourney|stable-?diffusion|screenshot|screen-?shot|whatsapp-image|telegram-cloud)/i;

/** Даты вида 27_июл_2026 / 27-jul-2026 внутри имени AI-экспорта. */
const DATE_NOISE_RE =
  /\d{1,2}[-_](янв|фев|мар|апр|мая|май|июн|июл|авг|сен|окт|ноя|дек|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;

const CAMERA_SERIAL_RE = /^(img|dsc|dscn|pict|pxl|mvimg)[-_]?\d{3,}/i;

const DEFAULT_BY_KIND: Record<"image" | "video" | "document", string> = {
  image: "photo",
  video: "video",
  document: "document",
};

export function stripUploadExtension(fileName: string): string {
  return (fileName || "").replace(/\.[^.]+$/, "").trim();
}

/** Латиница + дефисы, без кириллицы в URL. */
export function slugifyUploadStem(raw: string, maxLen = 48): string {
  const transliterated = raw
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");
  const slug = transliterated
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
  return slug;
}

export function isJunkUploadStem(stem: string): boolean {
  const slug = slugifyUploadStem(stem);
  if (!slug || slug.length < 2) return true;
  if (JUNK_STEM_RE.test(slug)) return true;
  if (JUNK_CONTAINS_RE.test(slug)) return true;
  if (CAMERA_SERIAL_RE.test(slug)) return true;
  if (DATE_NOISE_RE.test(slug) && slug.length > 24) return true;
  if (/^[0-9]+$/.test(slug)) return true;
  return false;
}

export type BuildUploadFileStemInput = {
  originalFileName: string;
  /** slug / title объекта, проекта и т.п. */
  nameHint?: string | null;
  /** plan | cover | render | video … */
  role?: string | null;
  kind?: "image" | "video" | "document";
  /** Для тестов; по умолчанию Date.now().toString(36) */
  uniqueSuffix?: string;
};

/**
 * Итоговый stem без расширения: `petergof-bannyj-kompleks-ms3a8v7k`
 * или с ролью: `petergof-plan-ms3a8v7k`
 */
export function buildUploadFileStem(input: BuildUploadFileStemInput): string {
  const kind = input.kind ?? "image";
  const fromFileRaw = stripUploadExtension(input.originalFileName);
  const fromFile = slugifyUploadStem(fromFileRaw);
  const hint = slugifyUploadStem(input.nameHint ?? "");
  const role = slugifyUploadStem(input.role ?? "", 24);

  let base: string;
  if (hint) {
    // В CMS приоритет у контекста (объект/проект), а не у имени с диска.
    base = hint;
  } else if (fromFile && !isJunkUploadStem(fromFileRaw) && !isJunkUploadStem(fromFile)) {
    base = fromFile;
  } else {
    base = DEFAULT_BY_KIND[kind];
  }

  if (role && !base.endsWith(`-${role}`) && base !== role) {
    const withRole = slugifyUploadStem(`${base}-${role}`, 56);
    if (withRole) base = withRole;
  }

  const suffix = (input.uniqueSuffix ?? Date.now().toString(36)).replace(/[^a-z0-9]/gi, "").slice(0, 12);
  return suffix ? `${base}-${suffix}` : base;
}
