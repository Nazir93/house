import { NextRequest, NextResponse } from "next/server";
import { leadFormSchema } from "@/lib/schemas";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendTelegramNotification, formatLeadMessage } from "@/lib/telegram";
import { sendBitrixLead } from "@/lib/bitrix";
import { createLeadFollowupToken, verifyLeadFollowupToken } from "@/lib/lead-followup-token";
import { generateLeadProposalPdf } from "@/lib/proposal/proposal-service";
import { sendVacancyResponseEmail } from "@/lib/vacancy-response-mail";

const VACANCY_RESPONSE_SOURCE = "partner-vacancy";

function logLeadDebug(payload: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production" || process.env.LEADS_DEBUG === "1") {
    console.info("[LEAD]", payload);
  }
}

/** Второй шаг оффера: комментарий к пицце без капчи, если previousLeadToken — реальная свежая заявка */
async function verifyOfferPizzaPreviousLead(calcData: unknown): Promise<boolean> {
  let obj: unknown = calcData;
  if (typeof calcData === "string") {
    try {
      obj = JSON.parse(calcData);
    } catch {
      return false;
    }
  }
  if (!obj || typeof obj !== "object") return false;
  const prevToken = (obj as { kind?: string; previousLeadId?: string; previousLeadToken?: string }).previousLeadToken;
  if (!prevToken || typeof prevToken !== "string") return false;
  const leadId = verifyLeadFollowupToken(prevToken);
  if (!leadId) return false;
  const row = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  return Boolean(row);
}

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();
let lastBucketDbCleanup = 0;

function checkMemoryRateLimit(ip: string): boolean {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    RATE_LIMIT_MAP.forEach((val, key) => {
      if (now > val.resetAt) RATE_LIMIT_MAP.delete(key);
    });
  }

  const entry = RATE_LIMIT_MAP.get(ip);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

async function maybeCleanupStaleRateBuckets(now: number) {
  if (now - lastBucketDbCleanup < CLEANUP_INTERVAL) return;
  lastBucketDbCleanup = now;
  const cutoff = new Date(now - 3 * RATE_LIMIT_WINDOW);
  try {
    await prisma.leadIpRateBucket.deleteMany({ where: { bucketStart: { lt: cutoff } } });
  } catch {
    /* ignore — не блокируем заявку */
  }
}

