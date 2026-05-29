import { cn } from "@/lib/utils";
import {
  CONSTRUCTION_STAGE_GLYPHS,
  resolveConstructionStageGlyphKey,
} from "@/components/account/construction-stage-glyphs";
import { resolveStageIconKeyForDisplay } from "@/lib/client-project-stage-icons";

/** Цвета иконок этапов: light / dark (globals.css .stage-icon-tint--*). */
const COLORED_CLASS: Record<string, string> = {
  foundation: "stage-icon-tint stage-icon-tint--foundation",
  walls: "stage-icon-tint stage-icon-tint--walls",
  roof: "stage-icon-tint stage-icon-tint--roof",
  engineering: "stage-icon-tint stage-icon-tint--engineering",
  finish: "stage-icon-tint stage-icon-tint--finish",
  windows: "stage-icon-tint stage-icon-tint--windows",
  facade: "stage-icon-tint stage-icon-tint--facade",
  landscaping: "stage-icon-tint stage-icon-tint--landscaping",
  interior: "stage-icon-tint stage-icon-tint--finish",
  electric: "stage-icon-tint stage-icon-tint--engineering",
  water: "stage-icon-tint stage-icon-tint--engineering",
  ventilation: "stage-icon-tint stage-icon-tint--engineering",
  "floor-heating": "stage-icon-tint stage-icon-tint--engineering",
  radiators: "stage-icon-tint stage-icon-tint--engineering",
  boiler: "stage-icon-tint stage-icon-tint--engineering",
  septic: "stage-icon-tint stage-icon-tint--engineering",
  well: "stage-icon-tint stage-icon-tint--engineering",
  driveway: "stage-icon-tint stage-icon-tint--landscaping",
  "retaining-wall": "stage-icon-tint stage-icon-tint--landscaping",
  "landscape-plan": "stage-icon-tint stage-icon-tint--landscaping",
  house: "stage-icon-tint stage-icon-tint--facade",
  hammer: "stage-icon-tint stage-icon-tint--engineering",
  circle: "stage-icon-tint stage-icon-tint--default",
  default: "stage-icon-tint stage-icon-tint--default",
};

export function StageIcon({
  iconKey,
  title,
  className,
  colored = false,
}: {
  iconKey: string;
  /** Название этапа — для подстановки иконки, если в БД legacy-ключ (circle и т.п.). */
  title?: string;
  className?: string;
  /** Цветные контурные иконки для карточек этапов (light / dark). */
  colored?: boolean;
}) {
  const resolvedIconKey = title ? resolveStageIconKeyForDisplay(title, iconKey) : iconKey;
  const key = resolveConstructionStageGlyphKey(resolvedIconKey);
  const Glyph = CONSTRUCTION_STAGE_GLYPHS[key];
  const tint = COLORED_CLASS[key] ?? COLORED_CLASS.default;

  return <Glyph className={cn(className, colored && tint)} />;
}
