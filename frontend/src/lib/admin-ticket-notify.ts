import { SITE_URL } from "@/lib/constants";
import { previewTicketBody } from "@/lib/admin-ticket-inbox";
import { sendTelegramNotification } from "@/lib/telegram";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function adminTicketsPageUrl(ticketId?: string): string {
  const base = `${SITE_URL.replace(/\/$/, "")}/admin/tickets`;
  return ticketId ? `${base}?ticket=${encodeURIComponent(ticketId)}` : base;
}

export function formatAdminClientTicketTelegramMessage(input: {
  contractNumber: string;
  clientName: string | null;
  subject: string;
  messagePreview: string;
  ticketId: string;
  isNewTicket: boolean;
}): string {
  const who = input.clientName?.trim() || "Клиент";
  const title = input.isNewTicket ? "Новое обращение в ЛК" : "Ответ клиента в ЛК";
  const link = adminTicketsPageUrl(input.ticketId);
  return [
    `<b>${title}</b>`,
    `<b>Договор:</b> ${escapeHtml(input.contractNumber)}`,
    `<b>Клиент:</b> ${escapeHtml(who)}`,
    `<b>Тема:</b> ${escapeHtml(input.subject)}`,
    `<b>Сообщение:</b> ${escapeHtml(previewTicketBody(input.messagePreview, 500))}`,
    `<a href="${link}">Открыть чат в админке</a>`,
  ].join("\n");
}

export async function notifyAdminClientTicketMessage(input: {
  contractNumber: string;
  clientName: string | null;
  subject: string;
  messageBody: string;
  ticketId: string;
  isNewTicket: boolean;
}): Promise<void> {
  const text = formatAdminClientTicketTelegramMessage({
    contractNumber: input.contractNumber,
    clientName: input.clientName,
    subject: input.subject,
    messagePreview: input.messageBody,
    ticketId: input.ticketId,
    isNewTicket: input.isNewTicket,
  });
  await sendTelegramNotification(text);
}