/** Общий лимит между инстансами через PostgreSQL; при ошибке БД — память процесса. */
async function checkLeadRateLimit(ip: string): Promise<boolean> {
  const nowMs = Date.now();
  await maybeCleanupStaleRateBuckets(nowMs);
  const bucketStart = new Date(Math.floor(nowMs / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW);

  try {
    const row = await prisma.leadIpRateBucket.upsert({
      where: {
        ipKey_bucketStart: { ipKey: ip, bucketStart },
      },
      create: { ipKey: ip, bucketStart, count: 1 },
      update: { count: { increment: 1 } },
    });
    return row.count <= RATE_LIMIT_MAX;
  } catch (e) {
    console.error("[LEAD] rate-limit DB unavailable, fallback memory:", e);
    return checkMemoryRateLimit(ip);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!(await checkLeadRateLimit(ip))) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте позже." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = leadFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.honeypot) {
      return NextResponse.json({ success: true, redirectUrl: "/" });
    }

    const smartCaptchaSecret = process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY?.trim();
    const pizzaFollowupOk =
      (parsed.data.source === "offer-pizza" || parsed.data.source === "calculator-pizza") &&
      (await verifyOfferPizzaPreviousLead(parsed.data.calcData));

    if (smartCaptchaSecret && parsed.data.recaptchaToken) {
      try {
        const verifyRes = await fetch("https://smartcaptcha.yandexcloud.net/validate", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: smartCaptchaSecret,
            token: parsed.data.recaptchaToken,
            ip,
          }).toString(),
        });
        const verify = (await verifyRes.json()) as { status?: string };
        if (verify.status !== "ok") {
          return NextResponse.json(
            { error: "Проверка не пройдена. Обновите страницу и попробуйте снова." },
            { status: 400 }
          );
        }
      } catch (e) {
        console.error("[LEAD] SmartCaptcha verify error:", e);
        return NextResponse.json(
          { error: "Ошибка проверки. Попробуйте позже или позвоните нам." },
          { status: 400 }
        );
      }
    } else if (smartCaptchaSecret && !parsed.data.recaptchaToken && !pizzaFollowupOk) {
      return NextResponse.json(
        { error: "Проверка не пройдена. Обновите страницу и попробуйте снова." },
        { status: 400 }
      );
    }

    const token = uuidv4();
    const source = parsed.data.source || "unknown";
    const isVacancyResponse = source === VACANCY_RESPONSE_SOURCE;

    let createdLead: { id: string; name: string; phone: string; email: string | null; calcData: unknown; createdAt: Date };
    try {
      createdLead = await prisma.$transaction(async (tx) => {
        const l = await tx.lead.create({
          data: {
            name: parsed.data.name,
            phone: parsed.data.phone,
            email: parsed.data.email || null,
            service: parsed.data.service || null,
            pageUrl: parsed.data.pageUrl || null,
            source,
            utmSource: parsed.data.utmSource || null,
            utmMedium: parsed.data.utmMedium || null,
            utmCampaign: parsed.data.utmCampaign || null,
            utmTerm: parsed.data.utmTerm || null,
            proposalStatus: "PENDING",
            ...(parsed.data.calcData !== undefined
              ? { calcData: parsed.data.calcData as object }
              : {}),
          },
        });

        await tx.thankYouToken.create({
          data: {
            token,
            leadId: l.id,
            leadName: parsed.data.name,
            source,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });

        return l;
      });
    } catch (dbError) {
      console.error("[LEAD DB ERROR]", dbError);
      return NextResponse.json(
        {
          error:
            "Не удалось сохранить заявку. Проверьте подключение к базе данных на сервере или позвоните нам.",
        },
        { status: 503 }
      );
    }

    if (isVacancyResponse) {
      const calc =
        parsed.data.calcData && typeof parsed.data.calcData === "object"
          ? (parsed.data.calcData as Record<string, unknown>)
          : {};
      const mailResult = await sendVacancyResponseEmail({
        position: typeof calc.position === "string" ? calc.position : parsed.data.service || "Вакансия",
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        resume: typeof calc.resume === "string" ? calc.resume : null,
        message: typeof calc.message === "string" ? calc.message : parsed.data.message,
        pageUrl: parsed.data.pageUrl,
      });
      if (!mailResult.ok) {
        return NextResponse.json({ error: mailResult.error }, { status: 503 });
      }
    } else {
      try {
        await sendTelegramNotification(
          formatLeadMessage({
            name: parsed.data.name,
            phone: parsed.data.phone,
            email: parsed.data.email,
            service: parsed.data.service,
            source,
            pageUrl: parsed.data.pageUrl,
            calcData: parsed.data.calcData,
          }),
        );
      } catch (tgErr) {
        console.error("[leads] Telegram notification failed:", tgErr);
      }

      try {
        await sendBitrixLead({
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          service: parsed.data.service,
          source,
          pageUrl: parsed.data.pageUrl,
          calcData: parsed.data.calcData,
        });
      } catch (bitrixErr) {
        console.error("[leads] Bitrix lead sync failed:", bitrixErr);
      }
    }

    if (!isVacancyResponse) {
      // Генерацию КП не делаем критичной: заявка уже сохранена и обработана.
      void generateLeadProposalPdf({
        id: createdLead.id,
        name: createdLead.name,
        phone: createdLead.phone,
        email: createdLead.email,
        calcData: createdLead.calcData,
        createdAt: createdLead.createdAt,
      }).catch((proposalErr) => {
        console.error("[leads] proposal generation failed:", proposalErr);
      });
    }

    logLeadDebug({
      id: createdLead.id,
      source,
      timestamp: new Date().toISOString(),
    });

    const redirectUrl = `/spasibo?token=${token}&from=${encodeURIComponent(source)}`;
    return NextResponse.json({
      success: true,
      redirectUrl,
      followupToken: createLeadFollowupToken(createdLead.id),
      proposalStatus: "PENDING",
    });
  } catch (error) {
    console.error("[LEAD ERROR]", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
