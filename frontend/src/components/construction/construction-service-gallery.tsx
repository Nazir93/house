import Image from "next/image";
import Link from "next/link";

export function ConstructionServiceGallery({
  items,
  title = "Примеры работ",
}: {
  items: { src: string; alt: string }[];
  title?: string;
}) {
  if (items.length === 0) return null;

  const cells = items.slice(0, 6);

  return (
    <section className="mt-16 md:mt-24">
      <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl" style={{ color: "var(--text)" }}>
        {title}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        {cells.map((img, i) => (
          <figure key={`${img.src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--card-bg)]">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </figure>
        ))}
      </div>
      <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        Больше объектов — в разделе{" "}
        <Link href="/portfolio" className="font-medium underline-offset-4 hover:underline" style={{ color: "var(--accent)" }}>
          Наши работы
        </Link>
        .
      </p>
    </section>
  );
}
