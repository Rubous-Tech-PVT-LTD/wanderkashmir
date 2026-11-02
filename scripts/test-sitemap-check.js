const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSitemap() {
  const baseUrl = 'https://www.wanderkashmir.com';

  const seoPages = await prisma.seoLandingPage.findMany({
    where: { workflowState: 'PUBLISHED' },
    select: { slug: true, type: true, updatedAt: true }
  });
  const seoUrls = seoPages.map(page => baseUrl + '/destinations/' + page.slug);

  const destinationPlaces = await prisma.destinationPlace.findMany({
    where: {
      destination: { workflowState: 'PUBLISHED', type: 'DESTINATION' },
      place: { status: 'ACTIVE' },
    },
    select: {
      updatedAt: true,
      destination: { select: { slug: true } },
      place: { select: { slug: true, updatedAt: true } },
    }
  });

  const placeUrls = destinationPlaces.map(dp => baseUrl + '/destinations/' + dp.destination.slug + '/' + dp.place.slug);

  console.log('--- Checking old top-level destination URLs in seoUrls ---');
  ['/destinations/dal-lake', '/destinations/betaab-valley', '/destinations/aru-valley'].forEach(u => {
    const found = seoUrls.some(su => su.endsWith(u));
    console.log(u, 'in seoUrls?', found ? 'FAIL (still present)' : 'PASS (removed)');
  });

  console.log('\n--- Checking new child entity URLs in placeUrls ---');
  [
    '/destinations/srinagar/dal-lake',
    '/destinations/pahalgam/betaab-valley',
    '/destinations/pahalgam/aru-valley'
  ].forEach(u => {
    const found = placeUrls.some(pu => pu.endsWith(u));
    console.log(u, 'in placeUrls?', found ? 'PASS (present)' : 'FAIL (missing)');
  });

  console.log('\nTotal placeUrls count:', placeUrls.length);
  console.log('Sample placeUrls:');
  placeUrls.slice(0, 5).forEach(p => console.log('  ', p));
}

testSitemap().catch(console.error).finally(() => process.exit(0));
