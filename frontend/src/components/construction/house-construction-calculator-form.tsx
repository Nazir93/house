"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CATALOG_FLOOR_LABELS,
  ROOF_LABELS,
  type CatalogFloorId,
  type FacadeFinishId,
  type RoofTypeId,
  type WallMaterialId,
  WALL_MATERIAL_LABELS,
  ENGINEERING_OPTION_LABELS,
  FACADE_FINISH_LABELS,
  computeHouseConstructionQuote,
  defaultEngineeringSelection,
  normalizeEngineeringSelection,
  defaultRoofForFloor,
  facadeAvailable,
  isValidHouseConfiguration,
  validRoofsForFloor,
  type HouseConstructionCalculatorConfig,
} from "@/lib/house-construction-calculator";
import {
  buildHouseConstructionSelectionSummaryRu,
  engineeringSelectedHumanLabels,
  resolveFacadeFinishLabel,
  HOUSE_CONSTRUCTION_ENGINEERING_FIELD_ORDER,
} from "@/lib/house-construction-calc-display";
import { formatRub } from "@/lib/construction-shared";
import { readLeadError } from "@/lib/read-lead-error";
import { useContactConfig } from "@/lib/contact-config-context";
import { useHouseConstructionCalculatorConfig } from "@/lib/use-house-construction-calculator-config";
import {
  resolveLeadTrafficForSubmit,
  trackLeadSuccess,
  trackQuizStart,
} from "@/lib/analytics-goals";
import { FunnelInputField as InputField, FunnelSelect } from "@/components/ui/funnel-ui";

const catalogFloorOptions = (["1", "1.5", "2"] as CatalogFloorId[]).map((id) => ({
  value: id,
  label: CATALOG_FLOOR_LABELS[id],
}));

const wallOptions = (["gas", "ceramic", "brick"] as WallMaterialId[]).map((id) => ({
  value: id,
  label: WALL_MATERIAL_LABELS[id],
}));

const facadeSelectOptions: { value: FacadeFinishId; label: string }[] = [
  { value: "none", label: "Не выбрано" },
  { value: "brick", label: FACADE_FINISH_LABELS.brick },
  { value: "plaster", label: FACADE_FINISH_LABELS.plaster },
  { value: "thermo", label: FACADE_FINISH_LABELS.thermo },
  { value: "brick_insulated", label: FACADE_FINISH_LABELS.brick_insulated },
];

const houseConstructionSchema = z.object({
  objectType: z.string().optional(),
  area: z.string().optional(),
  catalogFloor: z.enum(["1", "1.5", "2"]),
  roof: z.enum(["dual", "triple", "quad", "flat"]),
  wallMaterial: z.enum(["gas", "ceramic", "brick"]),
  engineering: z.object({
    electric: z.boolean(),
    water: z.boolean(),
    sewage: z.boolean(),
    radiators: z.boolean(),
    warmFloor: z.boolean(),
    boiler: z.boolean(),
    bio: z.boolean(),
  }),
  facadeFinish: z.enum(["none", "brick", "plaster", "thermo", "brick_insulated"]),
  name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер"),
  privacy: z.boolean().refine((v) => v === true, { message: "Необходимо согласие" }),
  honeypot: z.string().max(0).optional(),
});

export type HouseConstructionFormData = z.infer<typeof houseConstructionSchema>;

function roofOptionsForFloor(floor: CatalogFloorId, cfg: HouseConstructionCalculatorConfig) {
  return validRoofsForFloor(floor, cfg).map((id) => ({ value: id, label: ROOF_LABELS[id] }));
}

