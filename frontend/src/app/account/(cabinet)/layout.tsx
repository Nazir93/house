import { loadContactConfig } from "@/lib/load-contact-config";
import { AccountShell } from "@/components/account/account-shell";

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const contact = await loadContactConfig();
  return (
    <AccountShell supportPhone={contact.phone} workingHours={contact.workingHours}>
      {children}
    </AccountShell>
  );
}
