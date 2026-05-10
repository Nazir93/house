import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SITE_NAME } from "@/lib/constants";
import { getPageMeta, getPageH1 } from "@/lib/get-page-meta";
import { BlogArticleJsonLd } from "@/components/seo/blog-article-json-ld";
import { BlogPostContent } from "./content";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  let post: {
    title: string;
    excerpt: string;
    slug: string;
    coverImage: string | null;
    category: string;
    createdAt: Date;
    updatedAt: Date;
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
        createdAt: true,
        updatedAt: true,
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
    article: {
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [SITE_NAME],
      section: post.category,
    },
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

export default async function BlogPostPage(props: Props) {
  const params = await props.params;
  const post = await getPost(params.slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const pageH1 = await getPageH1(path, post.title);

  const raw = post as unknown as { coverVideos?: string[]; galleryUrls?: string[] };
  return (
    <>
      <BlogArticleJsonLd
        title={post.title}
        slug={post.slug}
        description={post.excerpt}
        coverImage={post.coverImage}
        galleryUrls={raw.galleryUrls ?? []}
        datePublished={post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
      />
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
    </>
  );
}
