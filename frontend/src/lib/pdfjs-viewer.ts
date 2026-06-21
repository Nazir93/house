export const PROJECT_TEMPLATE_PDF_URL = "/proektirovanie/project-template.pdf";

export function clampPdfPage(page: number, totalPages: number): number {
  const max = Math.max(1, totalPages);
  return Math.min(Math.max(page, 1), max);
}

let pdfJsModule: typeof import("pdfjs-dist") | null = null;

/** Один раз настраивает worker pdf.js для клиентского рендера в canvas. */
export async function loadPdfJs() {
  if (pdfJsModule) return pdfJsModule;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  pdfJsModule = pdfjs;
  return pdfjs;
}
