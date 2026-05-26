import type { CalculatorAddonGroup, CalculatorAddonItem } from "@/lib/project-calculator-types";

export function calculatorAddonGroupSum(
  group: CalculatorAddonGroup,
  selected: Record<string, boolean>,
  resolvePrice: (item: CalculatorAddonItem) => number,
): number {
  let sum = 0;
  for (const item of group.items) {
    if (selected[item.id]) sum += resolvePrice(item);
  }
  return sum;
}
