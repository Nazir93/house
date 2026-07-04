import type { BuiltObjectSiteStatus, Prisma } from "@prisma/client";
import type { BuiltObjectMaterial } from "@prisma/client";
import {
  getTopLevelStages,
  isStageSubtreeComplete,
  type ClientStageNode,
} from "@/lib/client-project-stage-status";
import { buildBuiltObjectLocationFieldsFromInputs } from "@/lib/built-object-location-from-coords";
import { generateSlug } from "@/lib/utils";
import { normalizeWallMaterialLabel } from "@/lib/client-project-wall-materials";

export type ClientProjectPublicSiteInput = {
  id: string;
  title: string;
  contractNumber: string;
  area: number | null;
  wallMaterial: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  houseProjectId: string | null;
  showOnPublicSite: boolean;
  builtObjectId: string | null;
  stages: ClientStageNode[];
};

export function mapClientWallMaterialToBuiltObject(material: string | null | undefined): BuiltObjectMaterial {
  const m = normalizeWallMaterialLabel(material || "").toLowerCase();
  if (m.includes("газобетон") || m.includes("пеноблок")) return "GAS_BLOCK";
  if (m.includes("кирпич")) return "BRICK";
  if (m.includes("керам")) return "CERAMIC_BLOCK";
  if (m.includes("каркас")) return "FRAME";
  return "OTHER";
}

/** Статус на сайте: все верхнеуровневые этапы сданы → готов, иначе строится. */
export function resolvePublicSiteStatusFromStages(stages: ClientStageNode[]): BuiltObjectSiteStatus {
  const top = getTopLevelStages(stages);
  if (top.length === 0) return "UNDER_CONSTRUCTION";
  const allDone = top.every((s) => isStageSubtreeComplete(s.id, stages));
  return allDone ? "COMPLETED" : "UNDER_CONSTRUCTION";
}

export function buildClientProjectPublicSiteSlug(title: string, contractNumber: string, fallbackId: string): string {
  const base = generateSlug(title.trim() || contractNumber.trim() || fallbackId);
  return base || `object-${fallbackId.slice(0, 8)}`;
}

async function ensureUniqueSlug(tx: Prisma.TransactionClient, baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let n = 2;
  while (true) {
    const clash = await tx.builtObject.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === excludeId) return slug;
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
}

async function syncCoverMedia(
  tx: Prisma.TransactionClient,
  builtObjectId: string,
  coverImageUrl: string | null
) {
  await tx.builtObjectMedia.deleteMany({
    where: { builtObjectId, type: "RENDER" },
  });
  if (!coverImageUrl?.trim()) return;
  await tx.builtObjectMedia.create({
    data: {
      builtObjectId,
      type: "RENDER",
      url: coverImageUrl.trim(),
      alt: "",
      order: 0,
    },
  });
}

/** Создаёт или обновляет BuiltObject при публикации проекта в ЛК. */
export async function syncClientProjectPublicSite(
  tx: Prisma.TransactionClient,
  input: ClientProjectPublicSiteInput
): Promise<string | null> {
  if (!input.showOnPublicSite) {
    if (input.builtObjectId) {
      await tx.builtObject.update({
        where: { id: input.builtObjectId },
        data: { published: false },
      });
    }
    return input.builtObjectId;
  }

  const siteStatus = resolvePublicSiteStatusFromStages(input.stages);
  const material = mapClientWallMaterialToBuiltObject(input.wallMaterial);
  const locationPatch =
    input.latitude != null && input.longitude != null
      ? buildBuiltObjectLocationFieldsFromInputs(String(input.latitude), String(input.longitude))
      : null;

  const description =
    siteStatus === "COMPLETED"
      ? `<p>Дом сдан. Договор ${input.contractNumber}.</p>`
      : `<p>Объект в работе. Договор ${input.contractNumber}.</p>`;

  const commonData = {
    title: input.title.trim() || `Объект ${input.contractNumber}`,
    material,
    area: input.area,
    location: input.location?.trim() || input.title.trim() || null,
    latitude: input.latitude,
    longitude: input.longitude,
    regionSlug: locationPatch?.regionSlug ?? null,
    district: locationPatch?.district ?? null,
    siteStatus,
    houseProjectId: input.houseProjectId,
    description,
    published: true,
  };

  if (input.builtObjectId) {
    const existing = await tx.builtObject.findUnique({
      where: { id: input.builtObjectId },
      select: { published: true },
    });
    const updated = await tx.builtObject.update({
      where: { id: input.builtObjectId },
      data: {
        ...commonData,
        ...(!existing?.published ? { sitePublishedAt: new Date() } : {}),
      },
    });
    await syncCoverMedia(tx, updated.id, input.coverImageUrl);
    return updated.id;
  }

  const slug = await ensureUniqueSlug(
    tx,
    buildClientProjectPublicSiteSlug(input.title, input.contractNumber, input.id)
  );
  const created = await tx.builtObject.create({
    data: {
      slug,
      ...commonData,
      sitePublishedAt: new Date(),
    },
  });
  await syncCoverMedia(tx, created.id, input.coverImageUrl);
  await tx.clientConstructionProject.update({
    where: { id: input.id },
    data: { builtObjectId: created.id },
  });
  return created.id;
}
