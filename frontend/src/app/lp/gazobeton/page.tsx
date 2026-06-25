import {
  AdvertisingLandingPage,
  generateAdvertisingLandingMetadata,
} from "@/app/lp/landing-page";

export const metadata = generateAdvertisingLandingMetadata("gazobeton");

export default function GazobetonAdvertisingLandingRoute() {
  return <AdvertisingLandingPage slug="gazobeton" />;
}
