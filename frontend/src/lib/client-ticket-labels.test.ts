import { describe, expect, it } from "vitest";
import { localizeTicketApiError, ticketAuthorLabel } from "./client-ticket-labels";

describe("client-ticket-labels", () => {
  it("ticketAuthorLabel — личный кабинет", () => {
    expect(ticketAuthorLabel("CLIENT", "cabinet")).toBe("Вы");
    expect(ticketAuthorLabel("STAFF", "cabinet")).toBe("Компания");
  });

  it("ticketAuthorLabel — админка", () => {
    expect(ticketAuthorLabel("CLIENT", "admin")).toBe("Клиент");
    expect(ticketAuthorLabel("STAFF", "admin")).toBe("Компания");
  });

  it("localizeTicketApiError — известные коды API", () => {
    expect(localizeTicketApiError("Ticket closed", "Ошибка")).toBe(
      "Обращение закрыто — новые сообщения не принимаются"
    );
    expect(localizeTicketApiError("subject and message required", "Ошибка")).toBe(
      "Укажите тему и текст сообщения"
    );
  });

  it("localizeTicketApiError — fallback для неизвестного", () => {
    expect(localizeTicketApiError("Something weird", "Не удалось отправить")).toBe(
      "Не удалось отправить"
    );
  });
});
