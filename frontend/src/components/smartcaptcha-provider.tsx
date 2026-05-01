"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { InvisibleSmartCaptcha } from "@yandex/smart-captcha";

const siteKey = process.env.NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY || "";

type SmartCaptchaContextType = {
  getToken: () => Promise<string>;
};

const SmartCaptchaContext = createContext<SmartCaptchaContextType | null>(null);

export function useSmartCaptchaToken() {
  const ctx = useContext(SmartCaptchaContext);
  return ctx?.getToken ?? (async () => "");
}

export function SmartCaptchaGate({ children }: { children: React.ReactNode }) {
  const [triggerExecute, setTriggerExecute] = useState(false);
  const resolveRef = useRef<(token: string) => void>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const getToken = useCallback(() => {
    if (!siteKey) return Promise.resolve("");
    return new Promise<string>((resolve) => {
      resolveRef.current = resolve;
      setTriggerExecute(true);
      timeoutRef.current = setTimeout(() => {
        if (resolveRef.current) {
          resolveRef.current("");
          resolveRef.current = undefined;
          setTriggerExecute(false);
        }
      }, 30000);
    });
  }, []);

  const handleSuccess = useCallback((token: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (resolveRef.current) {
      resolveRef.current(token);
      resolveRef.current = undefined;
    }
    setTriggerExecute(false);
  }, []);

  return (
    <SmartCaptchaContext.Provider value={{ getToken }}>
      {siteKey ? (
        <InvisibleSmartCaptcha
          sitekey={siteKey}
          onSuccess={handleSuccess}
          visible={triggerExecute}
          hideShield
          language="ru"
        />
      ) : null}
      {children}
    </SmartCaptchaContext.Provider>
  );
}
