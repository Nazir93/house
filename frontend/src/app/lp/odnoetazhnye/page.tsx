import {
  AdvertisingLandingPage,
  generateAdvertisingLandingMetadata,
} from "@/app/lp/landing-page";

export const metadata = generateAdvertisingLandingMetadata("odnoetazhnye");

export default function OdnoetazhnyeAdvertisingLandingRoute() {
  return <AdvertisingLandingPage slug="odnoetazhnye" />;
}
