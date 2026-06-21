import nodemailer from "nodemailer";

/** Единственный получатель откликов на вакансии (не зависит от NOTIFICATION_EMAIL). */
export const VACANCY_RESPONSE_EMAIL = "info@chastdushi.ru";

/** SMTP по умолчанию — Яндекс 360 / Почта для домена (инфраструктура в РФ). */
export const DEFAULT_VACANCY_SMTP_HOST = "smtp.yandex.ru";
export const DEFAULT_VACANCY_SMTP_PORT = 465;

export type VacancyResponseMailPayload = {
  position: string;
  name: string;
  phone: string;
  email?: string | null;
  resume?: string | null;
  message?: string | null;
  pageUrl?: string | null;
};

export type VacancySmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function formatVacancyResponseEmailText(payload: VacancyResponseMailPayload): string {
  const lines = [
    "Отклик на вакансию",
    "",
    `Вакансия: ${payload.position}`,
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
  ];
  if (payload.email?.trim()) lines.push(`Email: ${payload.email.trim()}`);
  if (payload.resume?.trim()) lines.push(`Резюме: ${payload.resume.trim()}`);
  if (payload.message?.trim()) lines.push(`Комментарий: ${payload.message.trim()}`);
  if (payload.pageUrl?.trim()) lines.push(`Страница: ${payload.pageUrl.trim()}`);
  return lines.join("\n");
}

export function formatVacancyResponseEmailSubject(position: string): string {
  const title = position.trim() || "Без названия";
  return `Отклик на вакансию: ${title}`;
}

/** Настройки SMTP для откликов (без Resend — только российский почтовый сервер). */
export function resolveVacancySmtpConfig(
  env: Pick<NodeJS.ProcessEnv, string> = process.env,
): VacancySmtpConfig | null {
  const user = env.VACANCY_SMTP_USER?.trim();
  const pass = env.VACANCY_SMTP_PASS?.trim();
  if (!user || !pass) return null;

  const host = env.VACANCY_SMTP_HOST?.trim() || DEFAULT_VACANCY_SMTP_HOST;
  const portRaw = env.VACANCY_SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : DEFAULT_VACANCY_SMTP_PORT;
  if (!Number.isFinite(port) || port <= 0) return null;

  const secure =
    env.VACANCY_SMTP_SECURE?.trim() === "1" ||
    (env.VACANCY_SMTP_SECURE?.trim() !== "0" && port === 465);
  const from = env.VACANCY_RESPONSE_FROM?.trim() || `Часть души <${user}>`;

  return { host, port, secure, user, pass, from };
}

export async function sendVacancyResponseEmail(
  payload: VacancyResponseMailPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const smtp = resolveVacancySmtpConfig();
  if (!smtp) {
    console.error("[vacancy-response] VACANCY_SMTP_USER / VACANCY_SMTP_PASS not configured");
    return {
      ok: false,
      error: "Почта не настроена. Позвоните нам или напишите на info@chastdushi.ru",
    };
  }

  try {
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });

    await transport.sendMail({
      from: smtp.from,
      to: VACANCY_RESPONSE_EMAIL,
      subject: formatVacancyResponseEmailSubject(payload.position),
      text: formatVacancyResponseEmailText(payload),
      replyTo: payload.email?.trim() || undefined,
    });

    return { ok: true };
  } catch (error) {
    console.error("[vacancy-response] SMTP error:", error);
    return {
      ok: false,
      error: "Не удалось отправить отклик. Попробуйте позже или напишите на info@chastdushi.ru",
    };
  }
}
