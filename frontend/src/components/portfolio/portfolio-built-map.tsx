"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { BuiltObjectItem } from "@/lib/construction-shared";
import { builtObjectMaterialLabel, getBuiltObjectCover } from "@/lib/construction-shared";

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

export function PortfolioBuiltMap({ objects }: { objects: BuiltObjectItem[] }) {
  const withCoords = useMemo(
    () => objects.filter((o) => o.latitude != null && o.longitude != null),
    [objects]
  );
  const positions = useMemo(
    () => withCoords.map((o) => [o.latitude!, o.longitude!] as [number, number]),
    [withCoords]
  );
  const center: [number, number] = positions[0] ?? [59.93, 30.35];

  if (withCoords.length === 0) {
    return (
      <p className="rounded-2xl border p-6 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        У объектов не заданы координаты — карта появится после заполнения широты и долготы в админке.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.35rem] border" style={{ borderColor: "rgba(43, 47, 45, 0.09)" }}>
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom
        className="z-0 h-[min(520px,70vh)] w-full [&_.leaflet-control-attribution]:text-[10px]"
        style={{ background: "var(--stone)" }}
      >
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds positions={positions} />
        {withCoords.map((o) => {
          const cover = getBuiltObjectCover(o);
          return (
            <Marker key={o.id} position={[o.latitude!, o.longitude!]}>
              <Popup>
                <div className="min-w-[150px] max-w-[220px]">
                  {cover ? (
                    <img src={cover.url} alt="" className="mb-2 h-20 w-full rounded-md object-cover" />
                  ) : null}
                  <p className="text-sm font-bold uppercase leading-tight text-[#1a1a1a]">{o.title}</p>
                  <p className="mt-1 text-xs text-neutral-600">{builtObjectMaterialLabel(o.material)}</p>
                  <Link href={`/portfolio/${o.slug}`} className="mt-2 inline-block text-xs font-semibold text-[#0F3D2E] underline">
                    Карточка объекта
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
