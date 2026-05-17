"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { BuiltObjectItem, BuiltObjectSiteStatus } from "@/lib/construction-shared";
import { LeafletAttributionClean } from "@/components/map/leaflet-attribution-clean";
import { PortfolioMapTileLayer } from "@/components/map/portfolio-map-tile-layer";
import { DEFAULT_MAP_CENTER } from "@/lib/map-tiles";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 10);
      return;
    }
    const b = L.latLngBounds(positions.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(b, { padding: [48, 48], maxZoom: 11 });
  }, [map, positions]);
  return null;
}

function buildMarkerIcon(status: BuiltObjectSiteStatus | undefined, selected: boolean): L.DivIcon {
  const kind = status === "UNDER_CONSTRUCTION" ? "UNDER_CONSTRUCTION" : "COMPLETED";
  const bg = kind === "UNDER_CONSTRUCTION" ? "#e07018" : "#0F3D2E";
  const ring = selected ? "0 0 0 4px rgba(61,143,110,0.45)" : "0 4px 16px rgba(0,0,0,0.28)";
  const svgHouse =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10.5L12 4l8 6.5V20h-5v-6H9v6H4V10.5z" fill="white" fill-opacity="0.95"/></svg>';
  const svgBuild =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h16M7 8h10M10 8V4h4v4M9 16v4h6v-4M6 12h12" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const inner = kind === "UNDER_CONSTRUCTION" ? svgBuild : svgHouse;
  return L.divIcon({
    className: "everhouse-map-pin",
    html: `<div style="width:42px;height:42px;border-radius:14px;background:${bg};box-shadow:${ring};display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.95);transform:translateY(-6px)">${inner}</div>`,
    iconSize: [42, 50],
    iconAnchor: [21, 50],
  });
}

function MapBackgroundClicks({ onClear }: { onClear: () => void }) {
  useMapEvents({
    click(e) {
      const t = e.originalEvent?.target as HTMLElement | undefined;
      if (t?.closest?.(".leaflet-marker-icon, .everhouse-map-pin")) return;
      onClear();
    },
  });
  return null;
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

  const iconsById = useMemo(() => {
    const m = new Map<string, L.DivIcon>();
    for (const o of withCoords) {
      m.set(o.id, buildMarkerIcon(o.siteStatus, selectedId === o.id));
    }
    return m;
  }, [withCoords, selectedId]);

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

  const frame = frameless
    ? "overflow-hidden rounded-none border-0"
    : "overflow-hidden rounded-[1.35rem] border border-[rgba(43,47,45,0.09)]";

  return (
    <div className={frame}>
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom
        className={`z-0 w-full ${mapHeightClass} [&_.leaflet-control-attribution]:text-[10px]`}
        style={{ background: "var(--stone)" }}
      >
        <PortfolioMapTileLayer />
        <LeafletAttributionClean />
        <MapBackgroundClicks onClear={onMapBackgroundClick} />
        <FitBounds positions={positions} />
        {withCoords.map((o) => (
          <Marker
            key={o.id}
            position={[o.latitude!, o.longitude!]}
            icon={iconsById.get(o.id)}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onSelectMarker(o.id);
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
