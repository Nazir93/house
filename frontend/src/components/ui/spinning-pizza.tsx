"use client";

import { useState } from "react";
import { Pizza } from "lucide-react";

const PIZZA_SPIN_WEBP = "/images/offer/pizza-spin.webp";
const PIZZA_SPIN_PNG = "/images/offer/pizza-spin.png";

export function SpinningPizzaAsset({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [broken, setBroken] = useState(false);
  const box =
    size === "sm"
      ? "h-[5.5rem] w-[5.5rem] sm:h-28 sm:w-28"
      : size === "lg"
        ? "h-44 w-44 sm:h-52 sm:w-52"
        : "h-36 w-36 sm:h-40 sm:w-40";

  const inner = broken ? (
    <Pizza
      size={size === "lg" ? 112 : size === "sm" ? 72 : 88}
      strokeWidth={2}
      className="animate-[spin_22s_linear_infinite] select-none"
      style={{ color: "var(--accent)", filter: "drop-shadow(0 0 18px rgba(15,61,46,0.85))" }}
    />
  ) : (
    <picture className="flex h-full w-full items-center justify-center">
      <source srcSet={PIZZA_SPIN_WEBP} type="image/webp" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PIZZA_SPIN_PNG}
        alt=""
        width={480}
        height={480}
        className="max-h-full max-w-full object-contain animate-[spin_22s_linear_infinite] select-none"
        style={{
          filter: "drop-shadow(0 0 14px rgba(15,61,46,0.55)) drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
        }}
        onError={() => setBroken(true)}
      />
    </picture>
  );

  return (
    <div
      className={`relative z-20 flex shrink-0 items-center justify-center overflow-hidden rounded-full ${box}`}
      style={{
        backgroundColor: "var(--bg)",
        boxShadow: "0 0 0 2px rgba(15,61,46,0.45)",
      }}
    >
      <div className="flex h-full w-full items-center justify-center">{inner}</div>
    </div>
  );
}
