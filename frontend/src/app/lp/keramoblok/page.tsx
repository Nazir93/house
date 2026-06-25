import {
  AdvertisingLandingPage,
  generateAdvertisingLandingMetadata,
} from "@/app/lp/landing-page";

export const metadata = generateAdvertisingLandingMetadata("keramoblok");

export default function KeramoblokAdvertisingLandingRoute() {
  return <AdvertisingLandingPage slug="keramoblok" />;
}
