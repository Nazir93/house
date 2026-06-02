import { describe, expect, it } from "vitest";
import { moveListItem } from "./reorder-list";

describe("moveListItem", () => {
  it("перемещает элемент в новый индекс", () => {
    expect(moveListItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveListItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("не ломает список при выходе за границы", () => {
    expect(moveListItem(["a", "b"], -1, 1)).toEqual(["a", "b"]);
    expect(moveListItem(["a", "b"], 0, 5)).toEqual(["a", "b"]);
  });
});
import { describe, expect, it } from "vitest";
import { moveItemInArray } from "./reorder-list";

describe("moveItemInArray", () => {
  it("переносит элемент вперёд", () => {
    expect(moveItemInArray(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });

  it("переносит элемент назад", () => {
    expect(moveItemInArray(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("не меняет массив при одинаковых индексах", () => {
    const arr = [1, 2, 3];
    expect(moveItemInArray(arr, 1, 1)).toBe(arr);
  });
});
