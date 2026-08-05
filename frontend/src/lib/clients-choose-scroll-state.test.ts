import { describe, expect, it } from "vitest";

import {
  CLIENTS_CHOOSE_EXIT_FRACTION,
  getClientsChooseScrollState,
  hasVisibleClientsChooseSlide,
  resolveClientsChooseScrollProgress,
  resolveClientsChooseSkipScrollY,
  resolveClientsChooseSlideVisual,
  resolveClientsChooseTrackHeightVh,
  resolveClientsChooseVideoProgress,
} from "@/lib/clients-choose-scroll-state";

const COUNT = 5;

describe("clients-choose-scroll-state", () => {
  it("на Проекте видео не в начале ролика (разрез — для Фундамента)", () => {
    const video = resolveClientsChooseVideoProgress(0, COUNT);
    expect(video).toBeGreaterThan(0.1);
    expect(video).toBeLessThan(0.2);
  });

  it("на Фундаменте видео в начале ролика", () => {
    const progress = 1 / COUNT;
    const state = getClientsChooseScrollState(progress, COUNT);
    expect(state.baseIndex).toBe(1);
    expect(state.displayNumber).toBe(2);

    const video = resolveClientsChooseVideoProgress(progress, COUNT);
    expect(video).toBeLessThan(0.06);
  });

  it("при переходе на Отделку видео в сегменте 5, а не Коммуникаций", () => {
  const progress = (3 + CLIENTS_CHOOSE_EXIT_FRACTION + 0.05) / COUNT;
  const state = getClientsChooseScrollState(progress, COUNT);
  expect(state.baseIndex).toBe(3);
  expect(state.displayNumber).toBe(5);

  const video = resolveClientsChooseVideoProgress(progress, COUNT);
  expect(video).toBeGreaterThan(0.8);
  expect(video).toBeLessThan(0.95);
  });

  it("на Коммуникациях до перехода видео остаётся в сегменте 4", () => {
    const progress = (3 + 0.2) / COUNT;
    const state = getClientsChooseScrollState(progress, COUNT);
    expect(state.displayNumber).toBe(4);

    const video = resolveClientsChooseVideoProgress(progress, COUNT);
    expect(video).toBeGreaterThan(0.6);
    expect(video).toBeLessThan(0.75);
  });

  it("skip scroll target ставит низ секции под хедер", () => {
    expect(
      resolveClientsChooseSkipScrollY({
        scrollY: 1000,
        sectionTop: -200,
        sectionHeight: 2500,
        headerOffset: 64,
      }),
    ).toBe(1000 - 200 + 2500 - 64);
  });

  it("на границе exitFraction текущий слайд ещё виден (нет пустого кадра)", () => {
    const { baseIndex, localProgress } = getClientsChooseScrollState(
      CLIENTS_CHOOSE_EXIT_FRACTION / COUNT,
      COUNT,
    );
    expect(baseIndex).toBe(0);
    expect(localProgress).toBeCloseTo(CLIENTS_CHOOSE_EXIT_FRACTION, 5);
    const current = resolveClientsChooseSlideVisual(0, baseIndex, localProgress, COUNT);
    expect(current.visible).toBe(true);
    expect(current.opacity).toBe(1);
  });

  it("на любом шаге progress виден хотя бы один слайд", () => {
    for (let i = 0; i <= 100; i += 1) {
      expect(hasVisibleClientsChooseSlide(i / 100, COUNT)).toBe(true);
    }
  });

  it("высота трека в vh кратна числу услуг (не схлопывается до одного экрана)", () => {
    expect(resolveClientsChooseTrackHeightVh(5, false)).toBe(240);
    expect(resolveClientsChooseTrackHeightVh(5, true)).toBe(290);
    expect(resolveClientsChooseTrackHeightVh(5, true)).toBeGreaterThan(100);
  });

  it("при высоком треке progress растёт по мере ухода sectionTop вверх", () => {
    const viewportHeight = 800;
    const sectionHeight = 2900;
    expect(
      resolveClientsChooseScrollProgress({
        sectionTop: 0,
        sectionHeight,
        viewportHeight,
      }),
    ).toBe(0);
    expect(
      resolveClientsChooseScrollProgress({
        sectionTop: -sectionHeight / 2 + viewportHeight / 2,
        sectionHeight,
        viewportHeight,
      }),
    ).toBeGreaterThan(0.4);
    expect(
      resolveClientsChooseScrollProgress({
        sectionTop: -(sectionHeight - viewportHeight),
        sectionHeight,
        viewportHeight,
      }),
    ).toBe(1);
  });

  it("схлопнутый трек (~viewport) даёт почти нулевой progress на большей части pin — это баг-сценарий", () => {
    const viewportHeight = 800;
    const sectionHeight = 820;
    expect(
      resolveClientsChooseScrollProgress({
        sectionTop: -5,
        sectionHeight,
        viewportHeight,
      }),
    ).toBeLessThan(0.3);
  });
});