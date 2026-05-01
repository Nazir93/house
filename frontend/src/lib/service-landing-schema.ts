import { z } from "zod";

/** Один блок лендинга услуги (порядок = порядок на странице). */
export const serviceLandingSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("schema"),
    serviceName: z.string(),
    serviceDescription: z.string(),
    slug: z.string(),
    priceRange: z.string().optional(),
  }),
  z.object({
    type: z.literal("hero"),
    title: z.string(),
    subtitle: z.string(),
    serviceKey: z.string(),
    tag: z.string(),
    features: z.array(z.string()),
    goals: z.string(),
    bannerImageDesktop: z.string().optional(),
    bannerImageMobile: z.string().optional(),
  }),
  z.object({
    type: z.literal("showcase"),
    label: z.string().optional(),
    dark: z.boolean().optional(),
    /** Если задано — фон секции (та же логика, что баннер hero услуги) */
    imageUrl: z.string().optional(),
  }),
  z.object({
    type: z.literal("textBlock"),
    leftText: z.string(),
    rightText: z.string(),
    accent: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("pain"),
    title: z.string(),
    points: z.array(z.string()),
    conclusion: z.string(),
  }),
  z.object({
    type: z.literal("advantages"),
    title: z.string(),
    items: z.array(
      z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ),
  }),
  z.object({
    type: z.literal("steps"),
    title: z.string(),
    steps: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
  }),
  z.object({
    type: z.literal("faq"),
    serviceKey: z.string(),
    items: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
]);

export type ServiceLandingSection = z.infer<typeof serviceLandingSectionSchema>;

export const serviceLandingDocumentSchema = z.object({
  sections: z.array(serviceLandingSectionSchema),
});

export type ServiceLandingDocument = z.infer<typeof serviceLandingDocumentSchema>;

export function parseServiceLandingDocument(raw: unknown): ServiceLandingDocument | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object") return null;
  const sectionsUnknown = (raw as { sections?: unknown }).sections;
  if (!Array.isArray(sectionsUnknown)) return null;

  const sections: ServiceLandingSection[] = [];
  for (const item of sectionsUnknown) {
    const r = serviceLandingSectionSchema.safeParse(item);
    if (r.success) sections.push(r.data);
  }
  if (sections.length === 0) return null;
  return { sections };
}
