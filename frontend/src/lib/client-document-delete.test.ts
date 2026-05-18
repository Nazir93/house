import { describe, expect, it } from "vitest";
import {
  documentNotificationMatchesDeletedDoc,
  documentRowMatchesDeleteAnchor,
  filterActiveClientNotifications,
  selectDocumentIdsToDelete,
  selectDocumentNotificationIdsToDelete,
} from "./client-document-delete";

describe("client-document-delete (п. 10 ТЗ)", () => {
  const anchor = { url: "/u/contract.pdf", filename: "Договор", order: 1 };

  it("documentRowMatchesDeleteAnchor — url и filename+order", () => {
    expect(
      documentRowMatchesDeleteAnchor(
        { url: "/u/contract.pdf", filename: "Другое", order: 9 },
        anchor
      )
    ).toBe(true);
    expect(
      documentRowMatchesDeleteAnchor(
        { url: "/u/other.pdf", filename: "Договор", order: 1 },
        anchor
      )
    ).toBe(true);
    expect(
      documentRowMatchesDeleteAnchor(
        { url: "/u/other.pdf", filename: "Договор", order: 2 },
        anchor
      )
    ).toBe(false);
  });

  it("selectDocumentIdsToDelete — черновик и опубликованная копия", () => {
    const ids = selectDocumentIdsToDelete(
      [
        { id: "draft", url: anchor.url, filename: anchor.filename, order: anchor.order },
        { id: "pub", url: anchor.url, filename: anchor.filename, order: anchor.order },
        { id: "other", url: "/x", filename: "Акт", order: 0 },
      ],
      anchor
    );
    expect(ids.sort()).toEqual(["draft", "pub"]);
  });

  it("documentNotificationMatchesDeletedDoc — по url и по filename", () => {
    expect(
      documentNotificationMatchesDeletedDoc(
        { kind: "document", filename: "Договор", url: anchor.url, signingMode: "manual" },
        anchor
      )
    ).toBe(true);
    expect(
      documentNotificationMatchesDeletedDoc(
        { kind: "document", filename: "договор", signingMode: "manual" },
        anchor
      )
    ).toBe(true);
    expect(
      documentNotificationMatchesDeletedDoc(
        { kind: "document", filename: "Акт", signingMode: "manual" },
        anchor
      )
    ).toBe(false);
  });

  it("selectDocumentNotificationIdsToDelete", () => {
    const ids = selectDocumentNotificationIdsToDelete(
      [
        { id: "n1", payload: { kind: "document", filename: "Договор", signingMode: "manual" } },
        { id: "n2", payload: { kind: "payment", label: "x" } },
      ],
      anchor
    );
    expect(ids).toEqual(["n1"]);
  });

  it("filterActiveClientNotifications — без документа в кабинете", () => {
    const out = filterActiveClientNotifications(
      [
        {
          id: "1",
          type: "DOCUMENT_NEW",
          payload: { kind: "document", filename: "Договор", signingMode: "manual" },
        },
        { id: "2", type: "PAYMENT_EXPECTED", payload: { kind: "payment" } },
      ],
      []
    );
    expect(out.map((n) => n.id)).toEqual(["2"]);
  });
});
