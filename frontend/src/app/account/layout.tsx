import { SessionProvider } from "@/components/admin/session-provider";

export default function AccountRootLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
