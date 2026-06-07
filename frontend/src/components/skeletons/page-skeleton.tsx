import { Skeleton } from "@/components/ui/skeleton";

function CardGridSkeleton({ count = 3, staggerBase = 0 }: { count?: number; staggerBase?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => {
        const base = staggerBase + i * 110;
        return (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full" rounded="2xl" delay={base} />
            <Skeleton className="h-4 w-3/4" delay={base + 70} />
            <Skeleton className="h-3 w-1/2" delay={base + 130} />
          </div>
        );
      })}
    </div>
  );
}

function SectionBlockSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto max-w-[1200px] px-4 sm:px-5 lg:px-6">
        <Skeleton className="h-7 w-48 max-w-[70%] sm:h-8" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-8">
          <CardGridSkeleton count={cards} />
        </div>
      </div>
    </section>
  );
}

/** Главная: баннер + секции. */
export function HomePageSkeleton() {
  return (
    <div
      className="page-skeleton-shell -mt-[var(--site-header-banner-overlap)]"
      aria-busy="true"
      aria-label="Загрузка главной страницы"
    >
      <div
        className="relative min-h-[100svh] min-h-[100dvh] w-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="section-inline-pad flex min-h-[100svh] min-h-[100dvh] flex-col justify-end pb-8 pt-[calc(var(--site-header-sticky-offset)+var(--site-header-banner-overlap)+1rem+env(safe-area-inset-top,0px))] md:pb-12">
          <div className="grid w-full gap-4 min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(260px,40vw)] min-[1100px]:items-end">
            <div className="max-w-3xl space-y-3">
              <Skeleton className="h-10 w-full max-w-2xl sm:h-12" rounded="2xl" delay={0} />
              <Skeleton className="h-10 w-[88%] max-w-xl sm:h-12" rounded="2xl" delay={80} />
              <Skeleton className="h-16 w-full max-w-xl" rounded="lg" delay={160} />
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-10 w-36" rounded="xl" delay={240} />
                <Skeleton className="h-10 w-40" rounded="xl" delay={300} />
              </div>
            </div>
            <Skeleton
              className="h-[min(48vw,280px)] w-full min-h-[200px] sm:h-[260px] min-[1100px]:h-[220px]"
              rounded="2xl"
              delay={120}
            />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" rounded="xl" delay={360 + i * 70} />
            ))}
          </div>
        </div>
      </div>

      <SectionBlockSkeleton cards={4} />
      <div style={{ backgroundColor: "var(--bg-secondary)" }}>
        <SectionBlockSkeleton cards={3} />
      </div>
      <SectionBlockSkeleton cards={3} />
    </div>
  );
}

/** Внутренние страницы: шапка раздела + блоки контента. */
export function ContentPageSkeleton() {
  return (
    <div className="page-skeleton-shell" aria-busy="true" aria-label="Загрузка страницы">
      <header
        className="page-top-offset border-b pb-8 sm:pb-10"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
      >
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-5 lg:px-6">
          <Skeleton className="h-3 w-40 max-w-[80%]" rounded="md" />
          <Skeleton className="mt-6 h-9 w-64 max-w-[90%] sm:mt-8 sm:h-10" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-xl" />
        </div>
      </header>

      <section className="py-10 md:py-14" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1200px] space-y-4 px-4 sm:px-5 lg:px-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="mt-4 h-48 w-full" rounded="2xl" />
          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <Skeleton className="h-32 w-full" rounded="2xl" />
            <Skeleton className="h-32 w-full" rounded="2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

/** Каталоги: фильтры + сетка карточек. */
export function CatalogPageSkeleton() {
  return (
    <div className="page-skeleton-shell page-top-offset" aria-busy="true" aria-label="Загрузка каталога">
      <div className="container mx-auto max-w-[1440px] px-4 pb-16 pt-2 sm:px-5 lg:px-6">
        <Skeleton className="h-9 w-56 max-w-[80%]" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" rounded="2xl" />
            <Skeleton className="h-40 w-full" rounded="2xl" />
            <Skeleton className="h-32 w-full" rounded="2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" rounded="2xl" />
            <CardGridSkeleton count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Карточка проекта / статьи / услуги. */
export function DetailPageSkeleton() {
  return (
    <div className="page-skeleton-shell" aria-busy="true" aria-label="Загрузка страницы">
      <Skeleton
        className="aspect-[16/9] w-full max-h-[min(56vh,520px)] min-h-[220px] sm:min-h-[280px]"
        rounded="none"
      />
      <div className="container mx-auto max-w-[1200px] px-4 py-10 sm:px-5 lg:px-6">
        <Skeleton className="h-3 w-48" rounded="md" />
        <Skeleton className="mt-6 h-10 w-full max-w-2xl" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 w-full" rounded="2xl" />
          <Skeleton className="h-20 w-full" rounded="2xl" />
          <Skeleton className="h-20 w-full" rounded="2xl" />
        </div>
        <div className="mt-10 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[94%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="mt-4 h-56 w-full" rounded="2xl" />
        </div>
      </div>
    </div>
  );
}
