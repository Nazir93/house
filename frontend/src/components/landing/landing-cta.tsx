"use client";

import { ArrowRight } from "lucide-react";
import { useModal } from "@/lib/modal-context";

export function LandingCTA() {
  const { openModal } = useModal();

  return (
    <section className="py-16 sm:py-20 md:py-28" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto text-center">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl mb-4 sm:mb-6">
          Готовы рассчитать стоимость?
        </h2>
        <p
          className="text-xs sm:text-sm md:text-base mb-8 sm:mb-10 max-w-lg mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Оставьте заявку — инженер свяжется с вами в течение 30 минут для бесплатной консультации
        </p>
        <button
          onClick={openModal}
          className="group inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-4 sm:py-5 font-heading text-base sm:text-xl md:text-2xl transition-all duration-500 relative overflow-hidden"
          style={{ border: "1px solid var(--border)", borderRadius: "60px" }}
        >
          <div
            className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ backgroundColor: "var(--text)" }}
          />
          <span className="relative z-10 transition-colors duration-700 group-hover:text-[var(--bg)]">
            Рассчитать стоимость
          </span>
          <ArrowRight
            size={22}
            className="relative z-10 transition-colors duration-700 group-hover:text-[var(--bg)]"
          />
        </button>
      </div>
    </section>
  );
}
