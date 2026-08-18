/**
 * Lead под H1/H2: на телефоне и планшете — естественный перенос,
 * на широком desktop — без искусственного max-width.
 */
export const SECTION_LEAD_CLASSNAME =
  "max-w-2xl text-pretty text-sm leading-relaxed text-[var(--text-muted)] sm:max-w-3xl sm:text-[15px] md:text-base lg:max-w-none";

/** То же для intro с чуть большим кеглем (каталоги). */
export const PAGE_LEAD_CLASSNAME =
  "max-w-2xl text-pretty text-[15px] leading-relaxed text-[var(--text-muted)] sm:max-w-3xl md:max-w-4xl md:text-base lg:max-w-none";
