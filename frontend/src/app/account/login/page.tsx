"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { UserRound } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

function ClientLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account/dashboard";

  const [contractNumber, setContractNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("client-contract", {
      contractNumber: contractNumber.trim(),
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Неверный номер договора или пароль");
      setLoading(false);
    } else if (result?.ok && result.url) {
      window.location.href = result.url;
    } else if (result?.ok) {
      window.location.href = callbackUrl;
    } else {
      setError("Не удалось войти");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-2 p-8 md:p-10"
      style={{
        borderColor: "var(--accent)",
        background: `linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, var(--bg)) 0%, var(--card-bg) 100%)`,
      }}
    >
      {error && (
        <div
          className="mb-4 p-3 rounded-xl text-sm"
          style={{
            background: "color-mix(in srgb, #b91c1c 15%, transparent)",
            border: "1px solid color-mix(in srgb, #b91c1c 35%, transparent)",
            color: "#fecaca",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Номер договора
        </label>
        <input
          type="text"
          autoComplete="username"
          value={contractNumber}
          onChange={(e) => setContractNumber(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 transition"
          style={{
            borderColor: "var(--border)",
            background: "var(--card-bg)",
            color: "var(--text)",
            boxShadow: "focus-within: 0 0 0 2px var(--accent)",
          }}
          placeholder="Например, Д-2025-001"
        />
      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Пароль
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
          style={{
            borderColor: "var(--border)",
            background: "var(--card-bg)",
            color: "var(--text)",
          }}
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] transition disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        {loading ? "Вход…" : "Войти"}
      </button>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="underline underline-offset-2 hover:opacity-90">
          На главную
        </Link>
      </p>
    </form>
  );
}

export default function AccountLoginPage() {
  return (
    <section className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto max-w-lg px-5">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
        >
          <UserRound className="h-8 w-8" strokeWidth={2} aria-hidden />
        </div>
        <h1 className="text-center font-heading text-2xl font-bold tracking-tight md:text-3xl mb-2">Личный кабинет</h1>
        <p className="text-center text-[15px] leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          Вход для клиентов {SITE_NAME}
        </p>
        <Suspense fallback={<div className="text-center text-sm" style={{ color: "var(--text-muted)" }}>Загрузка…</div>}>
          <ClientLoginForm />
        </Suspense>
      </div>
    </section>
  );
}
