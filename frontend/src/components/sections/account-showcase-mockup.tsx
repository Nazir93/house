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
    <div className="relative h-full min-h-[22rem] w-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#07120e] sm:min-h-[24rem] sm:rounded-[1.6rem] md:min-h-[26rem] lg:min-h-full">
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
