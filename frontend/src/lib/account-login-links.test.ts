import { describe, expect, it } from "vitest";

import { ACCOUNT_LOGIN_CONTACT_HREF } from "@/lib/account-login-links";

describe("account-login-links", () => {
  it("«напишите нам с сайта» ведёт на страницу контактов", () => {
    expect(ACCOUNT_LOGIN_CONTACT_HREF).toBe("/contacts");
  });
});
