"use client";

import { TileLayer } from "react-leaflet";
import {
  PORTFOLIO_MAP_TILE_ATTRIBUTION,
  PORTFOLIO_MAP_TILE_MAX_ZOOM,
  PORTFOLIO_MAP_TILE_SUBDOMAINS,
  PORTFOLIO_MAP_TILE_URL,
} from "@/lib/map-tiles";

export function PortfolioMapTileLayer() {
  return (
    <TileLayer
      attribution={PORTFOLIO_MAP_TILE_ATTRIBUTION}
      url={PORTFOLIO_MAP_TILE_URL}
      subdomains={[...PORTFOLIO_MAP_TILE_SUBDOMAINS]}
      maxZoom={PORTFOLIO_MAP_TILE_MAX_ZOOM}
      maxNativeZoom={PORTFOLIO_MAP_TILE_MAX_ZOOM}
    />
  );
}
