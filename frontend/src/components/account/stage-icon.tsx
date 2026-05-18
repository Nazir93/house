import type { LucideIcon } from "lucide-react";
import {
  Circle,
  Landmark,
  Layers,
  Home,
  Zap,
  PaintBucket,
  Hammer,
  CheckCircle2,
  Square,
  Grid2x2,
  Trees,
  Wind,
  Droplets,
  Flame,
  Thermometer,
  Factory,
  CircleDot,
  Route,
  Fence,
  Map,
} from "lucide-react";
import { resolveStageIconAssetUrl } from "@/lib/client-stage-icon-assets";
import { cn } from "@/lib/utils";

const LUCIDE_MAP: Record<string, LucideIcon> = {
  circle: Circle,
  foundation: Landmark,
  walls: Layers,
  roof: Home,
  engineering: Zap,
  finish: PaintBucket,
  house: Home,
  hammer: Hammer,
  check: CheckCircle2,
  windows: Square,
  facade: Grid2x2,
  landscaping: Trees,
  ventilation: Wind,
  interior: PaintBucket,
  electric: Zap,
  water: Droplets,
  "floor-heating": Flame,
  radiators: Thermometer,
  boiler: Factory,
  septic: CircleDot,
  well: Landmark,
  driveway: Route,
  "retaining-wall": Fence,
  "landscape-plan": Map,
  default: Circle,
};

/** Цвета иконок этапов: light / dark (п. 4–5 ТЗ). */
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
  "floor-heating": "stage-icon-tint stage-icon-tint--engineering",
  radiators: "stage-icon-tint stage-icon-tint--engineering",
  boiler: "stage-icon-tint stage-icon-tint--engineering",
  septic: "stage-icon-tint stage-icon-tint--engineering",
  well: "stage-icon-tint stage-icon-tint--engineering",
  driveway: "stage-icon-tint stage-icon-tint--landscaping",
  "retaining-wall": "stage-icon-tint stage-icon-tint--landscaping",
  "landscape-plan": "stage-icon-tint stage-icon-tint--landscaping",
  house: "stage-icon-tint stage-icon-tint--roof",
  hammer: "stage-icon-tint stage-icon-tint--engineering",
  circle: "stage-icon-tint stage-icon-tint--default",
  default: "stage-icon-tint stage-icon-tint--default",
};

export function StageIcon({
  iconKey,
  className,
  colored = false,
}: {
  iconKey: string;
  className?: string;
  /** Маленькие цветные иконки для ленты на главной ЛК */
  colored?: boolean;
}) {
  const assetUrl = resolveStageIconAssetUrl(iconKey);
  const tint = COLORED_CLASS[iconKey in COLORED_CLASS ? iconKey : "default"] ?? COLORED_CLASS.default;

  if (assetUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- локальные PNG из public/icons/stages
      <img
        src={assetUrl}
        alt=""
        aria-hidden
        draggable={false}
        className={cn("inline-block shrink-0 object-contain", className)}
      />
    );
  }

  const key = iconKey in LUCIDE_MAP ? iconKey : "default";
  const I = LUCIDE_MAP[key] ?? LUCIDE_MAP.default;
  return <I className={cn(className, colored && tint)} aria-hidden />;
}
