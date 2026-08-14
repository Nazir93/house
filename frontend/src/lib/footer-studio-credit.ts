/**
 * Разметка кредита разработчика в футере:
 * не должна попадать в сниппет выдачи (meta description про компанию).
 */
export function footerStudioCreditSnippetAttrs(): {
  "data-nosnippet": "";
  wrapWithYandexNoindex: true;
  linkRel: "nofollow noopener noreferrer";
} {
  return {
    "data-nosnippet": "",
    wrapWithYandexNoindex: true,
    linkRel: "nofollow noopener noreferrer",
  };
}
