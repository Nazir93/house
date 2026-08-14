import { SITE_NAME } from "@/lib/constants";
import {
  builtObjectMaterialLabel,
  normalizeBuiltObjectMaterialEnum,
} from "@/lib/construction-shared";
import { slugifyUploadStem } from "@/lib/upload-file-stem";

/**
 * Имена файлов и ALT/title фото реальных объектов (ТЗ SEO §19).
 * Не IMG_82456; ALT описывает конкретный кадр, без одного ключа на все картинки.
 */

export type BuiltObjectImageRole =
  | "cover"
  | "render"
  | "plan"
  | "phase"
  | "video"
  | "foto"
  | "stroyka"
  | "otzyv";

export type BuiltObjectImageSeoInput = {
  material?: string | null;
  location?: string | null;
  district?: string | null;
  title?: string | null;
  slug?: string | null;
  /** 1-based индекс в своей группе (рендеры / этап / …). */
  index?: number | null;
  role?: BuiltObjectImageRole | string | null;
  phaseKey?: string | null;
  phaseTitle?: string | null;
  label?: string | null;
  siteName?: string | null;
};

const MATERIAL_FILE_SLUG: Record<string, string> = {
  GAS_BLOCK: "gazobeton",
  BRICK: "kirpich",
  CERAMIC_BLOCK: "keramoblok",
  FRAME: "karkas",
  OTHER: "dom",
};

const MATERIAL_FROM_PHRASE: Record<string, string> = {
  GAS_BLOCK: "из газобетона",
  BRICK: "из кирпича",
  CERAMIC_BLOCK: "из керамоблока",
  FRAME: "каркасный",
  OTHER: "",
};

const PHASE_ALT: Record<string, string> = {
  foundation: "Фундамент",
  walls: "Кладка стен",
  partitions: "Перегородки",
  roof: "Кровля",
  windows: "Окна",
  facade: "Отделка фасада",
  floors: "Внутренняя отделка",
  landscaping: "Благоустройство участка",
  "blind-area": "Отмостка",
  mep: "Инженерные сети",
  "prep-base": "Подготовка основания",
  "ext-vent": "Вентиляция",
  conditioning: "Кондиционирование",
  power: "Электроснабжение",
  "external-networks": "Наружные сети",
};

export function builtObjectMaterialFileSlug(material: string | null | undefined): string {
  const key = normalizeBuiltObjectMaterialEnum(material);
  return MATERIAL_FILE_SLUG[key] ?? "dom";
}

export function builtObjectMaterialFromPhrase(material: string | null | undefined): string {
  const key = normalizeBuiltObjectMaterialEnum(material);
  return MATERIAL_FROM_PHRASE[key] ?? "";
}

/** Место для slug файла: район / локация / slug объекта. */
export function builtObjectPlaceFileSlug(input: {
  location?: string | null;
  district?: string | null;
  slug?: string | null;
  title?: string | null;
}): string {
  const district = input.district?.trim();
  if (district) {
    const fromDistrict = slugifyUploadStem(
      district.replace(/район/gi, " ").replace(/р-н/gi, " "),
      32,
    );
    if (fromDistrict) return fromDistrict;
  }

  const location = input.location?.trim();
  if (location) {
    const cleaned = location
      .replace(/г\.\s*/gi, " ")
      .replace(/д\.\s*/gi, " ")
      .replace(/пос\.\s*/gi, " ")
      .replace(/район/gi, " ")
      .replace(/р-н/gi, " ");
    const fromLoc = slugifyUploadStem(cleaned, 32);
    if (fromLoc) return fromLoc;
  }

  if (input.slug?.trim()) {
    const fromSlug = slugifyUploadStem(input.slug, 32);
    if (fromSlug) return fromSlug;
  }

  if (input.title?.trim()) {
    const fromTitle = slugifyUploadStem(input.title, 32);
    if (fromTitle) return fromTitle;
  }

  return "obekt";
}

