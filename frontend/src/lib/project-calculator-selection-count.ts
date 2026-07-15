function collectionSize(value: ReadonlySet<string> | readonly string[]): number {
  return "size" in value ? value.size : value.length;
}

/** Сколько позиций пользователь уже собрал в калькуляторе комплектации. */
export function countSelectedCalculatorOptions(params: {
  facadeSlug: string | null;
  engineeringSlugs: ReadonlySet<string> | readonly string[];
  constructionSlugs: ReadonlySet<string> | readonly string[];
}): number {
  return (
    (params.facadeSlug ? 1 : 0) +
    collectionSize(params.engineeringSlugs) +
    collectionSize(params.constructionSlugs)
  );
}
