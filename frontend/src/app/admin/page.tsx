import { prisma } from "@/lib/db";
import { countTicketsNeedingStaffReply } from "@/lib/admin-ticket-inbox";
import {
  Inbox,
  FileText,
  Home,
  Images,
  HelpCircle,
  Star,
  ContactRound,
  ClipboardList,
  UserRound,
  Users,
  Briefcase,
  Landmark,
  Globe,
  ChevronRight,
  MessageCircle,
  Calculator,
  PanelTop,
  Settings,
  HardHat,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BUILT_HOMES_SECTION_LABEL, UNDER_CONSTRUCTION_HOMES_ADMIN_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

type ContentStats = {
  leads: number;
  newLeads: number;
  pendingTickets: number;
  authorHouseProjects: number;
  typicalHouseProjects: number;
  posts: number;
  faqs: number;
  reviews: number;
  teamMembers: number;
  vacancies: number;
  completedBuiltObjects: number;
  underConstructionObjects: number;
  clientProjects: number;
  partners: number;
  services: number;
  dbConnected: boolean;
};

const EMPTY_STATS: ContentStats = {
  leads: 0,
  newLeads: 0,
  pendingTickets: 0,
  authorHouseProjects: 0,
  typicalHouseProjects: 0,
  posts: 0,
  faqs: 0,
  reviews: 0,
  teamMembers: 0,
  vacancies: 0,
  completedBuiltObjects: 0,
  underConstructionObjects: 0,
  clientProjects: 0,
  partners: 0,
  services: 0,
  dbConnected: false,
};

async function getStats(): Promise<ContentStats> {
  try {
    const [
      leads,
      newLeads,
      tickets,
      authorHouseProjects,
      typicalHouseProjects,
      posts,
      faqs,
      reviews,
      teamMembers,
      vacancies,
      completedBuiltObjects,
      underConstructionObjects,
      clientProjects,
      partners,
      services,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.clientSupportTicket.findMany({
        where: { status: { not: "CLOSED" } },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      }),
      prisma.houseProject.count({ where: { catalogKind: "author" } }),
      prisma.houseProject.count({ where: { catalogKind: "partner" } }),
      prisma.post.count(),
      prisma.faq.count(),
      prisma.review.count(),
      prisma.teamMember.count(),
      prisma.vacancy.count(),
      prisma.builtObject.count({ where: { siteStatus: "COMPLETED", published: true } }),
      prisma.builtObject.count({ where: { siteStatus: "UNDER_CONSTRUCTION", published: true } }),
      prisma.clientConstructionProject.count(),
      prisma.partner.count(),
      prisma.service.count(),
    ]);
    return {
      leads,
      newLeads,
      pendingTickets: countTicketsNeedingStaffReply(tickets),
      authorHouseProjects,
      typicalHouseProjects,
      posts,
      faqs,
      reviews,
      teamMembers,
      vacancies,
      completedBuiltObjects,
      underConstructionObjects,
      clientProjects,
      partners,
      services,
      dbConnected: true,
    };
  } catch {
    return EMPTY_STATS;
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
}: {
  href: string;
  label: string;
  value: number;
  subValue?: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="adm-uppercase-label mb-2">{label}</p>
          <p className="text-3xl font-bold tabular-nums text-white/90">
            {value}
            {subValue != null ? (
              <span className="text-sm font-normal adm-faint ml-1">{subValue}</span>
            ) : null}
          </p>
        </div>
        <div className="p-2.5 rounded-xl shrink-0 bg-white/[0.06]">
          <Icon size={20} className="text-white/45" />
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
}: {
  href: string;
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200"
    >
      <div className="p-2 rounded-lg shrink-0 bg-white/[0.06]">
        <Icon size={18} className="text-white/45" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="adm-uppercase-label text-[11px] truncate">{label}</p>
        <p className="text-xl font-bold tabular-nums text-white/90">{value}</p>
      </div>
      <ChevronRight size={16} className="adm-faint shrink-0 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function SectionLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-white/70 hover:border-white/[0.14] hover:text-white/90 transition-colors"
    >
      <Icon size={16} className="opacity-70" />
      {label}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            href="/admin/leads"
            label="Заявки (новые / всего)"
            value={stats.newLeads}
            subValue={`/ ${stats.leads}`}
            icon={Inbox}
          />
          <StatCard
            href="/admin/tickets"
            label="Чат (ожидают ответа)"
            value={stats.pendingTickets}
            icon={MessageCircle}
          />
          <StatCard
            href="/admin/house-projects"
            label="Авторские проекты"
            value={stats.authorHouseProjects}
            icon={Home}
          />
          <StatCard
            href="/admin/partner-house-projects"
            label="Типовые проекты"
            value={stats.typicalHouseProjects}
            icon={Home}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="adm-section-title">Контент сайта</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <CompactStatCard
            href="/admin/posts"
            label="Новости"
            value={stats.posts}
            icon={FileText}
          />
          <CompactStatCard
            href="/admin/built-objects"
            label={BUILT_HOMES_SECTION_LABEL}
            value={stats.completedBuiltObjects}
            icon={Images}
          />
          <CompactStatCard
            href="/admin/built-objects?status=building"
            label={UNDER_CONSTRUCTION_HOMES_ADMIN_LABEL}
            value={stats.underConstructionObjects}
            icon={HardHat}
          />
          <CompactStatCard
            href="/admin/faq"
            label="Вопросы FAQ"
            value={stats.faqs}
            icon={HelpCircle}
          />
          <CompactStatCard
            href="/admin/reviews"
            label="Отзывы"
            value={stats.reviews}
            icon={Star}
          />
          <CompactStatCard
            href="/admin/team"
            label="Команда"
            value={stats.teamMembers}
            icon={ContactRound}
          />
          <CompactStatCard
            href="/admin/vacancies"
            label="Вакансии"
            value={stats.vacancies}
            icon={ClipboardList}
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
          />
          <CompactStatCard
            href="/admin/partners"
            label="Партнёры"
            value={stats.partners}
            icon={Users}
          />
          <CompactStatCard
            href="/admin/services"
            label="Услуги"
            value={stats.services}
            icon={Briefcase}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
        <p className="adm-uppercase-label font-semibold mb-3">Ещё разделы</p>
        <div className="flex flex-wrap gap-2">
          <SectionLink href="/admin/home-banner" label="Главный баннер" icon={PanelTop} />
          <SectionLink href="/admin/calculator" label="Калькулятор проектов" icon={Calculator} />
          <SectionLink href="/admin/design-project-pricing" label="Калькулятор проектирования" icon={Calculator} />
          <SectionLink href="/admin/mortgage" label="Ипотека" icon={Landmark} />
          <SectionLink href="/admin/seo" label="SEO и редиректы" icon={Globe} />
          <SectionLink href="/admin/settings" label="Настройки сайта" icon={Settings} />
        </div>
      </section>

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
