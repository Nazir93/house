"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import {
  METRIKA_GOALS,
  collectCurrentTrafficParams,
  trackLeadSuccess,
  trackMetrikaGoal,
} from "@/lib/analytics-goals";
import {
  LP_BUDGET_OPTIONS,
  LP_MORTGAGE_OPTIONS,
  budgetLabelById,
  mortgageLabelById,
} from "@/lib/advertising-landing";
import { readLeadError } from "@/lib/read-lead-error";
import { WALL_MATERIAL_LABELS, type WallMaterialId } from "@/lib/house-construction-calculator";
import { cn } from "@/lib/utils";

const LP_AREA_OPTIONS = [
  { id: "80-100", label: "80–100 м²" },
  { id: "100-130", label: "100–130 м²" },
  { id: "130-160", label: "130–160 м²" },
  { id: "160-200", label: "160–200 м²" },
  { id: "200-plus", label: "От 200 м²" },
  { id: "unknown", label: "Пока не определился" },
] as const;

const LP_FLOOR_OPTIONS = [
  { id: "1", label: "1 этаж" },
  { id: "1.5", label: "1,5 этажа (мансарда)" },
  { id: "2", label: "2 этажа" },
] as const;

const WALL_OPTIONS = (["gas", "brick", "ceramic"] as WallMaterialId[]).map((id) => ({
  id,
  label: WALL_MATERIAL_LABELS[id],
}));