/** «во Всеволожском районе» / «в д. Вырица» — для ALT. */
export function builtObjectPlaceAltPhrase(input: {
  location?: string | null;
  district?: string | null;
  title?: string | null;
}): string | null {
  const district = input.district?.trim();
  if (district) {
    if (/район/i.test(district)) {
      const base = district.replace(/\s*район\s*$/i, "").trim();
      if (/ий$/i.test(base)) return `во ${base.replace(/ий$/i, "ом")} районе`;
      if (/ый$/i.test(base)) return `в ${base.replace(/ый$/i, "ом")} районе`;
      return `в ${district}`;
    }
    return `в районе ${district}`;
  }

  const location = input.location?.trim();
  if (location) {
    if (/^во?\s/i.test(location)) return location;
    if (/ский\s+район/i.test(location)) {
      return `во ${location.replace(/ский\s+район/i, "ском районе")}`;
    }
    if (/район/i.test(location)) return `в ${location}`;
    return `в ${location}`;
  }

  return null;
}

function padIndex(index: number | null | undefined): string {
  const n = Number.isFinite(index) && (index as number) > 0 ? Math.floor(index as number) : 1;
  return String(n).padStart(2, "0");
}

function normalizeRole(role: string | null | undefined): BuiltObjectImageRole {
  const r = (role ?? "render").trim().toLowerCase();
  if (r === "cover" || r === "render" || r === "plan" || r === "phase" || r === "video") return r;
  if (r === "foto" || r === "photo") return "foto";
  if (r === "stroyka" || r === "build") return "stroyka";
  if (r === "otzyv") return "otzyv";
  if (r === "plan") return "plan";
  return "foto";
}

/**
 * Stem в духе `dom-gazobeton-vsevolozhsk-01` (без расширения; суффикс уникальности добавит upload).
 */
export function buildBuiltObjectImageFileStem(input: BuiltObjectImageSeoInput): string {
  const material = builtObjectMaterialFileSlug(input.material);
  const place = builtObjectPlaceFileSlug(input);
  const idx = padIndex(input.index);
  const role = normalizeRole(input.role);

  const parts = ["dom", material, place];
  if (role === "plan") parts.push("plan");
  else if (role === "stroyka" || role === "phase") {
    const phase = slugifyUploadStem(input.phaseKey || input.phaseTitle || "etap", 20);
    if (phase) parts.push(phase);
  } else if (role === "otzyv") parts.push("otzyv");
  else if (role === "video") parts.push("video");

  parts.push(idx);
  return slugifyUploadStem(parts.join("-"), 64) || `dom-${material}-${idx}`;
}

/** nameHint для admin upload — осмысленный stem вместо slug/IMG. */
export function buildBuiltObjectUploadNameHint(input: BuiltObjectImageSeoInput): string {
  return buildBuiltObjectImageFileStem(input);
}

export function isWeakBuiltObjectImageAlt(
  alt: string | null | undefined,
  objectTitle?: string | null,
): boolean {
  const t = (alt ?? "").trim();
  if (!t) return true;
  if (/^(img|dsc|dscn|pict|photo|image)[-_\s]?\d+/i.test(t)) return true;
  if (/^фото(\s|$)/i.test(t) && t.length < 24) return true;
  if (objectTitle?.trim() && t === objectTitle.trim()) return true;
  return false;
}

/**
 * Уникальный ALT под кадр. Бренд — только у обложки (index 1 / cover), не во все картинки.
 */