export function buildHouseConstructionCalcPayload(
  data: HouseConstructionFormData,
  areaNum: number,
  config: HouseConstructionCalculatorConfig,
  extras?: { promoFreeServiceTitle?: string | null }
) {
  const engineering = normalizeEngineeringSelection(data.engineering);
  const q = computeHouseConstructionQuote(
    {
      areaM2: areaNum,
      catalogFloor: data.catalogFloor,
      roof: data.roof,
      wall: data.wallMaterial,
      engineering,
      facadeFinish: data.facadeFinish,
    },
    config
  );
  const facadeFinishLabel = resolveFacadeFinishLabel(data.facadeFinish);
  const engineeringSelectedLabels = engineeringSelectedHumanLabels(engineering);
  const engineeringLines = q.engineeringLines.map(({ label, amountRub }) => ({ label, amountRub }));
  const selectionSummaryRu = buildHouseConstructionSelectionSummaryRu({
    objectType: data.objectType?.trim() || null,
    area: data.area?.trim() || null,
    catalogFloorLabel: CATALOG_FLOOR_LABELS[data.catalogFloor],
    roofLabel: ROOF_LABELS[data.roof],
    wallMaterialLabel: WALL_MATERIAL_LABELS[data.wallMaterial],
    facadeFinishLabel,
    engineeringLabels: engineeringSelectedLabels,
    engineeringLines,
    grandTotalRub: q.grandTotalRub,
    promoFreeServiceTitle: extras?.promoFreeServiceTitle ?? null,
  });
  return {
    selectionSummaryRu,
    kind: "house-construction-quote" as const,
    objectType: data.objectType?.trim() || null,
    area: data.area?.trim() || null,
    catalogFloor: data.catalogFloor,
    catalogFloorLabel: CATALOG_FLOOR_LABELS[data.catalogFloor],
    roof: data.roof,
    roofLabel: ROOF_LABELS[data.roof],
    wallMaterial: data.wallMaterial,
    wallMaterialLabel: WALL_MATERIAL_LABELS[data.wallMaterial],
    engineering,
    engineeringSelectedLabels,
    engineeringLines,
    facadeFinish: data.facadeFinish,
    facadeFinishLabel,
    estimate: q.grandTotalRub,
    quote: {
      validConfiguration: q.validConfiguration,
      baseRubPerM2: q.baseRubPerM2,
      baseSubtotalRub: q.baseSubtotalRub,
      smallHouseBaseApplied: q.smallHouseBaseApplied,
      smallHouseBaseExtraRub: q.smallHouseBaseExtraRub,
      baseTotalRub: q.baseTotalRub,
      engineeringLines: q.engineeringLines,
      engineeringSubtotalRub: q.engineeringSubtotalRub,
      smallHouseEngineeringApplied: q.smallHouseEngineeringApplied,
      smallHouseEngineeringExtraRub: q.smallHouseEngineeringExtraRub,
      engineeringTotalRub: q.engineeringTotalRub,
      facadeLines: q.facadeLines,
      facadeTotalRub: q.facadeTotalRub,
      grandTotalRub: q.grandTotalRub,
    },
  };
}