const STEPS = [
  { id: "material", title: "Материал стен" },
  { id: "area", title: "Площадь дома" },
  { id: "floors", title: "Этажность" },
  { id: "budget", title: "Ориентир по бюджету" },
  { id: "mortgage", title: "Ипотека" },
  { id: "contact", title: "Контакты" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function areaLabelById(id: string): string {
  return LP_AREA_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

function floorLabelById(id: string): string {
  return LP_FLOOR_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-2xl px-4 py-3 text-left text-sm font-semibold shadow-sm transition",
              active && "ring-2 ring-[var(--accent)]/40",
            )}
            style={{
              backgroundColor: active
                ? "color-mix(in srgb, var(--accent) 14%, var(--bg))"
                : "var(--bg-secondary)",
              color: "var(--text)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AdvertisingLandingQuiz({
  leadSource,
  serviceLabel,
  initialWallMaterial,
  onSuccess,
}: {
  leadSource: string;
  serviceLabel: string;
  initialWallMaterial?: WallMaterialId;
  onSuccess: (name: string) => void;
}) {
  const getSmartCaptchaToken = useSmartCaptchaToken();
  const quizStarted = useRef(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [wallMaterial, setWallMaterial] = useState<WallMaterialId>(initialWallMaterial ?? "gas");
  const [area, setArea] = useState("");
  const [floors, setFloors] = useState("");
  const [budget, setBudget] = useState("");
  const [mortgage, setMortgage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function markQuizStart() {
    if (quizStarted.current) return;
    quizStarted.current = true;
    trackMetrikaGoal(METRIKA_GOALS.quizStart, { source: leadSource });
  }

  function canProceed(): boolean {
    switch (step.id) {
      case "material":
        return Boolean(wallMaterial);
      case "area":
        return Boolean(area);
      case "floors":
        return Boolean(floors);
      case "budget":
        return Boolean(budget);
      case "mortgage":
        return Boolean(mortgage);
      case "contact":
        return name.trim().length >= 2 && phone.trim().length >= 10 && privacy;
      default:
        return false;
    }
  }

  function goNext() {
    if (!canProceed()) return;
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (honeypot || !canProceed()) return;

    setSubmitting(true);
    setStatus("Отправляем...");
    const recaptchaToken = await getSmartCaptchaToken();
    const trafficParams = collectCurrentTrafficParams();
    const calcData = {
      kind: "advertising-lp-quiz",
      wallMaterial,
      wallMaterialLabel: WALL_MATERIAL_LABELS[wallMaterial],
      area,
      areaLabel: areaLabelById(area),
      catalogFloor: floors,
      floorLabel: floorLabelById(floors),
      budget,
      budgetLabel: budgetLabelById(budget),
      mortgage,
      mortgageLabel: mortgageLabelById(mortgage),
    };

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        service: serviceLabel,
        source: leadSource,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        calcData,
        honeypot,
        recaptchaToken: recaptchaToken || undefined,
        ...trafficParams,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.redirectUrl) {
        trackLeadSuccess(leadSource, {
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          budget,
          mortgage,
        });
        window.location.href = data.redirectUrl;
        return;
      }
    }

    setSubmitting(false);
    setStatus(await readLeadError(res));
  }

  return (
    <div className="rounded-[1.75rem] bg-[var(--bg)] p-5 shadow-[0_18px_48px_rgba(15,61,46,0.07)] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent)" }}>
            Шаг {stepIndex + 1} из {STEPS.length}
          </p>
          <h3 className="mt-1 font-heading text-xl font-bold">{step.title}</h3>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "var(--bg-secondary)" }}>
          {progress}%
        </span>
      </div>

      <div
        className="mb-6 h-1.5 overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--bg-secondary)" }}
        aria-hidden
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }}
        />
      </div>

      <form onSubmit={submit} className="grid gap-5">
        {step.id === "material" && (
          <ChoiceGrid
            options={WALL_OPTIONS}
            value={wallMaterial}
            onChange={(id) => {
              markQuizStart();
              setWallMaterial(id as WallMaterialId);
            }}
          />
        )}

        {step.id === "area" && (
          <ChoiceGrid
            options={[...LP_AREA_OPTIONS]}
            value={area}
            onChange={(id) => {
              markQuizStart();
              setArea(id);
            }}
          />
        )}

        {step.id === "floors" && (
          <ChoiceGrid
            options={[...LP_FLOOR_OPTIONS]}
            value={floors}
            onChange={(id) => {
              markQuizStart();
              setFloors(id);
            }}
          />
        )}

        {step.id === "budget" && (
          <ChoiceGrid
            options={[...LP_BUDGET_OPTIONS]}
            value={budget}
            onChange={(id) => {
              markQuizStart();
              setBudget(id);
            }}
          />
        )}

        {step.id === "mortgage" && (
          <ChoiceGrid
            options={[...LP_MORTGAGE_OPTIONS]}
            value={mortgage}
            onChange={(id) => {
              markQuizStart();
              setMortgage(id);
            }}
          />
        )}

        {step.id === "contact" && (
          <div className="grid gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ваше имя"
              className="rounded-2xl px-4 py-3 text-base shadow-inner outline-none ring-0 transition focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              placeholder="Телефон"
              className="rounded-2xl px-4 py-3 text-base shadow-inner outline-none ring-0 transition focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}
            />
            <label className="flex items-start gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="mt-1"
                required
              />
              <span>Согласен на обработку персональных данных и получение консультации</span>
            </label>
            <input
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
            />
          </div>
        )}

        {status && (
          <p className="text-sm font-medium" style={{ color: "var(--accent)" }} role="status">
            {status}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--bg-secondary)] px-5 text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Назад
            </button>
          ) : (
            <span />
          )}

          {step.id === "contact" ? (
            <button
              type="submit"
              disabled={!canProceed() || submitting}
              className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold uppercase tracking-[0.06em] disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              Получить расчёт
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold uppercase tracking-[0.06em] disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              Далее
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function AdvertisingLandingQuizSuccess({ name }: { name: string }) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--bg)] p-8 text-center shadow-[0_18px_48px_rgba(15,61,46,0.07)]">
      <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent)]" aria-hidden />
      <h3 className="mt-4 font-heading text-2xl font-bold">Заявка отправлена</h3>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {name}, мы получили параметры дома и свяжемся с вами для уточнения расчёта и следующего шага.
      </p>
    </div>
  );
}
