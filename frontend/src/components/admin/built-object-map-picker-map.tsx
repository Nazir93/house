"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  DEFAULT_MAP_CENTER,
  PORTFOLIO_MAP_TILE_ATTRIBUTION,
  PORTFOLIO_MAP_TILE_URL,
} from "@/lib/map-tiles";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

function MapViewSync({ lat, lon }: { lat: number | null; lon: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lon == null) return;
    map.setView([lat, lon], Math.max(map.getZoom(), 12));
  }, [map, lat, lon]);
  return null;
}

function MapClickPlace({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export type BuiltObjectMapPickerMapProps = {
  latitude: number | null;
  longitude: number | null;
  onPick: (lat: number, lon: number) => void;
};

export function BuiltObjectMapPickerMap({ latitude, longitude, onPick }: BuiltObjectMapPickerMapProps) {
  const center: [number, number] =
    latitude != null && longitude != null ? [latitude, longitude] : DEFAULT_MAP_CENTER;
  const zoom = latitude != null && longitude != null ? 12 : 8;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="z-0 h-[280px] w-full rounded-xl [&_.leaflet-control-attribution]:text-[9px]"
    >
      <TileLayer attribution={PORTFOLIO_MAP_TILE_ATTRIBUTION} url={PORTFOLIO_MAP_TILE_URL} />
      <MapClickPlace onPick={onPick} />
      <MapViewSync lat={latitude} lon={longitude} />
      {latitude != null && longitude != null ? (
        <Marker
          position={[latitude, longitude]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const ll = (e.target as L.Marker).getLatLng();
              onPick(ll.lat, ll.lng);
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
