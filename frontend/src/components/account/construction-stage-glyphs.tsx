import type { ReactElement, SVGProps } from "react";
import { cn } from "@/lib/utils";

type GlyphProps = SVGProps<SVGSVGElement>;

const STROKE = 1.6;

function Glyph({ className, children, ...rest }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Фундамент — опорная плита / ростверк. */
export function FoundationGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M4 19h16" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M6 19V15l2.5-2.5h7L18 15v4" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M8 12.5h8" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Стены — кладка / несущие стены. */
export function WallsGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 5h6v5H5zM13 5h6v5h-6zM5 12h6v5H5zM13 12h6v5h-6z" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
    </Glyph>
  );
}

/** Кровля — дом с двускатной крышей. */
export function RoofGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M4 11 12 5l8 6" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M7 11v8h10v-8" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
    </Glyph>
  );
}

/** Окна — рама с перекрестием. */
export function WindowsGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="5" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Инженерные сети — узел коммуникаций. */
export function EngineeringGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M12 5v4.5M12 14.5V19M5 12h4.5M14.5 12H19" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Фасад — фронтон здания. */
export function FacadeGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M6 20V10l6-4 6 4v10" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M9 14h2v6H9zM13 14h2v6h-2z" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M11 10h2" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Внутренняя отделка — валик / малярный инструмент. */
export function InteriorGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 18h11" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M16 18l3-3" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <rect x="4" y="8" width="10" height="6" rx="1" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M7 8V6" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Благоустройство — дерево. */
export function LandscapingGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M12 19V13" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M8 13c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M7 15c0-2 1.5-3.5 5-3.5s5 1.5 5 3.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Электроснабжение. */
export function ElectricGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path
        d="M13 4 9 13h4l-1 7 6-9h-4l-1-7z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Glyph>
  );
}

/** Водоснабжение. */
export function WaterGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path
        d="M12 4.5c-3 3.5-5 6-5 8.5a5 5 0 0 0 10 0c0-2.5-2-5-5-8.5z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Glyph>
  );
}

/** Вентиляция — решётка / поток воздуха. */
export function VentilationGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="5" y="7" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M8 11h8M8 14h8M8 17h8" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Тёплый пол — волны под перекрытием. */
export function FloorHeatingGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 9h14" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path
        d="M7 14c1.5-2 3-2 4.5 0s3 2 4.5 0"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path d="M7 18h10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeDasharray="2 2" />
    </Glyph>
  );
}

/** Радиаторы. */
export function RadiatorsGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="6" y="7" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M9 7v10M12 7v10M15 7v10" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Котельная — котёл с пламенем. */
export function BoilerGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="6" y="10" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M9 10V8h6v2" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path
        d="M10.5 16c.5-1 1-1 1.5 0s1 1 1.5 0 1-1 1.5 0"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Glyph>
  );
}

/** Септик — ёмкость. */
export function SepticGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="5" y="10" width="14" height="8" rx="3" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M8 10V8h8v2" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Колодец / скважина. */
export function WellGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M12 11v8" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Заезд на участок. */
export function DrivewayGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path
        d="M5 18c3-6 5-8 7-8s4 2 7 8"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path d="M5 18h14" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Подпорная стена — ступенчатые блоки. */
export function RetainingWallGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 19h14" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
      <path d="M6 19V15h4v4M10 19V13h4v6M14 19V11h4v8" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
    </Glyph>
  );
}

/** Планировка территории — схема участка. */
export function LandscapePlanGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M6 5h10l3 3v11H6z" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M16 5v3h3" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M9 14h6M9 11h4" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

/** Универсальная иконка этапа. */
export function DefaultStageGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth={STROKE} />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </Glyph>
  );
}

export type ConstructionStageGlyphKey =
  | "foundation"
  | "walls"
  | "roof"
  | "windows"
  | "engineering"
  | "facade"
  | "interior"
  | "landscaping"
  | "electric"
  | "water"
  | "ventilation"
  | "floor-heating"
  | "radiators"
  | "boiler"
  | "septic"
  | "well"
  | "driveway"
  | "retaining-wall"
  | "landscape-plan"
  | "finish"
  | "house"
  | "hammer"
  | "circle"
  | "check"
  | "default";

export const CONSTRUCTION_STAGE_GLYPHS: Record<
  ConstructionStageGlyphKey,
  (props: GlyphProps) => ReactElement
> = {
  foundation: FoundationGlyph,
  walls: WallsGlyph,
  roof: RoofGlyph,
  windows: WindowsGlyph,
  engineering: EngineeringGlyph,
  facade: FacadeGlyph,
  interior: InteriorGlyph,
  landscaping: LandscapingGlyph,
  electric: ElectricGlyph,
  water: WaterGlyph,
  ventilation: VentilationGlyph,
  "floor-heating": FloorHeatingGlyph,
  radiators: RadiatorsGlyph,
  boiler: BoilerGlyph,
  septic: SepticGlyph,
  well: WellGlyph,
  driveway: DrivewayGlyph,
  "retaining-wall": RetainingWallGlyph,
  "landscape-plan": LandscapePlanGlyph,
  finish: InteriorGlyph,
  house: FacadeGlyph,
  hammer: EngineeringGlyph,
  circle: DefaultStageGlyph,
  check: DefaultStageGlyph,
  default: DefaultStageGlyph,
};

export function resolveConstructionStageGlyphKey(iconKey: string): ConstructionStageGlyphKey {
  if (iconKey in CONSTRUCTION_STAGE_GLYPHS) {
    return iconKey as ConstructionStageGlyphKey;
  }
  return "default";
}
