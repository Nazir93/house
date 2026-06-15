import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const id = process.argv[2];
const q = id
  ? prisma.lead.findUnique({ where: { id }, select: { id: true, proposalStatus: true, proposalPath: true, proposalError: true, proposalFilename: true, source: true, createdAt: true } })
  : prisma.lead.findFirst({
      where: { source: { in: ["project-calculator", "project-calculator-test"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, proposalStatus: true, proposalPath: true, proposalError: true, proposalFilename: true, source: true, createdAt: true },
    });

q.then((r) => {
  console.log(JSON.stringify(r, null, 2));
})
  .finally(() => prisma.$disconnect());
