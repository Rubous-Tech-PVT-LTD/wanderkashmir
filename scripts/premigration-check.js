const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== PRE-MIGRATION SAFETY CHECK ===\n");

  // 1. Verify target SeoLandingPages (to be depublished)
  const seoPages = await prisma.seoLandingPage.findMany({
    where: { slug: { in: ["dal-lake", "betaab-valley", "aru-valley"] } },
    select: { id: true, slug: true, type: true, workflowState: true }
  });
  console.log("SeoLandingPages to depublish:");
  seoPages.forEach(p => console.log(`  ${p.slug} | id=${p.id} | type=${p.type} | state=${p.workflowState}`));

  // 2. Verify parent destinations exist and are PUBLISHED
  const parents = await prisma.seoLandingPage.findMany({
    where: { slug: { in: ["srinagar", "pahalgam"] }, type: "DESTINATION", workflowState: "PUBLISHED" }
  });
  console.log("\nParent destinations (must be PUBLISHED):");
  parents.forEach(p => console.log(`  ${p.slug} | state=${p.workflowState} ✓`));

  // 3. Verify Place records exist (do NOT duplicate)
  const places = await prisma.place.findMany({
    where: { slug: { in: ["dal-lake-srinagar", "betaab-valley-pahalgam", "aru-valley-pahalgam"] } },
    select: { id: true, name: true, slug: true, status: true, destination: true }
  });
  console.log("\nExisting Place records:");
  places.forEach(p => console.log(`  id=${p.id} | slug=${p.slug} | name=${p.name} | status=${p.status}`));

  // 4. Check whether CLEAN slugs are already taken (collision check)
  const cleanSlugs = ["dal-lake", "betaab-valley", "aru-valley"];
  const existingWithCleanSlug = await prisma.place.findMany({
    where: { slug: { in: cleanSlugs } },
    select: { id: true, name: true, slug: true }
  });
  console.log("\nClean slug collision check (must be EMPTY):");
  if (existingWithCleanSlug.length === 0) {
    console.log("  CLEAR — no Place records with clean slugs exist");
  } else {
    existingWithCleanSlug.forEach(p => console.log(`  COLLISION: id=${p.id} slug=${p.slug} name=${p.name}`));
  }

  // 5. Verify DestinationPlace links
  const destPlaces = await prisma.destinationPlace.findMany({
    where: {
      OR: [
        { destination: { slug: "srinagar" }, place: { slug: "dal-lake-srinagar" } },
        { destination: { slug: "pahalgam" }, place: { slug: "betaab-valley-pahalgam" } },
        { destination: { slug: "pahalgam" }, place: { slug: "aru-valley-pahalgam" } },
      ]
    },
    include: {
      destination: { select: { slug: true, workflowState: true } },
      place: { select: { slug: true, name: true, status: true } }
    }
  });
  console.log("\nDestinationPlace links:");
  destPlaces.forEach(dp => console.log(`  ${dp.destination.slug} → ${dp.place.name} (${dp.place.slug}) | displayOrder=${dp.displayOrder}`));

  const safeToMigrate = (
    seoPages.length === 3 &&
    parents.length === 2 &&
    places.length === 3 &&
    existingWithCleanSlug.length === 0 &&
    destPlaces.length === 3
  );
  console.log(`\n=== SAFE TO MIGRATE: ${safeToMigrate} ===`);

  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });