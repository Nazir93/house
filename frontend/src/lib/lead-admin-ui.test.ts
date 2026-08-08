import { describe, expect, it } from "vitest";
import { parseLeadEditableStatus } from "@/lib/lead-admin-ui";

describe("parseLeadEditableStatus", () => {
  it("принимает допустимые статусы", () => {
    expect(parseLeadEditableStatus("NEW")).toBe("NEW");
    expect(parseLeadEditableStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(parseLeadEditableStatus("DONE")).toBe("DONE");
    expect(parseLeadEditableStatus("CANCELLED")).toBe("CANCELLED");
  });

  it("отклоняет фильтр ALL и мусор", () => {
    expect(parseLeadEditableStatus("ALL")).toBeNull();
    expect(parseLeadEditableStatus("")).toBeNull();
    expect(parseLeadEditableStatus(null)).toBeNull();
    expect(parseLeadEditableStatus(1)).toBeNull();
  });
});
