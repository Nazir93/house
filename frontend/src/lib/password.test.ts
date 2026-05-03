import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("verifyPassword принимает корректный пароль после hashPassword", async () => {
    const hash = await hashPassword("secret-contract-42");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(await verifyPassword("secret-contract-42", hash)).toBe(true);
  });

  it("отклоняет неверный пароль", async () => {
    const hash = await hashPassword("a");
    expect(await verifyPassword("b", hash)).toBe(false);
  });

  it("отклоняет пустой stored и чужой формат", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt:$foo")).toBe(false);
  });

  it("хеши с одним паролем различаются (соль)", async () => {
    const h1 = await hashPassword("same");
    const h2 = await hashPassword("same");
    expect(h1).not.toBe(h2);
    expect(await verifyPassword("same", h1)).toBe(true);
    expect(await verifyPassword("same", h2)).toBe(true);
  });
});
