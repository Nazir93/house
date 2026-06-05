import { prisma } from "@/lib/db";
import { engineeringSelectedHumanLabels, resolveFacadeFinishLabel } from "@/lib/house-construction-calc-display";

function getTelegramChatIdsFromEnv(): string[] {
  const multi = process.env.TELEGRAM_CHAT_IDS?.trim();
  if (multi) {
    return multi
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const single = process.env.TELEGRAM_CHAT_ID?.trim();
  return single ? [single] : [];
}

function getMessageThreadIdFromEnv(): number | undefined {
  const t = process.env.TELEGRAM_MESSAGE_THREAD_ID?.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/** Env имеет приоритет; если чего-то не хватает — подставляем из SiteSettings (админка → Telegram-уведомления). */
async function resolveTelegramConfig(): Promise<{
  botToken: string | null;
  chatIds: string[];
  threadId?: number;
}> {
  let botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
  let chatIds = getTelegramChatIdsFromEnv();
  let threadId = getMessageThreadIdFromEnv();

  const needDb = !botToken || chatIds.length === 0;
  if (needDb) {
    try {
      const rows = await prisma.siteSettings.findMany({
        where: {
          key: {
            in: [
              "telegram_bot_token",
              "telegram_chat_id",
              "telegram_chat_ids",
              "telegram_message_thread_id",
            ],
          },
        },
      });
      const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      if (!botToken && m.telegram_bot_token?.trim()) {
        botToken = m.telegram_bot_token.trim();
      }
      if (chatIds.length === 0) {
        const multi = m.telegram_chat_ids?.trim();
        if (multi) {
          chatIds = multi
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (m.telegram_chat_id?.trim()) {
          chatIds = [m.telegram_chat_id.trim()];
        }
      }
      if (threadId === undefined && m.telegram_message_thread_id?.trim()) {
        const n = Number(m.telegram_message_thread_id.trim());
        if (Number.isFinite(n)) threadId = n;
      }
    } catch (e) {
      console.error("[TELEGRAM] Не удалось прочитать настройки из БД:", e);
    }
  }

  return { botToken, chatIds, threadId };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type TelegramApiResult = {
  ok?: boolean;
  description?: string;
  parameters?: { retry_after?: number };
};

async function sendMessageOnce(
  botToken: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; retryAfterMs?: number; description?: string }> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: TelegramApiResult = {};
  try {
    data = (await res.json()) as TelegramApiResult;
  } catch {
    return { ok: false, description: `HTTP ${res.status}, invalid JSON` };
  }

  if (data.ok) return { ok: true };
  const retryAfterSec = data.parameters?.retry_after;
  const retryAfterMs =
    typeof retryAfterSec === "number" && retryAfterSec > 0
      ? Math.min(retryAfterSec * 1000, 60_000)
      : undefined;
  return {
    ok: false,
    description: data.description ?? `HTTP ${res.status}`,
    retryAfterMs: retryAfterMs ?? (res.status >= 500 || res.status === 429 ? 1500 : undefined),
  };
}

/** Отправка во все настроенные чаты (env и/или админка: telegram_bot_token, telegram_chat_id). */
export async function sendTelegramNotification(message: string) {
  const { botToken, chatIds, threadId } = await resolveTelegramConfig();

  if (!botToken || chatIds.length === 0) {
    console.warn(
      "[TELEGRAM] Уведомления пропущены: нет токена или chat id. Проверьте .env (TELEGRAM_*) и/или админку → Настройки → Telegram (ключи telegram_bot_token, telegram_chat_id). Сейчас:",
      { hasToken: Boolean(botToken), chatCount: chatIds.length }
    );
    return;
  }

  const basePayload: Record<string, unknown> = {
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (threadId !== undefined) basePayload.message_thread_id = threadId;

  for (const chatId of chatIds) {
    const payload = { ...basePayload, chat_id: chatId };
    let lastError: string | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await sendMessageOnce(botToken, payload);
        if (r.ok) {
          lastError = undefined;
          break;
        }
        lastError = r.description;
        if (attempt === 0 && r.retryAfterMs != null) {
          await sleep(r.retryAfterMs);
          continue;
        }
        if (attempt === 0) {
          await sleep(1000);
          continue;
        }
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.error("[TELEGRAM] sendMessage error:", error);
        if (attempt === 0) await sleep(1000);
      }
    }

    if (lastError) {
      console.error(`[TELEGRAM] Не удалось отправить в chat_id=${chatId}:`, lastError);
    }
  }
}

type PriceSmetaCalc = {
  kind?: string;
  withVat?: boolean;
  total?: number;
  positionCount?: number;
  lines?: Array<{
    name: string;
    qty: number;
    lineTotal: number;
    sectionTitle?: string;
    unit?: string;
  }>;
};

function normalizeCalcData(raw: unknown): unknown {
  if (raw == null) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

const CALC_SERVICE_LABELS: Record<string, string> = {
  projecting: "Проектирование (АР)",
  foundation: "Фундамент",
  shell: "Стены и коробка дома",
  roofing: "Кровля",
  engineering: "Инженерные сети",
  finishing: "Отделка и фасад",
};

export function formatLeadMessage(lead: {
  name: string;
  phone: string;
  email?: string | null;
  service?: string | null;
  source?: string | null;
  pageUrl?: string | null;
  calcData?: unknown;
}) {
  const lines = [
    `<b>Новая заявка</b>`,
    ``,
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
  ];

  if (lead.email) lines.push(`<b>Email:</b> ${escapeHtml(lead.email)}`);
  if (lead.service) lines.push(`<b>Услуга:</b> ${escapeHtml(lead.service)}`);
  if (lead.source) lines.push(`<b>Источник:</b> ${escapeHtml(lead.source)}`);
  if (lead.pageUrl) lines.push(`<b>Страница:</b> ${lead.pageUrl}`);

  const rawCalc = normalizeCalcData(lead.calcData);
  if (
    rawCalc &&
    typeof rawCalc === "object" &&
    "kind" in rawCalc &&
    ((rawCalc as { kind?: string }).kind === "offer-pizza" ||
      (rawCalc as { kind?: string }).kind === "calculator-pizza") &&
    "comment" in rawCalc &&
    typeof (rawCalc as { comment: unknown }).comment === "string"
  ) {
    const p = rawCalc as { comment: string; previousLeadId?: string; kind?: string };
    const label =
      p.kind === "calculator-pizza" ? "Пожелание по пицце (ориентировочный расчёт)" : "Пожелание по пицце (оффер)";
    lines.push(``, `<b>${label}</b>`);
    lines.push(escapeHtml(p.comment.slice(0, 2000)));
    if (p.previousLeadId) {
      lines.push(`<i>Первая заявка: ${escapeHtml(p.previousLeadId)}</i>`);
    }
  }

  if (
    rawCalc &&
    typeof rawCalc === "object" &&
    "kind" in rawCalc &&
    rawCalc.kind === "partner-feedback" &&
    "message" in rawCalc &&
    typeof (rawCalc as { message: unknown }).message === "string"
  ) {
    const partner = rawCalc as { kind: string; topic?: string; message: string };
    lines.push(``, `<b>Партнёрская заявка</b>`);
    if (partner.topic) lines.push(`<b>Тема:</b> ${escapeHtml(partner.topic)}`);
    lines.push(`<b>Сообщение:</b> ${escapeHtml(partner.message.slice(0, 2000))}`);
  }

  const smeta = rawCalc as PriceSmetaCalc | null | undefined;
  if (smeta?.kind === "price-smeta" && Array.isArray(smeta.lines)) {
    lines.push(``, `<b>Смета (калькулятор прайса)</b>`);
    const nds = smeta.withVat ? "с НДС 22%" : "без НДС";
    lines.push(`<b>Итого:</b> ${(smeta.total ?? 0).toLocaleString("ru-RU")} ₽ (${nds})`);
    lines.push(`<b>Позиций:</b> ${smeta.positionCount ?? smeta.lines.length}`);
    const max = 30;
    smeta.lines.slice(0, max).forEach((row, i) => {
      const title = row.sectionTitle ? `${row.sectionTitle}: ` : "";
      const name = (row.name || "").slice(0, 120);
      const u = row.unit ? ` ${escapeHtml(row.unit)}` : "";
      lines.push(
        `${i + 1}. ${escapeHtml(title)}${escapeHtml(name)} — ${row.qty}${u} → ${(row.lineTotal ?? 0).toLocaleString("ru-RU")} ₽`
      );
    });
    if (smeta.lines.length > max) {
      lines.push(`… и ещё <b>${smeta.lines.length - max}</b> поз. (полный список в админке / БД)`);
    }
  }

  if (
    rawCalc &&
    typeof rawCalc === "object" &&
    "kind" in rawCalc &&
    (rawCalc as { kind?: string }).kind === "design-project-quote"
  ) {
    const q = rawCalc as {
      kind: string;
      area?: number;
      mainDocumentation?: number;
      additionalDocumentation?: number;
      total?: number;
      projectTitle?: string;
      projectSlug?: string;
      extras?: { model3d?: boolean; constructive?: boolean; audit?: boolean; engineering?: boolean };
    };
    lines.push(``, `<b>Калькулятор проектирования</b>`);
    if (q.projectTitle) lines.push(`<b>Проект:</b> ${escapeHtml(q.projectTitle)}`);
    if (q.projectSlug) lines.push(`<b>Slug:</b> ${escapeHtml(q.projectSlug)}`);
    if (typeof q.area === "number") lines.push(`<b>Площадь:</b> ${q.area} м²`);
    lines.push(`<b>Основная док.:</b> ${(q.mainDocumentation ?? 0).toLocaleString("ru-RU")} ₽`);
    lines.push(`<b>Доп. док.:</b> ${(q.additionalDocumentation ?? 0).toLocaleString("ru-RU")} ₽`);
    lines.push(`<b>Итого:</b> ${(q.total ?? 0).toLocaleString("ru-RU")} ₽`);
    if (q.extras) {
      const bits = [
        q.extras.model3d ? "3D" : null,
        q.extras.constructive ? "конструктив" : null,
        q.extras.audit ? "аудит участка" : null,
        q.extras.engineering ? "инженерные системы" : null,
      ].filter(Boolean);
      if (bits.length) lines.push(`<b>Опции:</b> ${escapeHtml(bits.join(", "))}`);
    }
  }

  if (
    rawCalc &&
    typeof rawCalc === "object" &&
    "kind" in rawCalc &&
    (rawCalc as { kind?: string }).kind === "house-construction-quote"
  ) {
    const h = rawCalc as {
      kind: string;
      objectType?: string | null;
      area?: string | null;
      catalogFloorLabel?: string;
      roofLabel?: string;
      wallMaterialLabel?: string;
      engineering?: Partial<Record<string, boolean>>;
      facadeFinish?: string;
      facadeFinishLabel?: string;
      engineeringSelectedLabels?: string[];
      selectionSummaryRu?: string;
      estimate?: number | null;
      quote?: { grandTotalRub?: number | null };
      promoQrBanner?: boolean;
      promoFreeServiceTitle?: string;
    };
    lines.push(``, `<b>Калькулятор строительства (прайс)</b>`);
    if (h.selectionSummaryRu?.trim()) {
      lines.push(
        h.selectionSummaryRu
          .trim()
          .split("\n")
          .map((ln) => escapeHtml(ln))
          .join("<br>")
      );
    } else {
      if (h.objectType?.trim()) lines.push(`<b>Объект:</b> ${escapeHtml(h.objectType.trim())}`);
      if (h.catalogFloorLabel) lines.push(`<b>Этажность:</b> ${escapeHtml(h.catalogFloorLabel)}`);
      if (h.roofLabel) lines.push(`<b>Кровля:</b> ${escapeHtml(h.roofLabel)}`);
      if (h.wallMaterialLabel) lines.push(`<b>Стены:</b> ${escapeHtml(h.wallMaterialLabel)}`);
      if (h.area?.trim()) lines.push(`<b>Площадь:</b> ${escapeHtml(h.area.trim())} м²`);
      const engText =
        Array.isArray(h.engineeringSelectedLabels) && h.engineeringSelectedLabels.length
          ? h.engineeringSelectedLabels.join(", ")
          : engineeringSelectedHumanLabels(h.engineering).join(", ");
      if (engText) lines.push(`<b>Инженерия:</b> ${escapeHtml(engText)}`);
      const facadeHuman = h.facadeFinishLabel?.trim() || resolveFacadeFinishLabel(h.facadeFinish);
      lines.push(`<b>Фасад:</b> ${escapeHtml(facadeHuman)}`);
      const g = h.quote?.grandTotalRub ?? h.estimate;
      if (typeof g === "number" && Number.isFinite(g)) {
        lines.push(`<b>Ориентировочно:</b> ${g.toLocaleString("ru-RU")} ₽`);
      }
    }
  }

  if (lead.source === "calculator" && rawCalc && typeof rawCalc === "object" && !("kind" in rawCalc)) {
    const c = rawCalc as Record<string, unknown>;
    const workMode = typeof c.workMode === "string" ? c.workMode : "";
    const workModeLabel =
      workMode === "rough"
        ? "Черновой этап"
        : workMode === "finish"
          ? "Чистовой этап"
          : workMode === "design"
            ? "Проектирование"
            : workMode || "—";
    const tier = typeof c.tier === "string" ? c.tier : "";
    const tierLabel =
      tier === "econom" ? "Эконом" : tier === "standard" ? "Стандарт" : tier === "premium" ? "Премиум" : tier || "—";
    const objectType = typeof c.objectType === "string" ? c.objectType.trim() : "";
    const area = typeof c.area === "string" ? c.area.trim() : "";
    const rooms = c.rooms != null && String(c.rooms).trim() !== "" ? String(c.rooms) : "";
    const floors = c.floors != null && String(c.floors).trim() !== "" ? String(c.floors) : "";
    const servicesRaw = Array.isArray(c.services) ? c.services : [];
    const serviceLabels = servicesRaw
      .filter((id): id is string => typeof id === "string")
      .map((id) => CALC_SERVICE_LABELS[id] ?? id);
    const estimate = typeof c.estimate === "number" && Number.isFinite(c.estimate) ? c.estimate : null;
    const withMat = c.withMaterials === true;

    lines.push(``, `<b>Ориентировочный расчёт (модалка)</b>`);
    lines.push(`<b>Этап:</b> ${escapeHtml(workModeLabel)}`);
    lines.push(`<b>Сегмент:</b> ${escapeHtml(tierLabel)}`);
    if (workMode !== "design") {
      lines.push(`<b>С материалом:</b> ${withMat ? "да" : "нет"}`);
    }
    if (objectType) lines.push(`<b>Тип объекта:</b> ${escapeHtml(objectType)}`);
    if (area) lines.push(`<b>Площадь:</b> ${escapeHtml(area)} м²`);
    if (rooms) lines.push(`<b>Комнаты:</b> ${escapeHtml(rooms)}`);
    if (floors) lines.push(`<b>Этажи:</b> ${escapeHtml(floors)}`);
    if (serviceLabels.length > 0) {
      lines.push(`<b>Услуги:</b> ${escapeHtml(serviceLabels.join(", "))}`);
    }
    if (estimate != null) {
      lines.push(`<b>Ориентировочная сумма:</b> от ${estimate.toLocaleString("ru-RU")} ₽`);
    } else {
      lines.push(`<i>Сумма не считалась (нет площади и/или услуг)</i>`);
    }
  }

  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
