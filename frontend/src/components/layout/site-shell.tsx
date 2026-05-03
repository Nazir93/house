"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { ConditionalNavBar } from "./conditional-navbar";
import { Footer } from "./footer";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { FixedStatsBar } from "./fixed-stats-bar";
import { SmoothScroll } from "./smooth-scroll";
import { RouteScrollReset } from "./route-scroll-reset";
import { PageTransition } from "./page-transition";
import { CustomCursor } from "../ui/custom-cursor";
import { ContactModal } from "../ui/contact-modal";
import { CookieBanner } from "../ui/cookie-banner";
import { SmartCaptchaGate } from "../smartcaptcha-provider";
import { FloatingCallButton } from "./floating-call-button";
import { HouseRevealIntro } from "./house-reveal-intro";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/account");

  if (isAdmin || isAccount) {
    return <>{children}</>;
  }

  return (
    <SmartCaptchaGate>
    <>
      <HouseRevealIntro />
      <SmoothScroll />
      <RouteScrollReset />
      <CustomCursor />
      <ContactModal />
      <FloatingCallButton />
      <Header />
      <ConditionalNavBar />
      <main className="min-h-screen">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FixedStatsBar />
      <MobileBottomNav />
      <CookieBanner />
      <div className="h-14 lg:hidden" />
    </>
    </SmartCaptchaGate>
  );
}
