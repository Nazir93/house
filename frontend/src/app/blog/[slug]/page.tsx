import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SITE_NAME } from "@/lib/constants";
import { getPageMeta, getPageH1 } from "@/lib/get-page-meta";
import { BlogPostContent } from "./content";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let post: {
    title: string;
    excerpt: string;
    slug: string;
    coverImage: string | null;
    category: string;
  } | null = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug: params.slug, published: true },
      select: {
        title: true,
        excerpt: true,
        slug: true,
        coverImage: true,
        coverVideo: true,
        category: true,
      },
    });
  } catch {
    return {};
  }
  if (!post) return {};

  const path = `/blog/${post.slug}`;
  const keywords = [post.title, post.category, SITE_NAME].filter((k) => k.trim().length > 0);

  return getPageMeta({
    title: `${post.title} | ${SITE_NAME}`,
    description: post.excerpt,
    path,
    keywords,
    ogImage: post.coverImage || undefined,
    openGraphType: "article",
  });
}

async function getPost(slug: string) {
  try {
    return await prisma.post.findUnique({
      where: { slug, published: true },
    });
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const pageH1 = await getPageH1(path, post.title);

  const raw = post as unknown as { coverVideos?: string[]; galleryUrls?: string[] };
  return (
    <BlogPostContent
      pageH1={pageH1}
      post={{
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        coverImage: post.coverImage,
        coverVideo: post.coverVideo,
        coverVideos: raw.coverVideos ?? [],
        galleryUrls: raw.galleryUrls ?? [],
        createdAt: post.createdAt.toISOString(),
      }}
    />
  );
}
