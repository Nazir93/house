import { prisma } from "@/lib/db";
import { Inbox, FileText, Home } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [leads, newLeads, posts, houseProjects] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.post.count(),
      prisma.houseProject.count(),
    ]);
    return { leads, newLeads, posts, houseProjects, dbConnected: true };
  } catch {
    return { leads: 0, newLeads: 0, posts: 0, houseProjects: 0, dbConnected: false };
  }
}

async function getRecentLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch {
    return [];
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "Новая", color: "bg-blue-500/20 text-blue-400" },
  IN_PROGRESS: { label: "В работе", color: "bg-[#0F3D2E]/25 text-emerald-300" },
  DONE: { label: "Завершена", color: "bg-green-500/20 text-green-400" },
  CANCELLED: { label: "Отменена", color: "bg-red-500/20 text-red-400" },
};

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentLeads = await getRecentLeads();

  const cards = [
    {
      label: "Новые заявки",
      value: stats.newLeads,
      total: stats.leads,
      icon: Inbox,
      href: "/admin/leads",
      accent: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Публикации",
      value: stats.posts,
      icon: FileText,
      href: "/admin/posts",
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Проекты домов",
      value: stats.houseProjects,
      icon: Home,
      href: "/admin/house-projects",
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-sm text-white/40 mt-1">Обзор системы управления</p>
      </div>

      {!stats.dbConnected && (
        <div className="p-4 rounded-xl bg-[#0F3D2E]/15 border border-[#0F3D2E]/25 text-emerald-300 text-sm space-y-2">
          <p className="font-medium text-white/90">База данных недоступна</p>
          <p className="text-white/50 text-xs leading-relaxed">
            Админка (заявки, блог, услуги) читает данные из PostgreSQL через <code className="bg-white/10 px-1 rounded">DATABASE_URL</code> в{" "}
            <code className="bg-white/10 px-1 rounded">frontend/.env.local</code>.
          </p>
          <ul className="list-disc pl-4 text-xs text-white/60 space-y-1">
            <li>
              Порт <strong className="text-emerald-300">5432</strong> — локальный PostgreSQL на ПК; пользователь и имя БД должны совпадать с <code className="bg-black/30 px-1 rounded">DATABASE_URL</code>; первый раз:{" "}
              <code className="bg-black/30 px-1 rounded">npm run db:push</code>. Проверка: <code className="bg-black/30 px-1 rounded">npm run db:verify</code>.
            </li>
            <li>
              Порт <strong className="text-emerald-300">5433</strong> — туннель к БД на VPS: в <strong>отдельном</strong> терминале{" "}
              <code className="bg-black/30 px-1 rounded whitespace-nowrap">npm run db:tunnel -- -VpsHost &quot;IP&quot;</code>
              , затем перезапустить <code className="bg-black/30 px-1 rounded">npm run dev</code>.
            </li>
          </ul>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-2">{card.label}</p>
                  <p className={`text-3xl font-bold tabular-nums ${card.accent}`}>
                    {card.value}
                    {"total" in card && card.total !== undefined && (
                      <span className="text-sm font-normal text-white/30 ml-1">/ {card.total}</span>
                    )}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon size={20} className={card.accent} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Последние заявки</h2>
          <Link
            href="/admin/leads"
            className="text-xs text-emerald-300 hover:text-emerald-300 transition-colors"
          >
            Все заявки
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <Inbox size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/40 text-sm">Заявок пока нет</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Имя</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden sm:table-cell">Телефон</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden md:table-cell">Источник</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden lg:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const status = STATUS_LABELS[lead.status] || STATUS_LABELS.NEW;
                  return (
                    <tr key={lead.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <Link href={`/admin/leads/${lead.id}`} className="text-white hover:text-emerald-300 transition-colors">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-white/60 hidden sm:table-cell">{lead.phone}</td>
                      <td className="px-4 py-3 text-white/40 hidden md:table-cell">{lead.source || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 hidden lg:table-cell">
                        {lead.createdAt.toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
