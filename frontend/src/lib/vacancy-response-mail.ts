/** Единственный получатель откликов на вакансии (не зависит от NOTIFICATION_EMAIL). */
export const VACANCY_RESPONSE_EMAIL = "info@chastdushi.ru";

export type VacancyResponseMailPayload = {
  position: string;
  name: string;
  phone: string;
  email?: string | null;
  resume?: string | null;
  message?: string | null;
  pageUrl?: string | null;
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

export async function sendVacancyResponseEmail(
  payload: VacancyResponseMailPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[vacancy-response] RESEND_API_KEY is not configured");
    return { ok: false, error: "Почтовый сервис не настроен. Позвоните нам или напишите на info@chastdushi.ru" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const from =
    process.env.VACANCY_RESPONSE_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "Часть души <noreply@chastdushi.ru>";

  const { error } = await resend.emails.send({
    from,
    to: VACANCY_RESPONSE_EMAIL,
    subject: formatVacancyResponseEmailSubject(payload.position),
    text: formatVacancyResponseEmailText(payload),
    replyTo: payload.email?.trim() || undefined,
  });

  if (error) {
    console.error("[vacancy-response] Resend error:", error);
    return { ok: false, error: "Не удалось отправить отклик. Попробуйте позже или напишите на info@chastdushi.ru" };
  }

  return { ok: true };
}
