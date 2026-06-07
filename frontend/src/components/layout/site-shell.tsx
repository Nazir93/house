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
import { RevealObserver } from "./reveal-observer";
import { CustomCursor } from "../ui/custom-cursor";
import { ContactModal } from "../ui/contact-modal";
import { CookieBanner } from "../ui/cookie-banner";
import { SmartCaptchaGate } from "../smartcaptcha-provider";
import { DiscussProjectFab } from "./discuss-project-fab";
import { PwaInstallBanner } from "../pwa/pwa-install-banner";

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
      <CookieBanner />
      <div className="mobile-bottom-nav-spacer lg:hidden" />
    </>
    </SmartCaptchaGate>
  );
}
