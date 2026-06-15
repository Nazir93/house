import { PrismaClient } from "@prisma/client";

const slug = process.argv[2] ?? "tillit";
const prisma = new PrismaClient();

prisma.houseProject
  .findUnique({
    where: { slug },
    select: {
      title: true,
      media: { orderBy: [{ type: "asc" }, { order: "asc" }], select: { type: true, url: true, label: true } },
    },
  })
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .finally(() => prisma.$disconnect());
