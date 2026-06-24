import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { revalidatePublicReviews } from "@/lib/revalidate-public-content";
import { isReviewSubmitValid, reviewSubmitSchema } from "@/lib/review-content";
import { checkReviewSubmitRateLimit } from "@/lib/review-rate-limit";
import {
  isSmartCaptchaConfigured,
  requireSmartCaptchaOnProduction,
  smartCaptchaUnavailableResponse,
} from "@/lib/smart-captcha-config";

export const dynamic = "force-dynamic";

async function verifySmartCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.YANDEX_SMARTCAPTCHA_SERVER_KEY?.trim();
  if (!secret) {
    if (requireSmartCaptchaOnProduction()) return false;
    return true;
  }
  if (!token) return false;

  try {
    const verifyRes = await fetch("https://smartcaptcha.yandexcloud.net/validate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, token, ip }).toString(),
    });
    const verify = (await verifyRes.json()) as { status?: string };
    return verify.status === "ok";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!(await checkReviewSubmitRateLimit(ip))) {
      return NextResponse.json(
        { error: "Слишком много попыток. Попробуйте через 15 минут." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();
    const parsed = reviewSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Проверьте поля формы", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.honeypot) {
      return NextResponse.json({ success: true, pending: true });
    }

    if (!isReviewSubmitValid(parsed.data)) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    if (requireSmartCaptchaOnProduction() && !isSmartCaptchaConfigured()) {
      const unavailable = smartCaptchaUnavailableResponse();
      return NextResponse.json({ error: unavailable.error }, { status: unavailable.status });
    }

    const captchaOk = await verifySmartCaptcha(parsed.data.recaptchaToken ?? "", ip);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "Проверка не пройдена. Обновите страницу и попробуйте снова." },
        { status: 400 },
      );
    }

    await prisma.review.create({
      data: {
        authorName: parsed.data.authorName,
        objectName: parsed.data.objectName || null,
        rating: parsed.data.rating,
        text: parsed.data.text,
        visible: false,
        order: 0,
      },
    });

    revalidatePublicReviews();

    return NextResponse.json({
      success: true,
      pending: true,
      message: "Спасибо! Отзыв отправлен на модерацию и появится после проверки.",
    });
  } catch (error) {
    console.error("[REVIEW SUBMIT]", error);
    return NextResponse.json({ error: "Не удалось сохранить отзыв" }, { status: 500 });
  }
}
