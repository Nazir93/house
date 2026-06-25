import {
  AdvertisingLandingPage,
  generateAdvertisingLandingMetadata,
} from "@/app/lp/landing-page";

export const metadata = generateAdvertisingLandingMetadata("dom-pod-klyuch");

export default function DomPodKlyuchAdvertisingLandingRoute() {
  return <AdvertisingLandingPage slug="dom-pod-klyuch" />;
}

