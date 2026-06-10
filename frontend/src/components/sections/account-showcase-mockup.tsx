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
};

export function AccountShowcaseMockup({ itemId, image, images, metrics }: AccountShowcaseMockupProps) {
  const Icon = ACCOUNT_SHOWCASE_ICON_BY_ID[itemId];
  const { theme } = useTheme();
  const imageSrc = resolveAccountShowcaseImage({ image, images }, theme);

  return (
    <div
      className="relative aspect-[16/11] w-full max-h-[min(30rem,70vh)] overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-[#07120e]"
    >
      {images ? (
        <>
          <Image
            src={images.dark}
            alt=""
            {...SHOWCASE_IMAGE_PROPS}
            className={`object-cover object-left-top saturate-[0.95] transition-opacity duration-500 ${
              theme === "dark" ? "opacity-100" : "opacity-0"
            }`}
          />
          <Image
            src={images.light}
            alt=""
            {...SHOWCASE_IMAGE_PROPS}
            className={`object-cover object-left-top saturate-[0.95] transition-opacity duration-500 ${
              theme === "light" ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      ) : (
        <Image
          src={imageSrc}
          alt=""
          {...SHOWCASE_IMAGE_PROPS}
          className="object-cover object-left-top opacity-58 saturate-[0.9]"
        />
      )}

      <div className="absolute inset-x-0 top-0 z-[1] flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="rounded-xl border border-white/12 bg-white/[0.08] p-2.5 backdrop-blur-md">
          <Icon className="h-5 w-5 text-white" strokeWidth={1.9} aria-hidden />
        </div>
        <div className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
          кабинет клиента
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[1] grid grid-cols-3 gap-2 p-4 sm:gap-2.5 sm:p-5">
        {metrics.map((metric) => (
          <div
            key={metric}
            className="rounded-xl border border-white/10 bg-black/35 px-2.5 py-2 backdrop-blur-md sm:px-3 sm:py-2.5"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/44">раздел</p>
            <p className="mt-0.5 text-xs font-semibold leading-tight text-white sm:text-sm">{metric}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
