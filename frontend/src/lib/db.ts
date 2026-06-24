import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function withConnectionLimit(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT?.trim() || "5");
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const databaseUrl = process.env.DATABASE_URL ? withConnectionLimit(process.env.DATABASE_URL) : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl
      ? {
          datasources: { db: { url: databaseUrl } },
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
