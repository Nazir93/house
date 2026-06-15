import { PrismaClient } from "@prisma/client";
import { generateLeadProposalPdf } from "../src/lib/proposal/proposal-service";

async function main() {
  const prisma = new PrismaClient();
  try {
    const project = await prisma.houseProject.findFirst({
      where: {
        OR: [
          { slug: { contains: "braun", mode: "insensitive" } },
          { title: { contains: "Браун", mode: "insensitive" } },
          { title: { contains: "Вавил", mode: "insensitive" } },
        ],
      },
      select: { slug: true, title: true, area: true, calculatorCategory: true },
      orderBy: { updatedAt: "desc" },
    });

    const picked =
      project ??
      (await prisma.houseProject.findFirst({
        select: { slug: true, title: true, area: true, calculatorCategory: true },
        orderBy: { updatedAt: "desc" },
      }));

    if (!picked) {
      console.error("No house project in DB");
      process.exit(1);
    }

    const calcData = {
      kind: "house-project-quote" as const,
      projectSlug: picked.slug,
      projectTitle: picked.title,
      area: picked.area,
      categoryId: picked.calculatorCategory ?? "a",
      tierId: "gas",
      tierLabel: "Газоблок",
      facadeSlug: null,
      engineeringSlugs: ["electric", "water", "sewer", "bio", "heatedFloor", "boiler"],
      constructionSlugs: ["drainage", "roof_insulation_250"],
      grandTotalRub: 0,
    };

    const lead = await prisma.lead.create({
      data: {
        name: "Тест PDF",
        phone: "+79990001122",
        source: "project-calculator-test",
        calcData,
        proposalStatus: "PENDING",
      },
    });

    console.log("project:", picked.slug, picked.title);
    console.log("leadId:", lead.id);

    await generateLeadProposalPdf({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      calcData,
      createdAt: lead.createdAt,
    });

    const updated = await prisma.lead.findUnique({
      where: { id: lead.id },
      select: {
        proposalStatus: true,
        proposalPath: true,
        proposalError: true,
        proposalFilename: true,
      },
    });
    console.log("result:", JSON.stringify(updated, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
