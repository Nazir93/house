"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("admin", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4"
    >
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 focus:ring-1 focus:ring-[#0F3D2E]/25 transition-colors"
          placeholder="admin@dom.ru"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
          Пароль
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 focus:ring-1 focus:ring-[#0F3D2E]/25 transition-colors"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Вход..." : "Войти"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide text-white">
            {SITE_NAME}
          </h1>
          <p className="mt-2 text-sm text-white/40">Админ-панель</p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-white/20 text-sm">Загрузка...</div>}>
          <LoginForm />
        </Suspense>

        <div
          className="mt-5 p-3 rounded-xl border text-[11px] leading-relaxed"
          style={{
            borderColor: "rgba(15, 61, 46, 0.35)",
            backgroundColor: "rgba(15, 61, 46, 0.06)",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <strong className="text-emerald-300">Входили по IP, а по домену не пускает?</strong>
          <br />
          На сервере в окружении процесса Next.js задайте{" "}
          <code className="text-white/90">NEXTAUTH_URL=https://dom.ru</code> (тот же хост, что в браузере, не IP),
          сохраните и перезапустите приложение. В браузере очистите cookie для dom.ru или откройте вход в режиме
          инкогнито.
        </div>

        <p className="mt-6 text-center text-[11px] text-white/25 leading-relaxed">
          Вход настраивается переменными окружения на сервере:{" "}
          <span className="text-white/40">ADMIN_EMAIL</span>,{" "}
          <span className="text-white/40">ADMIN_SECRET</span>,{" "}
          <span className="text-white/40">NEXTAUTH_SECRET</span>,{" "}
          <span className="text-white/40">NEXTAUTH_URL</span> (https://ваш-домен).
        </p>
      </div>
    </div>
  );
}
