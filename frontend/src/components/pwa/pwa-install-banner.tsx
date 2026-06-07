"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import {
  PWA_INSTALL_DISMISS_KEY,
  detectIosUserAgent,
  isStandaloneDisplayMode,
  pwaInstallBannerMessage,
  resolvePwaInstallPlatform,
  shouldShowPwaInstallBanner,
  type PwaInstallPlatform,
} from "@/lib/pwa-install-prompt";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<PwaInstallPlatform>("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(PWA_INSTALL_DISMISS_KEY) === "1";
    } catch {
      dismissed = false;
    }

    const ua = navigator.userAgent;
    const standalone = isStandaloneDisplayMode(
      window.matchMedia.bind(window),
      // @ts-expect-error legacy iOS PWA flag
      navigator.standalone
    );
    const isMobileViewport = window.matchMedia("(max-width: 1023px)").matches;

    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPlatform("android");
      if (
        shouldShowPwaInstallBanner({
          dismissed,
          standalone,
          isMobileViewport,
          platform: "android",
        })
      ) {
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onBip);

    const resolved = resolvePwaInstallPlatform(ua, false);
    const showIos = detectIosUserAgent(ua) && !deferredPrompt;
    const effectivePlatform = showIos ? "ios" : resolved;

    if (
      shouldShowPwaInstallBanner({
        dismissed,
        standalone,
        isMobileViewport,
        platform: effectivePlatform,
      })
    ) {
      const timer = window.setTimeout(() => {
        setPlatform(effectivePlatform);
        setVisible(true);
      }, 2200);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onBip);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(PWA_INSTALL_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      /* ignore */
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
      dismiss();
    }
  }, [deferredPrompt, dismiss]);

  if (!visible) return null;

  const canInstallNative = platform === "android" && deferredPrompt !== null;

  return (
    <div
      className="fixed left-3 right-3 z-[58] animate-slideUp lg:left-auto lg:right-6 lg:max-w-sm mobile-above-bottom-nav lg:bottom-4"
      role="region"
      aria-label="Установка PWA-приложения"
    >
      <div
        className="rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: "color-mix(in srgb, var(--card-bg) 92%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(15, 61, 46, 0.12)", color: "var(--accent)" }}
          >
            <Smartphone size={20} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-bold leading-snug" style={{ color: "var(--text)" }}>
              Установите приложение
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {pwaInstallBannerMessage(platform)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {canInstallNative ? (
                <button
                  type="button"
                  onClick={install}
                  disabled={installing}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition hover:scale-[1.02] disabled:opacity-60"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  <Download size={14} aria-hidden />
                  {installing ? "Установка…" : "Добавить"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-3 py-2 text-xs font-medium transition hover:opacity-80"
                style={{ color: "var(--text-muted)" }}
              >
                {canInstallNative ? "Позже" : "Понятно"}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-full p-1.5 transition hover:bg-black/5"
            aria-label="Закрыть"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
