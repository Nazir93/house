"use client";

import type { PublicFaqItem } from "@/lib/get-public-faqs";
import type { BuiltObjectItem } from "@/lib/construction-shared";
import { BuiltObjectDetailPage } from "@/components/portfolio/built-object-detail-page";

export function BuiltObjectDetailContent({
  object,
}: {
  object: BuiltObjectItem;
  faqItems?: PublicFaqItem[];
}) {
  return <BuiltObjectDetailPage object={object} />;
}
