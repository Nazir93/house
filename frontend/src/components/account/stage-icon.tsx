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
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  circle: Circle,
  foundation: Landmark,
  walls: Layers,
  roof: Home,
  engineering: Zap,
  finish: PaintBucket,
  house: Home,
  hammer: Hammer,
  check: CheckCircle2,
  default: Circle,
};

export function StageIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const I = MAP[iconKey] ?? MAP.default;
  return <I className={className} aria-hidden />;
}
