import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_NAME } from "@/lib/constants";
import { PromoQrPageClient } from "./promo-qr-page-client";

/** Страница только для перехода по QR с баннеров — не в меню и поиске; индексация отключена. */
export const metadata: Metadata = {
  title: `Акция по QR — расчёт и подарок по услуге | ${SITE_NAME}`,
  description:
    "Специальная страница для гостей баннера: выберите услугу по акции и отправьте ориентировочный расчёт дома.",
  robots: { index: false, follow: true },
};

export default function PromoQrPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] pt-28 text-center text-sm text-white/40">Загрузка…</div>}>
      <PromoQrPageClient />
    </Suspense>
  );
}
