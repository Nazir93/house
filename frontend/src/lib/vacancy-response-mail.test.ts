import { describe, expect, it } from "vitest";

import {
  VACANCY_RESPONSE_EMAIL,
  formatVacancyResponseEmailSubject,
  formatVacancyResponseEmailText,
} from "./vacancy-response-mail";

describe("vacancy-response-mail", () => {
  it("VACANCY_RESPONSE_EMAIL — фиксированный адрес HR", () => {
    expect(VACANCY_RESPONSE_EMAIL).toBe("info@chastdushi.ru");
  });

  it("formatVacancyResponseEmailSubject — название вакансии", () => {
    expect(formatVacancyResponseEmailSubject("Прораб")).toBe("Отклик на вакансию: Прораб");
  });

  it("formatVacancyResponseEmailText — все поля отклика", () => {
    const text = formatVacancyResponseEmailText({
      position: "Инженер ПТО",
      name: "Анна",
      phone: "+7 999 000-00-00",
      email: "anna@example.com",
      resume: "https://example.com/cv.pdf",
      message: "Готова выйти через 2 недели",
      pageUrl: "https://chastdushi.ru/partners/vacancies",
    });

    expect(text).toContain("Вакансия: Инженер ПТО");
    expect(text).toContain("Email: anna@example.com");
    expect(text).toContain("Резюме: https://example.com/cv.pdf");
    expect(text).toContain("Комментарий: Готова выйти через 2 недели");
  });

  it("formatVacancyResponseEmailText — без необязательных полей", () => {
    const text = formatVacancyResponseEmailText({
      position: "Мастер",
      name: "Иван",
      phone: "+7 999 111-22-33",
    });

    expect(text).not.toContain("Email:");
    expect(text).not.toContain("Резюме:");
    expect(text).not.toContain("Комментарий:");
  });
});
