"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ClientProjectNewForm() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractNumber, setContractNumber] = useState("");
  const [plainPassword, setPlainPassword] = useState("");
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");

  const inp =
    "w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/client-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractNumber: contractNumber.trim(),
          plainPassword,
          title: title.trim(),
          clientName: clientName.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Не создано");
        setLoading(false);
        return;
      }
      router.push(`/admin/client-projects/${data.id}`);
    } catch {
      setErr("Сеть");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/admin/client-projects" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70">
        <ArrowLeft size={16} />
        Назад
      </Link>
      <h1 className="text-2xl font-bold">Новый клиентский объект</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <div>
          <label className="block text-[11px] uppercase text-white/40 mb-1">Номер договора *</label>
          <input className={inp} value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} required />
        </div>
        <div>
          <label className="block text-[11px] uppercase text-white/40 mb-1">Пароль клиента *</label>
          <input type="password" className={inp} value={plainPassword} onChange={(e) => setPlainPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-[11px] uppercase text-white/40 mb-1">Название / адрес *</label>
          <input className={inp} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-[11px] uppercase text-white/40 mb-1">Имя клиента</label>
          <input className={inp} value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#0F3D2E] font-bold text-sm disabled:opacity-50"
        >
          {loading ? "Создание…" : "Создать с типовыми этапами"}
        </button>
      </form>
    </div>
  );
}
