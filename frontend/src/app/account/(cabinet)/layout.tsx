import { redirect } from "next/navigation";
import { loadContactConfig } from "@/lib/load-contact-config";
import { AccountShell } from "@/components/account/account-shell";
import { getAccountHeaderSignals } from "@/lib/account-header-signals";
import { getClientProjectIdFromSession } from "@/lib/client-session";

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const [contact, signals] = await Promise.all([
    loadContactConfig(),
    getAccountHeaderSignals(projectId),
  ]);

  return (
    <AccountShell
      supportPhone={contact.phone}
      workingHours={contact.workingHours}
      headerSignals={signals}
    >
      {children}
    </AccountShell>
  );
}
