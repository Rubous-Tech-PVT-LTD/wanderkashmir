const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== RUNNING MIGRATION ===\n");

  await prisma.$transaction(async (tx) => {

    // ── STEP 1: Update Place slugs ──────────────────────────────────────────
    const dalLake = await tx.place.update({
      where: { slug: "dal-lake-srinagar" },
      data: { slug: "dal-lake" },
      select: { id: true, name: true, slug: true, status: true }
    });
    console.log(`Updated Place: ${dalLake.name} → slug="${dalLake.slug}"`);

    const betaabValley = await tx.place.update({
      where: { slug: "betaab-valley-pahalgam" },
      data: { slug: "betaab-valley" },
      select: { id: true, name: true, slug: true, status: true }
    });
    console.log(`Updated Place: ${betaabValley.name} → slug="${betaabValley.slug}"`);

    const aruValley = await tx.place.update({
      where: { slug: "aru-valley-pahalgam" },
      data: { slug: "aru-valley" },
      select: { id: true, name: true, slug: true, status: true }
    });
    console.log(`Updated Place: ${aruValley.name} → slug="${aruValley.slug}"`);

    // ── STEP 2: Depublish old top-level SeoLandingPage records ─────────────
    // Set workflowState = DRAFT (existing enum value in SeoWorkflowState)
    // DRAFT is not publicly served — the destinations pages filter by PUBLISHED only
    const depubDalLake = await tx.seoLandingPage.update({
      where: { slug: "dal-lake" },
      data: { workflowState: "DRAFT" },
      select: { id: true, slug: true, workflowState: true }
    });
    console.log(`Depublished SeoLandingPage: ${depubDalLake.slug} → state=${depubDalLake.workflowState}`);

    const depubBetaab = await tx.seoLandingPage.update({
      where: { slug: "betaab-valley" },
      data: { workflowState: "DRAFT" },
      select: { id: true, slug: true, workflowState: true }
    });
    console.log(`Depublished SeoLandingPage: ${depubBetaab.slug} → state=${depubBetaab.workflowState}`);

    const depubAru = await tx.seoLandingPage.update({
      where: { slug: "aru-valley" },
      data: { workflowState: "DRAFT" },
      select: { id: true, slug: true, workflowState: true }
    });
    console.log(`Depublished SeoLandingPage: ${depubAru.slug} → state=${depubAru.workflowState}`);
  });

  console.log("\n=== MIGRATION COMPLETE — RUNNING POST-MIGRATION VERIFICATION ===\n");

  // ── POST-MIGRATION VERIFICATION ────────────────────────────────────────────

  // 1. Verify Place slugs are now clean
  const places = await prisma.place.findMany({
    where: { slug: { in: ["dal-lake", "betaab-valley", "aru-valley"] } },
    select: { id: true, name: true, slug: true, status: true, destination: true }
  });
  console.log("Verified Place records (clean slugs):");
  places.forEach(p => console.log(`  ✓ slug=${p.slug} | id=${p.id} | name=${p.name} | status=${p.status} | destination=${p.destination}`));

  // 2. Verify old slugs no longer exist
  const oldSlugCheck = await prisma.place.findMany({
    where: { slug: { in: ["dal-lake-srinagar", "betaab-valley-pahalgam", "aru-valley-pahalgam"] } },
    select: { slug: true }
  });
  console.log(`\nOld slug existence check (must be 0): ${oldSlugCheck.length} found`);

  // 3. Verify SeoLandingPages are now DRAFT
  const seoPages = await prisma.seoLandingPage.findMany({
    where: { slug: { in: ["dal-lake", "betaab-valley", "aru-valley"] } },
    select: { slug: true, workflowState: true }
  });
  console.log("\nVerified SeoLandingPage states:");
  seoPages.forEach(p => console.log(`  ✓ ${p.slug} → ${p.workflowState}`));

  // 4. Verify DestinationPlace links remain intact with new slugs
  const dpLinks = await prisma.destinationPlace.findMany({
    where: {
      OR: [
        { destination: { slug: "srinagar" }, place: { slug: "dal-lake" } },
        { destination: { slug: "pahalgam" }, place: { slug: "betaab-valley" } },
        { destination: { slug: "pahalgam" }, place: { slug: "aru-valley" } },
      ]
    },
    include: {
      destination: { select: { slug: true } },
      place: { select: { slug: true, name: true, status: true } }
    }
  });
  console.log("\nVerified DestinationPlace links (must be 3):");
  dpLinks.forEach(dp => console.log(`  ✓ ${dp.destination.slug} → ${dp.place.name} (${dp.place.slug}) | order=${dp.displayOrder}`));

  // 5. Verify srinagar/pahalgam parent pages are still PUBLISHED
  const parents = await prisma.seoLandingPage.findMany({
    where: { slug: { in: ["srinagar", "pahalgam"] } },
    select: { slug: true, workflowState: true }
  });
  console.log("\nParent destinations (must be PUBLISHED):");
  parents.forEach(p => console.log(`  ✓ ${p.slug} → ${p.workflowState}`));

  const success = (
    places.length === 3 &&
    oldSlugCheck.length === 0 &&
    seoPages.every(p => p.workflowState === "DRAFT") &&
    dpLinks.length === 3 &&
    parents.every(p => p.workflowState === "PUBLISHED")
  );
  console.log(`\n=== MIGRATION VERIFIED: ${success} ===`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });