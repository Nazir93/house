"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { MapPin } from "lucide-react";
import { normalizeRussiaMapCoordinates } from "@/lib/map-tiles";

const BuiltObjectMapPickerMap = dynamic(
  () => import("@/components/admin/built-object-map-picker-map").then((m) => m.BuiltObjectMapPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-white/45">
        Загрузка карты…
      </div>
    ),
  }
);

export type BuiltObjectMapPickerProps = {
  latitude: string;
  longitude: string;
  onCoordinatesChange: (lat: string, lon: string) => void;
};

export function BuiltObjectMapPicker({ latitude, longitude, onCoordinatesChange }: BuiltObjectMapPickerProps) {
  const [swapHint, setSwapHint] = useState(false);

  const latNum = parseCoord(latitude);
  const lonNum = parseCoord(longitude);

  const applyCoords = useCallback(
    (lat: number, lon: number) => {
      const norm = normalizeRussiaMapCoordinates(lat, lon);
      setSwapHint(norm.swapped);
      onCoordinatesChange(formatCoord(norm.latitude), formatCoord(norm.longitude));
    },
    [onCoordinatesChange]
  );

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Где дом на карте</p>
        <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-white/40">
          Бесплатная карта, без ключей. Кликните на место дома или перетащите метку. Поле «адрес» выше — только текст
          для сайта, на карту не влияет.
        </p>
      </div>

      {swapHint ? (
        <p className="text-xs text-amber-300/90">
          Широта и долгота были перепутаны местами — исправлено автоматически.
        </p>
      ) : null}

      <BuiltObjectMapPickerMap latitude={latNum} longitude={lonNum} onPick={applyCoords} />

      <p className="flex items-center gap-1.5 text-[11px] text-white/35">
        <MapPin size={12} aria-hidden />
        {latNum != null && lonNum != null
          ? `Метка: ${formatCoord(latNum)}, ${formatCoord(lonNum)}`
          : "Кликните на карту — без метки дом на карте портфолио не появится"}
      </p>
    </div>
  );
}

function parseCoord(value: string): number | null {
  const s = value.trim().replace(",", ".");
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function formatCoord(n: number | null): string {
  if (n == null) return "";
  return String(Math.round(n * 1e6) / 1e6);
}
