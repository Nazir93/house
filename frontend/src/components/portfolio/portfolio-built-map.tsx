"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { BuiltObjectItem, BuiltObjectSiteStatus } from "@/lib/construction-shared";
import {
  DEFAULT_MAP_CENTER,
  YANDEX_MAPS_API_KEY,
  YANDEX_MAPS_API_LANG,
  yandexMapsPointUrl,
} from "@/lib/map-tiles";

type YandexMap = {
  destroy: () => void;
  setCenter: (coords: [number, number], zoom?: number, options?: Record<string, unknown>) => void;
  setBounds: (bounds: unknown, options?: Record<string, unknown>) => void;
  geoObjects: {
    add: (object: YandexPlacemark) => void;
    remove: (object: YandexPlacemark) => void;
  };
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
};

type YandexPlacemark = {
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
};

type YMapsApi = {
  ready: (callback: () => void) => void;
  Map: new (
    node: HTMLElement,
    state: { center: [number, number]; zoom: number; controls: string[] }
  ) => YandexMap;
  Placemark: new (
    coords: [number, number],
    properties: Record<string, string>,
    options: Record<string, string>
  ) => YandexPlacemark;
  util: {
    bounds: {
      fromPoints: (points: [number, number][]) => unknown;
    };
  };
};

declare global {
  interface Window {
    ymaps?: YMapsApi;
    __yandexMapsPromise?: Promise<YMapsApi>;
  }
}

function loadYandexMaps(): Promise<YMapsApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("window_unavailable"));
  if (!YANDEX_MAPS_API_KEY) return Promise.reject(new Error("yandex_maps_api_key_missing"));
  if (window.ymaps) return Promise.resolve(window.ymaps);
  if (window.__yandexMapsPromise) return window.__yandexMapsPromise;
  const params = new URLSearchParams({ lang: YANDEX_MAPS_API_LANG });
  params.set("apikey", YANDEX_MAPS_API_KEY);
  window.__yandexMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?${params.toString()}`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error("yandex_maps_unavailable"));
        return;
      }
      const ymaps = window.ymaps;
      ymaps.ready(() => resolve(ymaps));
    };
    script.onerror = () => reject(new Error("yandex_maps_load_failed"));
    document.head.appendChild(script);
  });
  return window.__yandexMapsPromise;
}

function markerPreset(status: BuiltObjectSiteStatus | undefined, selected: boolean): string {
  if (selected) return "islands#darkGreenCircleIcon";
  return status === "UNDER_CONSTRUCTION" ? "islands#orangeCircleIcon" : "islands#darkGreenCircleIcon";
}

export type PortfolioBuiltMapProps = {
  objects: BuiltObjectItem[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  onMapBackgroundClick: () => void;
  mapHeightClass?: string;
  frameless?: boolean;
};

export function PortfolioBuiltMap({
  objects,
  selectedId,
  onSelectMarker,
  onMapBackgroundClick,
  mapHeightClass = "h-[min(520px,70vh)]",
  frameless = false,
}: PortfolioBuiltMapProps) {
  const withCoords = useMemo(
    () => objects.filter((o) => o.latitude != null && o.longitude != null),
    [objects]
  );
  const positions = useMemo(
    () => withCoords.map((o) => [o.latitude!, o.longitude!] as [number, number]),
    [withCoords]
  );
  const center: [number, number] = positions[0] ?? DEFAULT_MAP_CENTER;
  const mapId = useId().replace(/:/g, "");
  const mapRef = useRef<YandexMap | null>(null);
  const placemarkRefs = useRef<YandexPlacemark[]>([]);
  const [loadError, setLoadError] = useState(false);

  const selectedPosition = useMemo((): [number, number] | null => {
    if (!selectedId) return null;
    const o = withCoords.find((item) => item.id === selectedId);
    if (!o || o.latitude == null || o.longitude == null) return null;
    return [o.latitude, o.longitude];
  }, [selectedId, withCoords]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);

    loadYandexMaps()
      .then((ymaps) => {
        if (cancelled) return;
        const node = document.getElementById(mapId);
        if (!node) return;

        if (!mapRef.current) {
          mapRef.current = new ymaps.Map(node, {
            center,
            zoom: 8,
            controls: ["zoomControl", "fullscreenControl", "geolocationControl", "typeSelector"],
          });
          mapRef.current.events.add("click", () => onMapBackgroundClick());
        }

        const map = mapRef.current;
        if (!map) return;
        placemarkRefs.current.forEach((placemark) => map.geoObjects.remove(placemark));
        placemarkRefs.current = [];

        withCoords.forEach((object) => {
          const selected = object.id === selectedId;
          const placemark = new ymaps.Placemark(
            [object.latitude!, object.longitude!],
            {
              hintContent: object.title,
              balloonContentHeader: object.title,
              balloonContentBody: object.location ?? "",
            },
            {
              preset: markerPreset(object.siteStatus, selected),
              iconColor: selected ? "#0F3D2E" : object.siteStatus === "UNDER_CONSTRUCTION" ? "#e07018" : "#0F3D2E",
            }
          );
          placemark.events.add("click", () => onSelectMarker(object.id));
          map.geoObjects.add(placemark);
          placemarkRefs.current.push(placemark);
        });

        if (selectedPosition) {
          map.setCenter(selectedPosition, 13, { duration: 250 });
        } else if (positions.length === 1) {
          map.setCenter(positions[0], 10);
        } else if (positions.length > 1) {
          map.setBounds(ymaps.util.bounds.fromPoints(positions), {
            checkZoomRange: true,
            zoomMargin: 48,
            duration: 250,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [center, mapId, onMapBackgroundClick, onSelectMarker, positions, selectedId, selectedPosition, withCoords]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  if (withCoords.length === 0) {
    return (
      <p
        className="rounded-2xl border p-6 text-sm"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        У объектов не заданы координаты — в админке кликните на карте, где стоит дом, и сохраните объект.
      </p>
    );
  }

  if (loadError) {
    return (
      <p
        className="rounded-2xl border p-6 text-sm"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        Яндекс.Карта не загрузилась. Проверьте бесплатный API-ключ в NEXT_PUBLIC_YANDEX_MAPS_API_KEY.
      </p>
    );
  }

  const frame = frameless
    ? "overflow-hidden rounded-none border-0"
    : "overflow-hidden rounded-[1.35rem] border border-[rgba(43,47,45,0.09)]";

  return (
    <div className={frame}>
      <div id={mapId} className={`z-0 w-full ${mapHeightClass}`} style={{ background: "var(--stone)" }} />
      <div className="flex items-center justify-end border-t bg-[var(--bg)] px-3 py-2 text-xs" style={{ borderColor: "var(--border)" }}>
        <a
          href={selectedPosition ? yandexMapsPointUrl(selectedPosition[0], selectedPosition[1], 13) : "https://yandex.ru/maps/"}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
        >
          Открыть в Яндекс Картах
        </a>
      </div>
    </div>
  );
}
