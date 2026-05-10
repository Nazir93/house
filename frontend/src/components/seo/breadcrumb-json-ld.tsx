import type { BreadcrumbItem } from "@/lib/breadcrumb-schema";
import { buildBreadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { JsonLdInline } from "./json-ld-inline";

export type { BreadcrumbItem };

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLdInline schema={buildBreadcrumbListSchema(items)} />;
}
