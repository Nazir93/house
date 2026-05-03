"use client";

import type { TransitionEvent } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const HOUSE_PATH =
  "M50 10 L18 42 V102 H12 V116 H88 V102 H82 V42 L50 10 Z";

const CX = 50;
const CY = 60;
const START_SCALE = 0.038;

/** Медленное раскрытие силуэта дома — с первого кадра маленький проём. */
const REVEAL_DURATION_MS = 32000;

/** Узкое окно по ширине — тоже без `none`, чтобы не ломать пропорции. */
const UNIFORM_ASPECT_MAX_WIDTH_PX = 1024;
/** Высота ≥ ширины × порог — книжный экран (телефоны и планшеты, часто уже 768px по ширине). */
const PORTRAIT_RATIO_MIN = 1.02;

function shouldUseUniformSvgAspect(): boolean {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w <= 0 || h <= 0) return false;
  if (h / w >= PORTRAIT_RATIO_MIN) return true;
  if (w <= UNIFORM_ASPECT_MAX_WIDTH_PX) return true;
  return false;
}

/**
 * Сразу зелёная «штора» с маленьким проёмом в форме дома; проём долго и плавно растёт.
 */
export function HouseRevealIntro() {
  const uid = useId().replace(/:/g, "");
  const maskId = `houseRevealMask-${uid}`;
  const gradId = `houseRevealGradient-${uid}`;

  const [active, setActive] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mountTarget, setMountTarget] = useState<HTMLElement | null>(null);
  /** Равномерный масштаб SVG (`slice`), без горизонтального «сжатия» дома на портрете / узкой ширине. */
  const [uniformSvgAspect, setUniformSvgAspect] = useState(false);
  const holeEnded = useRef(false);
  const holeRef = useRef<SVGGElement | null>(null);

  useLayoutEffect(() => {
    setMountTarget(document.body);
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setReducedMotion(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useLayoutEffect(() => {
    const sync = () => setUniformSvgAspect(shouldUseUniformSvgAspect());
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      vv?.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const fallbackMs = REVEAL_DURATION_MS + 5500;
    const id = window.setTimeout(() => {
      if (holeEnded.current) return;
      holeEnded.current = true;
      setFadeOut(true);
    }, fallbackMs);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  /** После fade слой прозрачный, но без этого он всё ещё ловит клики (и может «залипнуть», если не пришёл transitionend). */
  useEffect(() => {
    if (!fadeOut) return;
    const id = window.setTimeout(() => setActive(false), 1400);
    return () => window.clearTimeout(id);
  }, [fadeOut]);

  useLayoutEffect(() => {
    if (reducedMotion || !mountTarget) return;

    const node = holeRef.current;
    if (!node) return;

    holeEnded.current = false;

    const durationMs = REVEAL_DURATION_MS;
    /** Сразу после первого кадра начинаем медленный рост проёма. */
    const holdFraction = 0.02;
    const startScale = START_SCALE;
    const endScale = 28;
    const t0 = performance.now();
    let raf = 0;
    let cancelled = false;
    /** Маска SVG дорогая для GPU; ~26 fps даёт тот же визуальный ход без постоянных перерисовок на 60 Hz. */
    const MIN_FRAME_MS = 1000 / 26;
    let lastPaint = 0;
    let frozenMs = 0;
    let hiddenAt = 0;

    const ease = (t: number) => 1 - Math.pow(1 - t, 2.6);

    const applyTransform = (scale: number) => {
      node.setAttribute(
        "transform",
        `translate(${CX} ${CY}) scale(${scale}) translate(${-CX} ${-CY})`,
      );
    };

    applyTransform(startScale);

    const finish = () => {
      if (cancelled || holeEnded.current) return;
      holeEnded.current = true;
      setFadeOut(true);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - t0 - frozenMs;
      const p = Math.min(1, elapsed / durationMs);
      const shaped =
        p <= holdFraction ? 0 : ease((p - holdFraction) / (1 - holdFraction));
      const scale = startScale + (endScale - startScale) * shaped;

      if (p < 1 && now - lastPaint < MIN_FRAME_MS) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      lastPaint = now;
      applyTransform(scale);

      if (p < 1) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      finish();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = performance.now();
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      if (hiddenAt > 0) {
        frozenMs += performance.now() - hiddenAt;
        hiddenAt = 0;
      }
      if (!cancelled && !holeEnded.current && !raf) {
        raf = window.requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, mountTarget]);

  const dismiss = () => setActive(false);

  const onFadeTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "opacity" || !fadeOut) return;
    dismiss();
  };

  if (!active) return null;

  if (reducedMotion) {
    const rm = <ReducedMotionCurtain onDone={dismiss} />;
    return mountTarget ? createPortal(rm, mountTarget) : rm;
  }

  const layer = (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-[1100ms] ease-out ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ zIndex: 2147483647 }}
      onTransitionEnd={onFadeTransitionEnd}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 118"
        preserveAspectRatio={
          uniformSvgAspect ? "xMidYMid slice" : "none"
        }
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a5c47" />
            <stop offset="45%" stopColor="#0f3d2e" />
            <stop offset="100%" stopColor="#0a3026" />
          </linearGradient>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100"
            height="118"
          >
            <rect x="0" y="0" width="100" height="118" fill="white" />
            <g
              ref={holeRef}
              transform={`translate(${CX} ${CY}) scale(${START_SCALE}) translate(${-CX} ${-CY})`}
            >
              <path d={HOUSE_PATH} fill="black" />
            </g>
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100"
          height="118"
          fill={`url(#${gradId})`}
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );

  return mountTarget ? createPortal(layer, mountTarget) : layer;
}

function ReducedMotionCurtain({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useLayoutEffect(() => {
    const id = window.requestAnimationFrame(() => setPhase("out"));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-[#0f3d2e] pointer-events-none transition-opacity duration-300 ease-out ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
      style={{ zIndex: 2147483647 }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "opacity" && phase === "out") onDone();
      }}
    />
  );
}
