"use client";

import { useId } from "react";

/** Чертежная миллиметровка + схемы на тёмном фоне футера — хорошо читается на --footer-bar-bg */
export function FooterBlueprintBackdrop() {
  const gridId = useId().replace(/:/g, "");
  const grid = "rgba(255,255,255,0.11)";
  const wall = "rgba(255,255,255,0.2)";
  const wallSoft = "rgba(255,255,255,0.13)";
  const dim = "rgba(255,255,255,0.09)";

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        className="h-full w-full min-h-[320px] opacity-[0.38]"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id={`${gridId}-ft`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke={grid} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId}-ft)`} />

        <g transform="translate(40 72)" opacity={0.85}>
          <path
            d="M 20 170 V 82 L 118 14 L 216 82 V 170 H 20 Z"
            fill="none"
            stroke={wall}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <rect x="88" y="108" width="40" height="62" fill="none" stroke={wallSoft} strokeWidth="1" />
          <line x1="108" y1="108" x2="108" y2="170" stroke={wallSoft} strokeWidth="0.9" strokeDasharray="3 3" />
          <rect x="152" y="92" width="48" height="30" fill="none" stroke={wall} strokeWidth="1.2" />
          <line x1="0" y1="182" x2="236" y2="182" stroke={dim} strokeWidth="0.85" strokeDasharray="4 6" />
          <text
            x="118"
            y="204"
            textAnchor="middle"
            fill={dim}
            style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", letterSpacing: "0.16em" }}
          >
            ФАСАД
          </text>
        </g>

        <g transform="translate(320 48)" opacity={0.9}>
          <rect x="0" y="40" width="380" height="220" fill="none" stroke={wall} strokeWidth="1.3" />
          <line x1="190" y1="40" x2="190" y2="260" stroke={wallSoft} strokeWidth="1" />
          <line x1="0" y1="150" x2="380" y2="150" stroke={wallSoft} strokeWidth="1" />
          <line x1="268" y1="150" x2="268" y2="260" stroke={wallSoft} strokeWidth="1" strokeDasharray="5 4" />
          <line x1="-18" y1="40" x2="-6" y2="40" stroke={dim} strokeWidth="0.8" />
          <line x1="-18" y1="260" x2="-6" y2="260" stroke={dim} strokeWidth="0.8" />
          <line x1="-12" y1="40" x2="-12" y2="260" stroke={dim} strokeWidth="0.75" strokeDasharray="3 4" />
          <text
            x="190"
            y="22"
            textAnchor="middle"
            fill={dim}
            style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", letterSpacing: "0.16em" }}
          >
            ПЛАН 1‑ГО ЭТАЖА
          </text>
        </g>

        <g transform="translate(780 120)" opacity={0.55}>
          <rect x="0" y="0" width="180" height="120" fill="none" stroke={wallSoft} strokeWidth="1" strokeDasharray="6 5" />
          <line x1="0" y1="60" x2="180" y2="60" stroke={wallSoft} strokeWidth="0.8" strokeDasharray="4 5" />
        </g>

        <g transform="translate(980 64)" opacity={0.45}>
          <rect x="0" y="0" width="140" height="88" fill="none" stroke={wallSoft} strokeWidth="0.9" />
          <line x1="70" y1="0" x2="70" y2="88" stroke={dim} strokeWidth="0.75" strokeDasharray="3 4" />
        </g>
      </svg>
    </div>
  );
}