export function HouseConstructionCalculatorForm({
  onSuccess,
  getRecaptchaToken,
  heading = "Ориентировочный расчёт",
  headingEyebrow = "Калькулятор",
  calculatorConfig,
  /** Промо со страницы QR: одна бесплатная услуга попадает в calcData и Lead.service */
  promoFreeService,
  promoServiceRequired,
  leadSourceOverride,
  leadServiceLabelOverride,
  initialWallMaterial,
  submitButtonLabel,
  /** Узкая вёрстка для встраивания (страница промо QR, шаг 2) — без полноэкранной высоты и лишних отступов */
  compactLayout,
  /** Промо QR: без типа объекта и без выбора кровли (кровля подставляется по этажности из прайса) */
  hideObjectType,
  hideRoofSelector,
}: {
  onSuccess: (followupToken: string, name: string, phone: string) => void;
  getRecaptchaToken?: (action: string) => Promise<string>;
  heading?: ReactNode;
  headingEyebrow?: string;
  /** Прайс с сервера; без пропа — загрузка через /api/calculator-config */
  calculatorConfig?: HouseConstructionCalculatorConfig;
  promoFreeService?: { slug: string; title: string } | null;
  promoServiceRequired?: boolean;
  leadSourceOverride?: string;
  leadServiceLabelOverride?: string;
  initialWallMaterial?: WallMaterialId;
  submitButtonLabel?: string;
  compactLayout?: boolean;
  hideObjectType?: boolean;
  hideRoofSelector?: boolean;
}) {
  const { config: configFromHook } = useHouseConstructionCalculatorConfig();
  const config = calculatorConfig ?? configFromHook;
  const contact = useContactConfig();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const form = useForm<HouseConstructionFormData>({
    resolver: zodResolver(houseConstructionSchema),
    defaultValues: {
      objectType: "",
      area: "",
      catalogFloor: "1",
      roof: "dual",
      wallMaterial: initialWallMaterial ?? "gas",
      engineering: defaultEngineeringSelection(),
      facadeFinish: "none",
      name: "",
      phone: "",
      privacy: false,
      honeypot: "",
    },
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = form;
  const catalogFloor = watch("catalogFloor");
  const roof = watch("roof");
  const wallMaterial = watch("wallMaterial");
  const areaStr = watch("area");
  const [
    engElectric,
    engWater,
    engSewage,
    engRadiators,
    engWarmFloor,
    engBoiler,
    engBio,
  ] = useWatch({
    control,
    name: [
      "engineering.electric",
      "engineering.water",
      "engineering.sewage",
      "engineering.radiators",
      "engineering.warmFloor",
      "engineering.boiler",
      "engineering.bio",
    ],
  });
  const facadeFinish = watch("facadeFinish");

  const areaNum = useMemo(() => {
    const n = parseFloat(String(areaStr || "").replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [areaStr]);

  useEffect(() => {
    if (!validRoofsForFloor(catalogFloor, config).includes(roof)) {
      setValue("roof", defaultRoofForFloor(catalogFloor, config));
    }
  }, [catalogFloor, roof, setValue, config]);

  useEffect(() => {
    if (!facadeAvailable({ catalogFloor, roof }) && facadeFinish !== "none") {
      setValue("facadeFinish", "none");
    }
  }, [catalogFloor, roof, facadeFinish, setValue]);

  const engineeringSelection = normalizeEngineeringSelection({
    electric: engElectric,
    water: engWater,
    sewage: engSewage,
    radiators: engRadiators,
    warmFloor: engWarmFloor,
    boiler: engBoiler,
    bio: engBio,
  });

  const quote = computeHouseConstructionQuote(
    {
      areaM2: areaNum,
      catalogFloor,
      roof,
      wall: wallMaterial,
      engineering: engineeringSelection,
      facadeFinish,
    },
    config
  );

  const configOk = isValidHouseConfiguration(catalogFloor, roof, config);
  const showFacade = facadeAvailable({ catalogFloor, roof });

  async function onSubmit(data: HouseConstructionFormData) {
    if (data.honeypot) return;
    if (promoServiceRequired && !promoFreeService?.slug) {
      setSubmitError("Выберите одну услугу в подарок по акции.");
      return;
    }
    setSubmitError(null);
    setLoading(true);
    try {
      const recaptchaToken = getRecaptchaToken ? await getRecaptchaToken("submit") : "";
      const rawAreaSubmit = parseFloat(String(data.area ?? "").replace(",", "."));
      const areaForPayload = Number.isFinite(rawAreaSubmit) && rawAreaSubmit > 0 ? rawAreaSubmit : 0;
      const payload = buildHouseConstructionCalcPayload(data, areaForPayload, config, {
        promoFreeServiceTitle:
          promoFreeService?.slug && promoFreeService.title ? promoFreeService.title : null,
      });
      const calcData =
        promoFreeService?.slug && promoFreeService.title
          ? {
              ...payload,
              promoQrBanner: true,
              promoFreeServiceSlug: promoFreeService.slug,
              promoFreeServiceTitle: promoFreeService.title,
            }
          : payload;
      const source = leadSourceOverride ?? "calculator";
      const traffic = resolveLeadTrafficForSubmit();
      const serviceLine =
        leadServiceLabelOverride ??
        (promoFreeService?.title
          ? `Промо (QR): бесплатно — ${promoFreeService.title}`
          : "Ориентировочный расчёт");
      const calcWithTraffic = {
        ...calcData,
        formType: "calculator",
        traffic: {
          landingUrl: traffic.landingUrl,
          referrer: traffic.referrer,
          formType: "calculator",
        },
      };
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          service: serviceLine,
          source,
          pageUrl: traffic.pageUrl,
          honeypot: data.honeypot || "",
          recaptchaToken: recaptchaToken || undefined,
          utmSource: traffic.utmSource,
          utmMedium: traffic.utmMedium,
          utmCampaign: traffic.utmCampaign,
          utmTerm: traffic.utmTerm,
          utmContent: traffic.utmContent,
          yclid: traffic.yclid,
          calcData: calcWithTraffic,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        await trackLeadSuccess(source, {
          pageUrl: traffic.pageUrl,
          formType: "calculator",
          estimate: calcWithTraffic.quote?.grandTotalRub ?? calcWithTraffic.estimate ?? null,
        });
        form.reset();
        onSuccess(result.followupToken || "", data.name, data.phone);
      } else {
        setSubmitError(await readLeadError(response));
      }
    } catch {
      setSubmitError("Нет связи с сервером. Позвоните нам: " + contact.phone);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        compactLayout
          ? "flex items-start"
          : "min-h-screen flex items-start md:items-center"
      }
    >
      <div
        className={
          compactLayout
            ? "container mx-auto w-full py-6 pt-2 md:py-8"
            : "page-top-offset container mx-auto py-20 md:py-16"
        }
      >
        <div className="max-w-2xl mx-auto">
          <header className={compactLayout ? "mb-4" : "mb-5"}>
            {headingEyebrow ? (
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--accent)" }}
              >
                {headingEyebrow}
              </p>
            ) : null}
            <h2
              className={`font-heading font-bold leading-tight tracking-tight text-[var(--text)] ${
                headingEyebrow ? "mt-1" : ""
              } ${compactLayout ? "text-[1.25rem] sm:text-[1.35rem]" : "text-[1.35rem] sm:text-[1.5rem] md:text-[1.65rem]"}`}
            >
              {heading}
            </h2>
          </header>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onFocusCapture={() => {
              if (quizStarted) return;
              setQuizStarted(true);
              trackQuizStart({ source: leadSourceOverride ?? "calculator" });
            }}
            className="flex flex-col gap-5"
          >
            {!hideObjectType ? (
              <InputField label="Тип объекта (по желанию)">
                <input
                  type="text"
                  placeholder="Например, загородный дом"
                  className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  {...register("objectType")}
                />
              </InputField>
            ) : null}

            <InputField label="Строительная площадь, м²">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Например, 120"
                className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
                {...register("area")}
              />
            </InputField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Этажность">
                <Controller
                  name="catalogFloor"
                  control={control}
                  render={({ field }) => (
                    <FunnelSelect
                      variant="underline"
                      options={catalogFloorOptions}
                      placeholder="Выберите"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </InputField>
              <InputField label="Материал стен">
                <Controller
                  name="wallMaterial"
                  control={control}
                  render={({ field }) => (
                    <FunnelSelect
                      variant="underline"
                      options={wallOptions}
                      placeholder="Выберите"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </InputField>
            </div>

            {!hideRoofSelector ? (
              <InputField label="Тип кровли">
                <Controller
                  name="roof"
                  control={control}
                  render={({ field }) => (
                    <FunnelSelect
                      variant="underline"
                      options={roofOptionsForFloor(catalogFloor, config)}
                      placeholder="Выберите"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </InputField>
            ) : null}

            {!hideRoofSelector && !configOk && (
              <p className="text-sm rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-900 dark:text-amber-100/90">
                Для выбранной этажности такой тип кровли в типовом каталоге не предусмотрен — оставьте заявку, рассчитаем
                индивидуально.
              </p>
            )}

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--text-subtle)" }}>
                Инженерные опции (привязка к площади и этажу)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HOUSE_CONSTRUCTION_ENGINEERING_FIELD_ORDER.map((key) => {
                  const label = ENGINEERING_OPTION_LABELS[key];
                  return (
                    <Controller
                      key={key}
                      name={`engineering.${key}`}
                      control={control}
                      render={({ field }) => {
                        const on = field.value === true;
                        return (
                          <label
                            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300"
                            style={{
                              border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                              backgroundColor: on ? "rgba(15,61,46,0.08)" : "transparent",
                            }}
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-[var(--accent)] shrink-0"
                              checked={on}
                              onChange={(e) => field.onChange(e.target.checked)}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                            <span className="text-sm" style={{ color: on ? "var(--accent)" : "var(--text-muted)" }}>
                              {label}
                            </span>
                          </label>
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {showFacade ? (
              <InputField label="Отделка фасада (прайс для 1 этажа, двух- и трёхскатной кровли)">
                <Controller
                  name="facadeFinish"
                  control={control}
                  render={({ field }) => (
                    <FunnelSelect
                      variant="underline"
                      options={facadeSelectOptions}
                      placeholder="Не выбрано"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </InputField>
            ) : (
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Варианты отделки фасада в прайсе приведены для одноэтажного дома с двух- и трёхскатной кровлей. Для
                других конфигураций стоимость фасада согласуем отдельно.
              </p>
            )}

            {/* Сводка */}
            {(areaNum > 0 || quote.engineeringSubtotalRub > 0) && (
              <div
                className="space-y-3 rounded-2xl border p-5 text-left"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                  Расчёт
                </p>
                {configOk && quote.baseRubPerM2 != null && (
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                    <span className="font-semibold text-[var(--text)]">Тёплый контур: </span>
                    {formatRub(quote.baseRubPerM2)} за м²
                    {quote.baseTotalRub != null && (
                      <>
                        {" → "}
                        <span className="tabular-nums">{formatRub(quote.baseTotalRub)}</span>
                      </>
                    )}
                  </div>
                )}
                {quote.engineeringLines.length > 0 && (
                  <ul className="text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
                    {quote.engineeringLines.map((line) => (
                      <li key={line.id} className="flex justify-between gap-2">
                        <span>{line.label}</span>
                        <span className="tabular-nums shrink-0">{formatRub(line.amountRub)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {quote.facadeTotalRub > 0 && (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Отделка фасада: <span className="tabular-nums font-semibold text-[var(--text)]">{formatRub(quote.facadeTotalRub)}</span>
                  </p>
                )}
                {quote.grandTotalRub != null && quote.grandTotalRub > 0 && (
                  <div className="border-t pt-4 mt-2" style={{ borderColor: "var(--border)" }}>
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--text-muted)" }}>
                      Ориентировочно
                    </p>
                    <p className="font-heading text-2xl sm:text-3xl tabular-nums" style={{ color: "var(--accent)" }}>
                      {formatRub(quote.grandTotalRub)}
                    </p>
                  </div>
                )}
                {areaNum <= 0 && quote.engineeringSubtotalRub === 0 && (
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                    Укажите площадь, чтобы увидеть сумму по коробке и инженерии.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Ваше имя" error={errors.name?.message}>
                <input
                  type="text"
                  placeholder="Иван"
                  className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none"
                  style={{ borderColor: errors.name ? "#ef4444" : "var(--border)", color: "var(--text)" }}
                  {...register("name")}
                />
              </InputField>
              <InputField label="Телефон" error={errors.phone?.message}>
                <input
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  inputMode="tel"
                  autoComplete="tel"
                  className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none"
                  style={{ borderColor: errors.phone ? "#ef4444" : "var(--border)", color: "var(--text)" }}
                  {...register("phone")}
                />
              </InputField>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Controller
                name="privacy"
                control={control}
                render={({ field }) => (
                  <input
                    id="privacy-house-calc"
                    type="checkbox"
                    className="w-4 h-4 accent-[var(--accent)] cursor-pointer relative z-10 shrink-0"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              <label htmlFor="privacy-house-calc" className="cursor-pointer text-xs" style={{ color: "var(--text-muted)" }}>
                Я согласен с{" "}
                <Link href="/privacy" className="underline" onClick={(e) => e.stopPropagation()}>
                  политикой конфиденциальности
                </Link>
                {errors.privacy && <span className="text-red-400 text-[10px] ml-1">*</span>}
              </label>
            </div>
            <p className="text-[10px] -mt-2" style={{ color: "var(--text-subtle)" }}>
              Мы не передаём ваши данные третьим лицам.{" "}
              <Link href="/consent" className="underline hover:text-[var(--accent)] transition-colors" onClick={(e) => e.stopPropagation()}>
                Согласие на обработку ПДн
              </Link>
            </p>
            <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <input tabIndex={-1} autoComplete="off" {...register("honeypot")} />
            </div>
            {submitError && (
              <p className="text-sm text-red-400 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full min-h-[52px] items-center justify-center rounded-full px-6 py-3.5 font-heading text-[13px] font-bold uppercase tracking-[0.1em] transition-all duration-300 hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              {loading ? "Отправка..." : submitButtonLabel ?? "Получить точный расчёт"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
