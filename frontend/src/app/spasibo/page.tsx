import type { Metadata } from "next";
import { Suspense } from "react";
import { ThankYouContent } from "./content";

export const metadata: Metadata = {
  title: "Спасибо за заявку",
  robots: { index: false, follow: false },
};

function ThankYouFallback() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)" }}
    >
      <p className="text-sm">Загрузка…</p>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <ThankYouContent />
    </Suspense>
  );
}
