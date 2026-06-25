import {
  AdvertisingLandingPage,
  generateAdvertisingLandingMetadata,
} from "@/app/lp/landing-page";

export const metadata = generateAdvertisingLandingMetadata("stoimost");

export default function StoimostAdvertisingLandingRoute() {
  return <AdvertisingLandingPage slug="stoimost" />;
}

