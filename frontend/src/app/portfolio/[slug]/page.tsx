import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { getBuiltObjectBySlug } from "@/lib/construction-data";
import { getPageMeta } from "@/lib/get-page-meta";
import { BuiltObjectDetailContent } from "./built-content";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const object = await getBuiltObjectBySlug(params.slug);
  if (!object) return {};

  const path = `/portfolio/${object.slug}`;
  const keywords = [object.title, object.material, object.location, SITE_NAME].filter(
    (k): k is string => Boolean(k && String(k).trim())
  );

  return getPageMeta({
    title: `${object.title} — построенный дом | ${SITE_NAME}`,
    description: object.description.replace(/<[^>]*>/g, "").slice(0, 180),
    path,
    keywords,
  });
}

export default async function CasePage({ params }: Props) {
  const object = await getBuiltObjectBySlug(params.slug);
  if (!object) notFound();
  return <BuiltObjectDetailContent object={object} />;
}
