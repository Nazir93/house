import { Suspense } from "react";
import { AdminTicketsChat } from "@/components/admin/admin-tickets-chat";

export const metadata = {
  title: "Чат с клиентами",
  robots: { index: false, follow: false },
};

export default function AdminTicketsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Чат с клиентами</h1>
        <p className="mt-1 text-sm text-white/45">
          Переписка из личного кабинета. Новые сообщения — в Telegram и красном бейдже в меню.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/10 p-12 text-center text-sm text-white/35">
            Загрузка чата…
          </div>
        }
      >
        <AdminTicketsChat />
      </Suspense>
    </div>
  );
}
