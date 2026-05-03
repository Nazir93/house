import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SITE_NAME, ACCOUNT_PORTAL_EXTERNAL_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Личный кабинет — ${SITE_NAME}`,
  description: `Вход в личный кабинет клиента ${SITE_NAME}.`,
  robots: { index: false, follow: true },
};

export default async function AccountPage() {
  if (ACCOUNT_PORTAL_EXTERNAL_URL) {
    redirect(ACCOUNT_PORTAL_EXTERNAL_URL);
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.role === "client") {
    redirect("/account/dashboard");
  }

  redirect("/account/login");
}
