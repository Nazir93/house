import {
  AdvertisingLandingPage,
  generateAdvertisingLandingMetadata,
} from "@/app/lp/landing-page";

export const metadata = generateAdvertisingLandingMetadata("kirpich");

export default function KirpichAdvertisingLandingRoute() {
  return <AdvertisingLandingPage slug="kirpich" />;
}

