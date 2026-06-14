import { test, expect } from "@playwright/test";
import { expectPublicPage } from "./helpers";

test.describe("Главная", () => {
  test("открывается без ошибки", async ({ page }) => {
    await expectPublicPage(page, "/");
  });
});

test.describe("Портфолио", () => {
  test("/portfolio", async ({ page }) => {
    await expectPublicPage(page, "/portfolio");
  });
  test("/portfolio/map", async ({ page }) => {
    await expectPublicPage(page, "/portfolio/map");
  });
});

test.describe("Каталог типовых проектов", () => {
  test("/projects", async ({ page }) => {
    await expectPublicPage(page, "/projects");
  });
});

test.describe("Услуги", () => {
  test("/services", async ({ page }) => {
    await expectPublicPage(page, "/services");
  });
});

test.describe("Блог", () => {
  test("/blog", async ({ page }) => {
    await expectPublicPage(page, "/blog");
  });
});

test.describe("Контакты", () => {
  test("/contacts", async ({ page }) => {
    await expectPublicPage(page, "/contacts");
  });
});

test.describe("О компании", () => {
  test("/about — контент по ТЗ и без Unsplash", async ({ page }) => {
    await expectPublicPage(page, "/about");
    const html = await page.content();
    expect(html.includes("images.unsplash.com"), "страница не должна тянуть Unsplash").toBe(false);
    await expect(page.getByText("Кузнецова Ольга Олеговна")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ценности" })).toBeVisible();
    await expect(page.getByText("Продуманность")).toBeVisible();
    const portfolioLink = page.getByRole("link", { name: "Как мы строим" });
    await expect(portfolioLink).toBeVisible();
    await expect(portfolioLink).toHaveAttribute("href", "/portfolio");
  });
});

test.describe("Отзывы", () => {
  test("/reviews", async ({ page }) => {
    await expectPublicPage(page, "/reviews");
  });
});

test.describe("Команда", () => {
  test("/team", async ({ page }) => {
    await expectPublicPage(page, "/team");
  });
});

test.describe("Калькулятор", () => {
  test("/calculator", async ({ page }) => {
    await expectPublicPage(page, "/calculator");
  });
});

test.describe("Ипотека", () => {
  test("/mortgage", async ({ page }) => {
    await expectPublicPage(page, "/mortgage");
  });
});

test.describe("Индивидуальное проектирование", () => {
  test("/individual-design", async ({ page }) => {
    await expectPublicPage(page, "/individual-design");
  });
});

test.describe("Технологии", () => {
  test("/technology/materials", async ({ page }) => {
    await expectPublicPage(page, "/technology/materials");
  });
});

test.describe("Партнёры", () => {
  test("/partners/partner", async ({ page }) => {
    await expectPublicPage(page, "/partners/partner");
  });
});

test.describe("Юридические страницы", () => {
  test("/privacy", async ({ page }) => {
    await expectPublicPage(page, "/privacy");
  });
  test("/consent", async ({ page }) => {
    await expectPublicPage(page, "/consent");
  });
});

test.describe("Личный кабинет (редирект на логин)", () => {
  test("/account", async ({ page }) => {
    await expectPublicPage(page, "/account");
  });
});

test.describe("Админка", () => {
  test("/admin/login", async ({ page }) => {
    await expectPublicPage(page, "/admin/login");
  });
});
