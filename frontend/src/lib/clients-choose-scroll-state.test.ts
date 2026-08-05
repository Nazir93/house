import { describe, expect, it } from "vitest";

import {
  CLIENTS_CHOOSE_EXIT_FRACTION,
  getClientsChooseScrollState,
  resolveClientsChooseSkipScrollY,
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
});
