import Image from "next/image";
import Link from "next/link";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { CompanyPageHeader } from "@/components/company/company-page-header";
import { getPublicTeam } from "@/lib/get-public-team";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Команда | ${SITE_NAME}`,
    description: `Команда ${SITE_NAME}: специалисты по проектированию и строительству загородных домов в ${CITY} и регионе.`,
    path: "/team",
    keywords: ["команда", "строительство домов", SITE_NAME, CITY],
  });
}

function TeamMemberPhoto({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  if (!photoUrl) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center text-4xl font-heading font-bold"
        style={{ color: "color-mix(in srgb, var(--text) 22%, transparent)" }}
        aria-hidden
      >
        {initial}
      </div>
    );
  }
  const local = photoUrl.startsWith("/") && !photoUrl.startsWith("//");
  if (local) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        fill
        className="object-cover object-top"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- произвольный URL из админки
    <img
      src={photoUrl}
      alt={name}
      className="absolute inset-0 h-full w-full object-cover object-top"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

export default async function TeamPage() {
  const members = await getPublicTeam();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Команда", path: "/team" },
        ]}
      />
      <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <CompanyPageHeader
          breadcrumbCurrent="Команда"
          title="Наша команда"
          description="Люди, которые ведут проект от идеи до сдачи объекта и отвечают за качество на площадке."
        />
        <section className="pb-20 pt-4 md:pb-28" aria-labelledby="team-grid-heading">
          <h2 id="team-grid-heading" className="sr-only">
            Состав команды
          </h2>
          <div className="container mx-auto max-w-[1200px] px-5">
            {members.length === 0 ? (
              <p className="max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Состав команды скоро появится на этой странице. По вопросам сотрудничества и консультаций напишите через{" "}
                <Link href="/contacts" className="font-medium underline-offset-4 hover:underline" style={{ color: "var(--accent)" }}>
                  контакты
                </Link>
                .
              </p>
            ) : (
              <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-[1.25rem] border overflow-hidden flex flex-col"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
                  >
                    <div className="aspect-[4/3] bg-[var(--card-bg)] relative">
                      <TeamMemberPhoto photoUrl={m.photoUrl} name={m.name} />
                    </div>
                    <div className="p-6 md:p-7 flex flex-col flex-1">
                      <p className="font-heading text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>
                        {m.name}
                      </p>
                      <p className="mt-1 text-sm font-medium" style={{ color: "var(--accent)" }}>
                        {m.position}
                      </p>
                      {m.description ? (
                        <p className="mt-4 text-sm leading-relaxed flex-1 whitespace-pre-line" style={{ color: "var(--text-muted)" }}>
                          {m.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
