import Link from "next/link";
import { Users } from "lucide-react";
import type { PublicTeamMember } from "@/lib/get-public-team";

function TeamMemberPhoto({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (!photoUrl) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]"
        aria-hidden
      >
        <span
          className="font-heading text-5xl font-bold sm:text-6xl"
          style={{ color: "color-mix(in srgb, var(--accent) 35%, transparent)" }}
        >
          {initial}
        </span>
      </div>
    );
  }

  const local = photoUrl.startsWith("/") && !photoUrl.startsWith("//");

  if (local) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- локальные загрузки из админки
      <img
        src={photoUrl}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover object-top"
        loading="lazy"
        decoding="async"
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

function TeamEmptyState() {
  return (
    <div
      className="rounded-2xl px-5 py-10 text-center sm:px-10 sm:py-14"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      <div className="mb-6 flex justify-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: "rgba(15,61,46,0.08)",
            border: "1px solid rgba(15,61,46,0.2)",
          }}
        >
          <Users size={26} style={{ color: "var(--accent)" }} aria-hidden />
        </div>
      </div>
      <p className="font-heading text-xl sm:text-2xl" style={{ color: "var(--text)" }}>
        Состав команды скоро появится
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
        По вопросам сотрудничества и консультаций напишите через{" "}
        <Link href="/contacts" className="font-medium underline-offset-4 hover:underline" style={{ color: "var(--accent)" }}>
          контакты
        </Link>
        .
      </p>
    </div>
  );
}

export function TeamMembersGrid({ members }: { members: PublicTeamMember[] }) {
  if (members.length === 0) {
    return <TeamEmptyState />;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <p className="text-sm sm:text-[15px]" style={{ color: "var(--text-muted)" }}>
        В команде:{" "}
        <span className="font-semibold tabular-nums" style={{ color: "var(--text)" }}>
          {members.length}
        </span>
      </p>

      <ul
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:gap-8"
        role="list"
      >
        {members.map((m) => (
          <li
            key={m.id}
            className="group flex flex-col overflow-hidden rounded-[1.25rem] border transition-shadow hover:shadow-[0_16px_40px_-20px_rgba(15,61,46,0.22)]"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--card-bg)]">
              <TeamMemberPhoto photoUrl={m.photoUrl} name={m.name} />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-7">
              <p className="font-heading text-lg font-bold leading-tight sm:text-xl" style={{ color: "var(--text)" }}>
                {m.name}
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-snug" style={{ color: "var(--accent)" }}>
                {m.position}
              </p>
              {m.description ? (
                <p
                  className="mt-3 flex-1 text-sm leading-relaxed whitespace-pre-line sm:mt-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  {m.description}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
