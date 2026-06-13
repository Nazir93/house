import { formatRub } from "@/lib/construction-shared";
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

export function renderProposalHtml(model: ProposalDocumentModel): string {
  const packageCells = PROPOSAL_PACKAGE_ORDER.map((k) => {
    return `<th>${esc(PROPOSAL_PACKAGE_LABELS[k])}<br><strong>${esc(formatRub(model.packageTotalsRub[k]))}</strong></th>`;
  }).join("");

  const rowHtml = model.rows
    .map((row) => {
      const cells = PROPOSAL_PACKAGE_ORDER.map((k) => `<td class="center">${marks(row.included[k])}</td>`).join("");
      return `<tr><td>${esc(row.label)}</td><td class="amount">${esc(formatRub(row.amountRub))}</td>${cells}</tr>`;
    })
    .join("");

  const summaryHtml = model.summary.map((x) => `<div><span>${esc(x.label)}</span><strong>${esc(x.value)}</strong></div>`).join("");
  const notesHtml = model.notes.map((n) => `<p>${esc(n)}</p>`).join("");
  const date = new Date(model.createdAtIso).toLocaleDateString("ru-RU");
  const planBlock = model.planImageUrl ? `<img src="${esc(model.planImageUrl)}" alt="Планировка"/>` : `<div class="no-plan">Планировка будет добавлена менеджером</div>`;

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>КП ${esc(model.leadName)}</title>
    <style>
      @page { size: A4; margin: 16mm; }
      body { font-family: Arial, sans-serif; color: #1a1a1a; font-size: 12px; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
      h1 { font-size: 20px; margin: 0 0 12px; }
      .meta { display: flex; justify-content: space-between; margin-bottom: 12px; color: #555; }
      .summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 12px 0; }
      .summary div { border: 1px solid #ddd; border-radius: 6px; padding: 8px; display: flex; justify-content: space-between; }
      .plan { border: 1px solid #ddd; border-radius: 8px; min-height: 280px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .plan img { max-width: 100%; max-height: 500px; object-fit: contain; }
      .no-plan { color: #777; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #d9d9d9; padding: 6px; vertical-align: middle; }
      th { background: #f7f7f7; font-size: 11px; }
      .amount { white-space: nowrap; text-align: right; }
      .center { text-align: center; font-size: 14px; }
      .notes { margin-top: 10px; color: #666; font-size: 11px; }
    </style>
  </head>
  <body>
    <section class="page">
      <div class="meta"><span>Коммерческое предложение</span><span>Дата: ${esc(date)}</span></div>
      <h1>${esc(model.title)}</h1>
      <div class="meta"><span>Клиент: ${esc(model.leadName)}</span><span>Телефон: ${esc(model.leadPhone)}</span></div>
      <div class="summary">${summaryHtml}</div>
      <div class="plan">${planBlock}</div>
    </section>
    <section>
      <h1>Опции и стоимость</h1>
      <table>
        <thead>
          <tr>
            <th>Позиция</th>
            <th>Стоимость</th>
            ${packageCells}
          </tr>
        </thead>
        <tbody>${rowHtml}</tbody>
      </table>
      <div class="notes">${notesHtml}</div>
    </section>
  </body>
</html>`;
}

