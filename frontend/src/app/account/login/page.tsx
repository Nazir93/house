import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { AccountLoginExperience } from "@/components/account/account-login-experience";
import { safeAccountCallbackUrl } from "@/lib/safe-account-callback-url";

export const metadata: Metadata = {
  title: "Вход в личный кабинет",
  description: `Вход для клиентов ${SITE_NAME}.`,
  robots: { index: false, follow: true },
};

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = safeAccountCallbackUrl(sp?.callbackUrl);
  return <AccountLoginExperience callbackUrl={callbackUrl} />;
}
