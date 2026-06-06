import type { MetadataRoute } from "next";

import { SITE_NAME, getDefaultSiteGeoDescription } from "@/lib/constants";
import { buildPwaManifest } from "@/lib/pwa-config";

export default function manifest(): MetadataRoute.Manifest {
  return buildPwaManifest({
    siteName: SITE_NAME,
    description: getDefaultSiteGeoDescription(),
  });
}
