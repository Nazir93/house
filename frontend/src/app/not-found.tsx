import Link from "next/link";
import { NotFoundLogger } from "@/components/seo/not-found-logger";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <NotFoundLogger />
      <div className="text-center px-4">
        <h1
          className="font-heading text-[25vw] md:text-[20vw] leading-[0.85] tracking-tighter select-none"
          style={{ color: "var(--text)", opacity: 0.06 }}
        >
          404
        </h1>
        <div className="-mt-16 md:-mt-24 relative z-10">
          <h2
            className="font-heading text-2xl md:text-4xl mb-4"
            style={{ color: "var(--text)" }}
          >
            Страница не найдена
          </h2>
          <p className="text-sm md:text-base mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Возможно, она была перемещена или удалена. Проверьте URL или вернитесь на главную.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
