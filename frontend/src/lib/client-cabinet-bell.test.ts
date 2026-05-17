import { describe, expect, it } from "vitest";
import { CLIENT_CABINET_NOTIFICATIONS_HREF } from "./client-cabinet-bell";

describe("client-cabinet-bell", () => {
  it("звоночек открывает центр уведомлений", () => {
    expect(CLIENT_CABINET_NOTIFICATIONS_HREF).toBe("/account/notifications");
  });
});
