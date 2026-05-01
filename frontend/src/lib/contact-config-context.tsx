"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createDefaultContactConfig, type ContactConfig } from "@/lib/contact-config";

const ContactConfigContext = createContext<ContactConfig | null>(null);

const fallback = createDefaultContactConfig();

export function ContactConfigProvider({
  value,
  children,
}: {
  value: ContactConfig;
  children: ReactNode;
}) {
  return (
    <ContactConfigContext.Provider value={value}>{children}</ContactConfigContext.Provider>
  );
}

export function useContactConfig(): ContactConfig {
  return useContext(ContactConfigContext) ?? fallback;
}
