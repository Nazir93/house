import { PHONE, PHONE2, SITE_URL } from "@/lib/constants";
import {
  formatAuthorProjectTitle,
  formatProposalAmount,
  formatProposalPrintDate,
  proposalSiteHost,
} from "@/lib/proposal/proposal-format";
import { proposalRowLabel } from "@/lib/proposal/proposal-row-labels";
import { PROPOSAL_PACKAGE_LABELS, PROPOSAL_PACKAGE_ORDER, type ProposalDocumentModel } from "@/lib/proposal/types";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function marks(enabled: boolean): string {
  return enabled ? "●" : "—";
}

function renderPageHeader(model: ProposalDocumentModel): string {
  const host = esc(proposalSiteHost(SITE_URL));
  const printDate = esc(formatProposalPrintDate(model.createdAtIso));
  return `<header class="sheet-header">
    <div class="sheet-header__contacts">
      <span>${host}</span>
      <span>${esc(PHONE)}</span>
    </div>
    <div class="sheet-header__right">
      <span>${esc(PHONE2)}</span>
      <span class="sheet-header__date">Дата печати: ${printDate}</span>
    </div>
  </header>`;
}

function renderCoverTitle(model: ProposalDocumentModel): string {
  if (model.kind === "house-project-quote") {
    return esc(formatAuthorProjectTitle(model.title));
  }
  return esc(model.title);
}

function renderSummary(model: ProposalDocumentModel): string {
  return model.summary
    .map((x) => `<span class="summary-item"><span class="summary-label">${esc(x.label)}</span> ${esc(x.value)}</span>`)
    .join("");
}

export function renderProposalHtml(model: ProposalDocumentModel): string {
  const isProjectQuote = model.kind === "house-project-quote";

  const packageHeaderCells = PROPOSAL_PACKAGE_ORDER.map((k, index) => {
    const label = PROPOSAL_PACKAGE_LABELS[k];
    const asterisk = index < 3 ? "*" : "";
    const total = formatProposalAmount(model.packageTotalsRub[k], index > 0);
    return `<th class="pkg-head"><span class="pkg-name">${esc(label)}${asterisk}</span><span class="pkg-total">${esc(total)}</span></th>`;
  }).join("");

  const rowHtml = model.rows
    .map((row) => {
      if (row.rowKind === "section") {
        return `<tr class="section-row"><td colspan="6">${esc(proposalRowLabel(row.label))}</td></tr>`;
      }
      const cells = PROPOSAL_PACKAGE_ORDER.map((k) => `<td class="center">${marks(row.included[k])}</td>`).join("");
      const amountSuffix = row.group !== "shell";
      const label = proposalRowLabel(row.label);
      return `<tr><td class="pos">${esc(label)}</td><td class="amount">${esc(formatProposalAmount(row.amountRub, amountSuffix))}</td>${cells}</tr>`;
    })
    .join("");

  const notesHtml = model.notes.map((n) => `<p>${esc(n)}</p>`).join("");
  const planBlock = model.planImageUrl
    ? `<img src="${esc(model.planImageUrl)}" alt="Планировка"/>`
    : `<div class="no-plan">Планировка будет добавлена менеджером</div>`;

  const clientBlock =
    isProjectQuote
      ? ""
      : `<div class="client-line"><span>Клиент: ${esc(model.leadName)}</span><span>Телефон: ${esc(model.leadPhone)}</span></div>`;

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>КП ${esc(model.title)}</title>
    <style>
      @page { size: A4; margin: 12mm 14mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 11px; line-height: 1.35; margin: 0; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
      .sheet-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 14px; font-size: 10px; color: #333; }
      .sheet-header__contacts, .sheet-header__right { display: flex; flex-direction: column; gap: 2px; }
      .sheet-header__right { text-align: right; align-items: flex-end; }
      .sheet-header__date { margin-top: 4px; color: #444; }
      .project-title { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; margin: 0 0 10px; text-transform: none; }
      .summary-line { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-bottom: 12px; font-size: 11px; }
      .summary-item { white-space: nowrap; }
      .summary-label { color: #333; }
      .client-line { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; color: #444; font-size: 10px; }
      .plan-wrap { margin-top: 6px; }
      .plan { border: 1px solid #ddd; min-height: 360px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 8px; }
      .plan img { max-width: 100%; max-height: 520px; object-fit: contain; }
      .no-plan { color: #777; padding: 24px; text-align: center; }
      .plan-caption { text-align: center; font-size: 10px; letter-spacing: 0.18em; margin: 8px 0 0; color: #333; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th, td { border: 1px solid #cfcfcf; padding: 4px 5px; vertical-align: middle; }
      th { background: #f5f5f5; font-weight: 700; font-size: 10px; }
      th.pkg-head { text-align: center; width: 12%; }
      .pkg-name { display: block; font-size: 9px; line-height: 1.25; margin-bottom: 3px; }
      .pkg-total { display: block; font-size: 10px; font-weight: 700; white-space: nowrap; }
      td.pos { width: 34%; font-size: 10px; }
      td.amount { width: 14%; white-space: nowrap; text-align: right; font-size: 10px; }
      td.center { text-align: center; font-size: 13px; width: 12%; }
      .section-row td { background: #fafafa; font-weight: 700; font-size: 10px; border-top: 2px solid #bbb; text-transform: none; letter-spacing: normal; }
      .notes { margin-top: 10px; color: #555; font-size: 10px; }
      thead tr:first-child th:first-child { text-align: left; width: 34%; }
      thead .options-head { font-size: 12px; vertical-align: bottom; padding-bottom: 6px; }
    </style>
  </head>
  <body>
    <section class="page">
      ${renderPageHeader(model)}
      <h1 class="project-title">${renderCoverTitle(model)}</h1>
      ${clientBlock}
      <div class="summary-line">${renderSummary(model)}</div>
      <div class="plan-wrap">
        <div class="plan">${planBlock}</div>
        <p class="plan-caption">ПЛАНИРОВКА</p>
      </div>
    </section>
    <section>
      ${renderPageHeader(model)}
      <table>
        <thead>
          <tr>
            <th class="options-head" colspan="2">Опции и стоимость</th>
            ${packageHeaderCells}
          </tr>
        </thead>
        <tbody>${rowHtml}</tbody>
      </table>
      <div class="notes">${notesHtml}</div>
    </section>
  </body>
</html>`;
}
