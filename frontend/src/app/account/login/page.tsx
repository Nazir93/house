import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { AccountLoginExperience } from "@/components/account/account-login-experience";

export const metadata: Metadata = {
  title: "Вход в личный кабинет",
  description: `Вход для клиентов ${SITE_NAME}.`,
  robots: { index: false, follow: true },
};

export default function AccountLoginPage() {
  return <AccountLoginExperience />;
}
