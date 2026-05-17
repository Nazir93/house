"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Убирает префикс Leaflet (флаг) — остаётся только OpenStreetMap / CARTO. */
export function LeafletAttributionClean() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix(false);
  }, [map]);
  return null;
}
