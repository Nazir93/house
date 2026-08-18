"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import dynamic from "next/dynamic";

import {
  isSmartCaptchaHostOrKeyError,
  resolveSmartCaptchaWaiter,
} from "@/lib/smart-captcha-client";

const siteKey = process.env.NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY || "";

const InvisibleSmartCaptcha = dynamic(
  () => import("@yandex/smart-captcha").then((m) => m.InvisibleSmartCaptcha),
  { ssr: false },
);

type SmartCaptchaContextType = {
  getToken: () => Promise<string>;
};

const SmartCaptchaContext = createContext<SmartCaptchaContextType | null>(null);

export function useSmartCaptchaToken() {
  const ctx = useContext(SmartCaptchaContext);
  return ctx?.getToken ?? (async () => "");
}

export function SmartCaptchaGate({ children }: { children: React.ReactNode }) {
  const [mountWidget, setMountWidget] = useState(false);
  const [triggerExecute, setTriggerExecute] = useState(false);
  const [captchaBroken, setCaptchaBroken] = useState(false);
  const resolveRef = useRef<((token: string) => void) | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const finishWait = useCallback((token = "") => {
    resolveSmartCaptchaWaiter(resolveRef, timeoutRef, token);
    setTriggerExecute(false);
  }, []);

  const getToken = useCallback(() => {
    if (!siteKey || captchaBroken) return Promise.resolve("");
    setMountWidget(true);
    return new Promise<string>((resolve) => {
      resolveRef.current = resolve;
      setTriggerExecute(true);
      timeoutRef.current = setTimeout(() => finishWait(""), 30000);
    });
  }, [captchaBroken, finishWait]);

  const handleSuccess = useCallback(
    (token: string) => {
      finishWait(token);
    },
    [finishWait],
  );

  const handleCaptchaFailure = useCallback(
    (message?: string) => {
      if (isSmartCaptchaHostOrKeyError(message)) {
        setCaptchaBroken(true);
        setMountWidget(false);
      }
      finishWait("");
    },
    [finishWait],
  );

  return (
    <SmartCaptchaContext.Provider value={{ getToken }}>
      {siteKey && mountWidget && !captchaBroken ? (
        <InvisibleSmartCaptcha
          sitekey={siteKey}
          onSuccess={handleSuccess}
          onNetworkError={() => handleCaptchaFailure("network error")}
          onJavascriptError={(error) => handleCaptchaFailure(error.message)}
          visible={triggerExecute}
          hideShield
          language="ru"
        />
      ) : null}
      {children}
    </SmartCaptchaContext.Provider>
  );
}
