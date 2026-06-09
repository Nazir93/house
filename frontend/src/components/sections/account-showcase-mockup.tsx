"use client";

import Image from "next/image";

import { resolveAccountShowcaseImage, type AccountShowcaseItem } from "@/lib/account-showcase";
import { useTheme } from "@/lib/theme-context";

const SHOWCASE_IMAGE_PROPS = {
  fill: true as const,
  unoptimized: true,
  sizes: "(max-width: 1024px) 100vw, 48vw",
};

export function AccountShowcaseMockup({ item }: { item: AccountShowcaseItem }) {
  const Icon = item.Icon;
  const { theme } = useTheme();
  const imageSrc = resolveAccountShowcaseImage(item, theme);
  const themedImages = item.images;

  return (
    <div className="relative min-h-[19rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#07120e] shadow-[0_28px_90px_rgba(0,0,0,0.34)] lg:min-h-[28rem]">
      {themedImages ? (
        <>
          <Image
            src={themedImages.dark}
            alt=""
            {...SHOWCASE_IMAGE_PROPS}
            className={`object-cover object-left-top saturate-[0.95] transition-opacity duration-500 ${
              theme === "dark" ? "opacity-100" : "opacity-0"
            }`}
          />
          <Image
            src={themedImages.light}
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
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/88 via-black/46 to-black/22 ${themedImages ? "opacity-35" : ""}`}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(125,211,168,0.22),transparent_34%)]" aria-hidden />

      <div className="relative z-[1] flex min-h-[19rem] flex-col justify-between p-5 sm:p-6 lg:min-h-[28rem] lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <Icon className="h-6 w-6 text-white" strokeWidth={1.9} aria-hidden />
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
            кабинет клиента
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {item.metrics.map((metric) => (
            <div key={metric} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/44">раздел</p>
              <p className="mt-1 text-sm font-semibold text-white">{metric}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
