import { describe, expect, it } from "vitest";
import {
  documentSignatureSyncWhere,
  documentSignatureSyncWherePublished,
} from "./client-document-signature-sync";

describe("documentSignatureSyncWhere", () => {
  it("связывает копии по url и по filename+order", () => {
    const anchor = { url: "/u/a.pdf", filename: "Договор", order: 2 };
    expect(documentSignatureSyncWhere("proj-1", anchor)).toEqual({
      projectId: "proj-1",
      OR: [{ url: "/u/a.pdf" }, { filename: "Договор", order: 2 }],
    });
    expect(documentSignatureSyncWherePublished("proj-1", anchor)).toMatchObject({
      isDraft: false,
    });
  });
});
