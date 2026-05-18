import { prisma } from "@/lib/db";
import {
  Inbox,
  FileText,
  Home,
  Images,
  HelpCircle,
  Star,
  ContactRound,
  UserRound,
  Users,
  Briefcase,
  Landmark,
  Globe,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type ContentStats = {
  leads: number;
  newLeads: number;
  posts: number;
  houseProjects: number;
  faqs: number;
  reviews: number;
  teamMembers: number;
  builtObjects: number;
  clientProjects: number;
  partners: number;
  services: number;
  dbConnected: boolean;
};

async function getStats(): Promise<ContentStats> {
  try {
    const [
      leads,
      newLeads,
      posts,
      houseProjects,
      faqs,
      reviews,
      teamMembers,
      builtObjects,
      clientProjects,
      partners,
      services,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.post.count(),
      prisma.houseProject.count(),
      prisma.faq.count(),
      prisma.review.count(),
      prisma.teamMember.count(),
      prisma.builtObject.count(),
      prisma.clientConstructionProject.count(),
      prisma.partner.count(),
      prisma.service.count(),
    ]);
    return {
      leads,
      newLeads,
      posts,
      houseProjects,
      faqs,
      reviews,
      teamMembers,
      builtObjects,
      clientProjects,
      partners,
      services,
      dbConnected: true,
    };
  } catch {
    return {
      leads: 0,
      newLeads: 0,
      posts: 0,
      houseProjects: 0,
      faqs: 0,
      reviews: 0,
      teamMembers: 0,
      builtObjects: 0,
      clientProjects: 0,
      partners: 0,
      services: 0,
      dbConnected: false,
    };
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

function StatCard({
  href,
  label,
  value,
  subValue,
  icon: Icon,
  accent,
  bg,
}: {
  href: string;
  label: string;
  value: number;
  subValue?: string;
  icon: LucideIcon;
  accent: string;
  bg: string;
}) {
  return (
    <Link
      href={href}
      className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="adm-uppercase-label mb-2">{label}</p>
          <p className={`text-3xl font-bold tabular-nums ${accent}`}>
            {value}
            {subValue != null ? (
              <span className="text-sm font-normal adm-faint ml-1">{subValue}</span>
            ) : null}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${bg}`}>
          <Icon size={20} className={accent} />
        </div>
      </div>
      <span className="adm-card-foot">
        Перейти
        <ChevronRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}

function CompactStatCard({
  href,
  label,
  value,
  icon: Icon,
  accent,
  bg,
}: {
  href: string;
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  bg: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200"
    >
      <div className={`p-2 rounded-lg shrink-0 ${bg}`}>
        <Icon size={18} className={accent} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="adm-uppercase-label text-[11px] truncate">{label}</p>
        <p className={`text-xl font-bold tabular-nums ${accent}`}>{value}</p>
      </div>
      <ChevronRight size={16} className="adm-faint shrink-0 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentLeads = await getRecentLeads();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-sm adm-subtle mt-1">Обзор системы управления и быстрый доступ к разделам</p>
        {stats.dbConnected ? (
          <p className="text-xs text-emerald-400/70 mt-2">База данных подключена — счётчики актуальны.</p>
        ) : null}
      </div>

      {!stats.dbConnected && (
        <div className="p-4 rounded-xl bg-[#0F3D2E]/15 border border-[#0F3D2E]/25 text-emerald-300 text-sm space-y-2">
          <p className="font-medium text-white/90">База данных недоступна</p>
          <p className="text-white/50 text-xs leading-relaxed">
            Админка читает данные из PostgreSQL через <code className="bg-white/10 px-1 rounded">DATABASE_URL</code> в{" "}
            <code className="bg-white/10 px-1 rounded">frontend/.env.local</code>.
          </p>
          <ul className="list-disc pl-4 text-xs text-white/60 space-y-1">
            <li>
              Порт <strong className="text-emerald-300">5432</strong> — локальный PostgreSQL; первый раз:{" "}
              <code className="bg-black/30 px-1 rounded">npm run db:push</code>. Проверка:{" "}
              <code className="bg-black/30 px-1 rounded">npm run db:verify</code>.
            </li>
            <li>
              Порт <strong className="text-emerald-300">5433</strong> — туннель к БД на VPS: в <strong>отдельном</strong> терминале{" "}
              <code className="bg-black/30 px-1 rounded whitespace-nowrap">npm run db:tunnel -- -VpsHost &quot;IP&quot;</code>
              , затем перезапустить <code className="bg-black/30 px-1 rounded">npm run dev</code>.
            </li>
          </ul>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="adm-section-title">Главное</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            href="/admin/leads"
            label="Заявки (новые / всего)"
            value={stats.newLeads}
            subValue={`/ ${stats.leads}`}
            icon={Inbox}
            accent="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard
            href="/admin/posts"
            label="Публикации в блоге"
            value={stats.posts}
            icon={FileText}
            accent="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <StatCard
            href="/admin/house-projects"
            label="Типовые проекты домов"
            value={stats.houseProjects}
            icon={Home}
            accent="text-amber-400"
            bg="bg-amber-500/10"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="adm-section-title">Контент сайта</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <CompactStatCard
            href="/admin/built-objects"
            label="Портфолио"
            value={stats.builtObjects}
            icon={Images}
            accent="text-cyan-400"
            bg="bg-cyan-500/10"
          />
          <CompactStatCard
            href="/admin/faq"
            label="Вопросы FAQ"
            value={stats.faqs}
            icon={HelpCircle}
            accent="text-violet-400"
            bg="bg-violet-500/10"
          />
          <CompactStatCard
            href="/admin/reviews"
            label="Отзывы"
            value={stats.reviews}
            icon={Star}
            accent="text-yellow-400"
            bg="bg-yellow-500/10"
          />
          <CompactStatCard
            href="/admin/team"
            label="Команда"
            value={stats.teamMembers}
            icon={ContactRound}
            accent="text-rose-400"
            bg="bg-rose-500/10"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="adm-section-title">Каталог и клиенты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <CompactStatCard
            href="/admin/client-projects"
            label="Личные кабинеты"
            value={stats.clientProjects}
            icon={UserRound}
            accent="text-sky-400"
            bg="bg-sky-500/10"
          />
          <CompactStatCard
            href="/admin/partners"
            label="Партнёры"
            value={stats.partners}
            icon={Users}
            accent="text-indigo-400"
            bg="bg-indigo-500/10"
          />
          <CompactStatCard
            href="/admin/services"
            label="Услуги"
            value={stats.services}
            icon={Briefcase}
            accent="text-teal-400"
            bg="bg-teal-500/10"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
        <p className="adm-uppercase-label font-semibold mb-3">Ещё разделы</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/mortgage"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-white/70 hover:border-[#0F3D2E]/40 hover:text-emerald-300 transition-colors"
          >
            <Landmark size={16} className="opacity-80" />
            Ипотека
          </Link>
          <Link
            href="/admin/seo"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-white/70 hover:border-[#0F3D2E]/40 hover:text-emerald-300 transition-colors"
          >
            <Globe size={16} className="opacity-80" />
            SEO и редиректы
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-white/70 hover:border-[#0F3D2E]/40 hover:text-emerald-300 transition-colors"
          >
            Настройки сайта
          </Link>
        </div>
      </section>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Последние заявки</h2>
          <Link href="/admin/leads" className="text-xs text-emerald-300 hover:text-emerald-300 transition-colors">
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
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden sm:table-cell">
                    Телефон
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden md:table-cell">
                    Источник
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden lg:table-cell">
                    Дата
                  </th>
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