export function buildBuiltObjectImageAlt(input: BuiltObjectImageSeoInput): string {
  const brand = (input.siteName ?? SITE_NAME).trim() || SITE_NAME;
  const materialPhrase = builtObjectMaterialFromPhrase(input.material);
  const materialLabel = builtObjectMaterialLabel(input.material ?? "").trim();
  const place = builtObjectPlaceAltPhrase(input);
  const idx = Math.max(1, Math.floor(Number(input.index) || 1));
  const role = normalizeRole(input.role);
  const label = input.label?.trim();

  if (label && label.length >= 8 && !isWeakBuiltObjectImageAlt(label, input.title)) {
    return label;
  }

  if (role === "plan") {
    const base = input.title?.trim()
      ? `Планировка дома «${input.title.trim()}»`
      : "Планировка построенного дома";
    return idx > 1 ? `${base}, лист ${idx}` : base;
  }

  if (role === "video" || role === "otzyv") {
    const kind = role === "otzyv" ? "Видеоотзыв" : "Видеообзор";
    const where = place ? ` ${place}` : "";
    return `${kind} дома${materialPhrase ? ` ${materialPhrase}` : ""}${where}`;
  }

  if (role === "stroyka" || role === "phase") {
    const phase =
      (input.phaseKey && PHASE_ALT[input.phaseKey]) ||
      input.phaseTitle?.trim() ||
      "Этап строительства";
    const mat =
      materialPhrase && /стен|кладк/i.test(phase)
        ? ` ${materialPhrase}`
        : materialLabel
          ? ` (${materialLabel.toLowerCase()})`
          : "";
    const where = place ? ` — ${place}` : "";
    return `${phase}${mat}${where}${idx > 1 ? `, фото ${idx}` : ""}`;
  }

  // render / cover / foto — чередуем формулировки, чтобы не штамповать один ключ
  const variants: string[] = [];
  const matPart = materialPhrase ? ` ${materialPhrase}` : materialLabel ? ` (${materialLabel})` : "";
  const placePart = place ? ` ${place}` : "";

  variants.push(`Дом${matPart}${placePart}`);
  variants.push(`Фасад дома${matPart}${placePart}`);
  variants.push(`Общий вид построенного дома${placePart}`);
  variants.push(`Реализованный дом${matPart}${placePart}`);
  variants.push(`Экстерьер дома${matPart}${placePart}`);
  variants.push(`Построенный частный дом${placePart}`);

  let alt = (variants[(idx - 1) % variants.length] ?? variants[0]!).replace(/\s+/g, " ").trim();
  // Убрать висячие пробелы/скобки
  alt = alt.replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

  const isCover = role === "cover" || (role === "render" && idx === 1) || (role === "foto" && idx === 1);
  if (isCover && brand) {
    alt = `${alt} — ${brand}`;
  } else if (idx > 1) {
    // лёгкая уникализация без ключевого спама
    alt = `${alt}`.replace(/\s—\s.*$/, "");
  }

  return alt;
}

/** title изображения: короче ALT, без обязательного бренда на каждом кадре. */
export function buildBuiltObjectImageTitle(input: BuiltObjectImageSeoInput): string {
  const alt = buildBuiltObjectImageAlt({ ...input, siteName: "" });
  return alt.replace(/\s—\s*$/, "").trim() || input.title?.trim() || "Фото объекта";
}

/** Итоговый ALT: свой из CMS, если осмысленный; иначе генерация. */
export function resolveBuiltObjectImageAlt(
  storedAlt: string | null | undefined,
  input: BuiltObjectImageSeoInput,
): string {
  if (!isWeakBuiltObjectImageAlt(storedAlt, input.title)) {
    return storedAlt!.trim();
  }
  return buildBuiltObjectImageAlt(input);
}

export function resolveBuiltObjectImageTitle(
  storedAlt: string | null | undefined,
  input: BuiltObjectImageSeoInput,
): string {
  if (!isWeakBuiltObjectImageAlt(storedAlt, input.title)) {
    return storedAlt!.trim();
  }
  return buildBuiltObjectImageTitle(input);
}

/** ALT обложки объекта (карточки каталога / главная). */
export function resolveBuiltObjectCoverAlt(
  object: {
    material?: string | null;
    location?: string | null;
    district?: string | null;
    title?: string | null;
    slug?: string | null;
  },
  storedAlt?: string | null,
): string {
  return resolveBuiltObjectImageAlt(storedAlt, {
    material: object.material,
    location: object.location,
    district: object.district,
    title: object.title,
    slug: object.slug,
    index: 1,
    role: "cover",
  });
}
