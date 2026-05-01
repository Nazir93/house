import type { Metadata } from "next";
import { Suspense } from "react";
import { ThankYouContent } from "./content";

export const metadata: Metadata = {
  title: "Спасибо за заявку",
  robots: { index: false, follow: false },
};

function ThankYouFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Загрузка...</p>
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
