"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { ConditionalNavBar } from "./conditional-navbar";
import { Footer } from "./footer";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { FixedStatsBar } from "./fixed-stats-bar";
import { SmoothScroll } from "./smooth-scroll";
import { RouteScrollReset } from "./route-scroll-reset";
import { PageTransition } from "./page-transition";
import { RevealObserver } from "./reveal-observer";
import { CustomCursor } from "../ui/custom-cursor";
import { ContactModal } from "../ui/contact-modal";
import { CookieBanner } from "../ui/cookie-banner";
import { SmartCaptchaGate } from "../smartcaptcha-provider";
import { DiscussProjectFab } from "./discuss-project-fab";
import { PwaInstallBanner } from "../pwa/pwa-install-banner";
import { ProjectCompareBar } from "../projects/project-compare-bar";
import {
  isAccountShellPath,
  isAdminShellPath,
  isAdvertisingLandingPath,
} from "@/lib/site-shell-routes";
import { isLowPerfDevice } from "@/lib/use-perf";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = isAdminShellPath(pathname);
  const isAccount = isAccountShellPath(pathname);
  const isAdvertisingLanding = isAdvertisingLandingPath(pathname);

  useEffect(() => {
    const root = document.documentElement;
    if (isLowPerfDevice()) root.dataset.lowPerf = "1";
    else delete root.dataset.lowPerf;
  }, []);

  if (isAdmin || isAccount) {
    return <>{children}</>;
  }

  if (isAdvertisingLanding) {
    return (
      <SmartCaptchaGate>
        <RouteScrollReset />
        <RevealObserver />
        {/* CTA LP открывают openModalToEstimate — без ContactModal клик «молчит». */}
        <ContactModal />
        <main className="min-h-screen">{children}</main>
        <CookieBanner />
      </SmartCaptchaGate>
    );
  }

  return (
    <SmartCaptchaGate>
    <>
      <SmoothScroll />
      <RouteScrollReset />
      <RevealObserver />
      <CustomCursor />
      <ContactModal />
      <DiscussProjectFab />
      <Header />
      <ConditionalNavBar />
      <main className="min-h-screen">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <FixedStatsBar />
      <MobileBottomNav />
      <PwaInstallBanner />
      <ProjectCompareBar />
      <CookieBanner />
      <div className="mobile-bottom-nav-spacer lg:hidden" />
    </>
    </SmartCaptchaGate>
  );
}
