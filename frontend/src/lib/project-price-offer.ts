export type ProjectPriceOffer = {
  currentRub: number;
  standardRub: number | null;
  discountRub: number;
  hasDiscount: boolean;
};

export function resolveProjectPriceOffer(params: {
  manualPriceRub: number;
  standardPricesRub?: Iterable<number>;
}): ProjectPriceOffer {
  const currentRub = Math.max(0, Math.round(params.manualPriceRub));
  const validStandards = [...(params.standardPricesRub ?? [])]
    .map((price) => Math.round(price))
    .filter((price) => Number.isFinite(price) && price > 0);
  const standardRub = validStandards.length ? Math.min(...validStandards) : null;
  const hasDiscount = standardRub != null && currentRub > 0 && currentRub < standardRub;

  return {
    currentRub,
    standardRub,
    discountRub: hasDiscount ? standardRub - currentRub : 0,
    hasDiscount,
  };
}

/**
 * Крупная «Цена строительства» на карточке проекта следует за выбранным
 * материалом стен (газоблок / керамоблок / кирпич), а не за project.price / газом.
 */
export function resolveSelectedHeroTierPriceOffer(selectedTierPriceRub: number): ProjectPriceOffer {
  const selected = Math.max(0, Math.round(selectedTierPriceRub));
  return resolveProjectPriceOffer({
    manualPriceRub: selected,
    standardPricesRub: selected > 0 ? [selected] : [],
  });
}
