"use client";

import Image from "next/image";

import { resolveAccountShowcaseImage, type AccountShowcaseImages, type AccountShowcaseItem } from "@/lib/account-showcase";
import { ACCOUNT_SHOWCASE_ICON_BY_ID } from "@/lib/account-showcase-icons";
import { useTheme } from "@/lib/theme-context";

const SHOWCASE_IMAGE_PROPS = {
  fill: true as const,
  unoptimized: true,
  sizes: "(max-width: 1024px) 100vw, 48vw",
};

export type AccountShowcaseMockupProps = {
  itemId: AccountShowcaseItem["id"];
  image: string;
  images?: AccountShowcaseImages;
  metrics: readonly string[];
  /** Только первая карточка — eager; остальные lazy, чтобы не декодировать все PNG сразу. */
  priority?: boolean;
};

export function AccountShowcaseMockup({
  itemId,
  image,
  images,
  metrics,
  priority = false,
}: AccountShowcaseMockupProps) {
  const Icon = ACCOUNT_SHOWCASE_ICON_BY_ID[itemId];
  const { theme } = useTheme();
  const imageSrc = resolveAccountShowcaseImage({ image, images }, theme);

  return (
    <div className="relative h-full min-h-[22rem] w-full overflow-hidden rounded-[1.6rem] bg-[#07120e] shadow-[0_18px_48px_rgba(7,18,14,0.28)] sm:min-h-[24rem] sm:rounded-[1.85rem] md:min-h-[26rem] lg:min-h-full lg:rounded-[2rem]">
      <Image
        key={imageSrc}
        src={imageSrc}
        alt=""
        {...SHOWCASE_IMAGE_PROPS}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="object-cover object-left-top saturate-[0.95] opacity-95 transition-opacity duration-500"
      />

      <div className="absolute inset-0 z-[1] flex flex-col justify-between p-5 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-3 backdrop-blur-md">
            <Icon className="h-6 w-6 text-white" strokeWidth={1.9} aria-hidden />
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
            кабинет клиента
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {metrics.map((metric) => (
            <div key={metric} className="rounded-2xl border border-white/10 bg-black/30 px-2.5 py-2.5 backdrop-blur-md sm:px-3 sm:py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/44 sm:text-[10px]">раздел</p>
              <p className="mt-0.5 text-xs font-semibold text-white sm:mt-1 sm:text-sm">{metric}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
