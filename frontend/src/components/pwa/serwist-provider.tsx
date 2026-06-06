"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

import { isPwaEnabled, PWA_SW_URL } from "@/lib/pwa-config";

export function PwaSerwistProvider({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl={PWA_SW_URL} disable={!isPwaEnabled()}>
      {children}
    </SerwistProvider>
  );
}
