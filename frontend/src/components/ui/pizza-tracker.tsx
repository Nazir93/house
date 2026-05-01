"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Clock, Pizza, CheckCircle2 } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

const PIZZA_SPIN_WEBP = "/images/offer/pizza-spin.webp";
const PIZZA_SPIN_PNG = "/images/offer/pizza-spin.png";

const pizzaCommentSchema = z.object({
  comment: z.string().min(2, "Напишите пожелание").max(500),
});
type PizzaComment = z.infer<typeof pizzaCommentSchema>;

/* ───── Spinning Asset ───── */

export function SpinningPizzaAsset({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [broken, setBroken] = useState(false);
  const box =
    size === "sm"
      ? "h-[5.5rem] w-[5.5rem] sm:h-28 sm:w-28"
      : size === "lg"
        ? "h-44 w-44 sm:h-52 sm:w-52"
        : "h-36 w-36 sm:h-40 sm:w-40";

  const inner = broken ? (
    <Pizza
      size={size === "lg" ? 112 : size === "sm" ? 72 : 88}
      strokeWidth={2}
      className="animate-[spin_22s_linear_infinite] select-none"
      style={{ color: "var(--accent)", filter: "drop-shadow(0 0 18px rgba(15,61,46,0.85))" }}
    />
  ) : (
    <picture className="flex h-full w-full items-center justify-center">
      <source srcSet={PIZZA_SPIN_WEBP} type="image/webp" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PIZZA_SPIN_PNG}
        alt=""
        width={480}
        height={480}
        className="max-h-full max-w-full object-contain animate-[spin_22s_linear_infinite] select-none"
        style={{
          filter: "drop-shadow(0 0 14px rgba(15,61,46,0.55)) drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
        }}
        onError={() => setBroken(true)}
      />
    </picture>
  );

  return (
    <div
      className={`relative z-20 flex shrink-0 items-center justify-center overflow-hidden rounded-full ${box}`}
      style={{
        backgroundColor: "var(--bg)",
        boxShadow: "0 0 0 2px rgba(15,61,46,0.45)",
      }}
    >
      <div className="flex h-full w-full items-center justify-center">{inner}</div>
    </div>
  );
}

/* ───── Timer Section ───── */

export function TimerSection({ seconds }: { seconds: number }) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (
    <div className="flex min-h-0 w-full flex-col items-stretch justify-center gap-4 py-2 md:flex-row md:items-center md:gap-6">
      <div className="flex shrink-0 justify-center md:w-[140px]">
        <SpinningPizzaAsset size="md" />
      </div>

      <div className="min-w-0 flex-1 text-center md:text-left">
        <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(15,61,46,0.15)" }}
          >
            <CheckCircle2 size={24} strokeWidth={2} style={{ color: "var(--accent)" }} />
          </div>
          <h2 className="font-heading text-lg sm:text-xl md:text-2xl" style={{ color: "var(--text)" }}>
            Заявка принята!
          </h2>
        </div>

        <p className="mb-4 text-xs leading-snug sm:text-sm" style={{ color: "var(--text-muted)" }}>
          Наш специалист свяжется с вами в течение 5 минут.
        </p>

        <div
          className="mb-4 inline-flex w-full flex-col items-center rounded-2xl border px-6 py-4 sm:inline-flex sm:max-w-none md:items-start"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-subtle)" }}>
            Осталось
          </p>
          <div
            className="font-heading text-4xl tabular-nums tracking-wider sm:text-5xl"
            style={{ color: "var(--accent)" }}
          >
            {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>
            <Clock size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
            Ожидание
          </span>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>
            <Pizza size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
            Бонус
          </span>
        </div>

        <p className="mt-3 text-[11px] leading-snug sm:text-xs" style={{ color: "var(--text-muted)" }}>
          Не дозвонимся за 5 минут — {SITE_NAME} пришлёт пиццу на выбор. Дальше откроется форма пожеланий на этом же экране.
        </p>
      </div>
    </div>
  );
}

/* ───── Pizza Section ───── */

export function PizzaSection({
  leadId,
  contactName,
  contactPhone,
}: {
  leadId: string | null;
  contactName: string;
  contactPhone: string;
}) {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PizzaComment>({ resolver: zodResolver(pizzaCommentSchema) });

  const onSubmit = async (data: PizzaComment) => {
    setSubmitError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contactName.trim() || "Оффер",
        phone: contactPhone,
        service: "Пицца: пожелание",
        source: "offer-pizza",
        calcData: {
          kind: "offer-pizza",
          comment: data.comment,
          previousLeadId: leadId ?? undefined,
        },
      }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setSubmitError(json.error || "Не удалось отправить. Попробуйте ещё раз.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="grid min-h-0 w-full max-h-[min(78dvh,640px)] flex-1 grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch md:gap-4">
      <div
        className="relative flex min-h-[160px] flex-col justify-center overflow-hidden rounded-2xl border p-4 md:min-h-0"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card-bg)",
          backgroundImage: "radial-gradient(ellipse 90% 70% at 50% 30%, rgba(15,61,46,0.08), transparent 55%)",
        }}
      >
        <div className="relative z-10 flex flex-col items-center gap-3 text-center md:py-2">
          <SpinningPizzaAsset size="lg" />
          <div>
            <h2 className="font-heading text-base sm:text-lg" style={{ color: "var(--accent)" }}>
              Пицца в подарок!
            </h2>
            <p className="mt-1 text-[11px] leading-snug sm:text-xs" style={{ color: "var(--text-muted)" }}>
              {SITE_NAME} — на ваш выбор. Форма пожеланий рядом.
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col justify-center rounded-2xl border p-4 sm:p-5"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
      >
        <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>
          <Pizza size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
          Пожелание
        </p>
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-3 text-center">
            <SpinningPizzaAsset size="lg" />
            <CheckCircle2 size={32} strokeWidth={2} style={{ color: "var(--accent)" }} />
            <p className="text-sm font-heading leading-snug" style={{ color: "var(--text)" }}>
              Отправлено! Ждите звонок и пиццу.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <textarea
              rows={3}
              placeholder="Какую пиццу любите? Маргарита, пепперони..."
              className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              {...register("comment")}
            />
            {errors.comment && <p className="text-xs text-red-400">{errors.comment.message}</p>}
            {submitError && <p className="text-xs text-red-400">{submitError}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-heading text-xs uppercase tracking-[0.1em] transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <Pizza size={16} strokeWidth={2} />
              {isSubmitting ? "Отправка..." : "Отправить пожелание"}
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ───── Hook: timer logic ───── */

export function usePizzaTimer() {
  const [timerSec, setTimerSec] = useState(300);
  const [stage, setStage] = useState<"timer" | "pizza">("timer");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setTimerSec(300);
    setStage("timer");
    timerRef.current = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStage("pizza");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  return { timerSec, stage, start };
}
