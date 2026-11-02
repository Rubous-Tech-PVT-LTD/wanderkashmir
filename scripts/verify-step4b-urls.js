const http = require('http');

const PORT = 3000;
const BASE_ORIGIN = `http://localhost:${PORT}`;

function fetchInfo(path) {
  return new Promise((resolve) => {
    http.get(`${BASE_ORIGIN}${path}`, { headers: { 'User-Agent': 'VerificationBot/1.0' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        // extract canonical if present
        const canonicalMatch = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
          || body.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
        const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
        resolve({
          statusCode: res.statusCode,
          location: res.headers.location || null,
          canonical: canonicalMatch ? canonicalMatch[1] : null,
          title: titleMatch ? titleMatch[1] : null,
        });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 'ERROR', error: err.message });
    });
  });
}

async function run() {
  console.log('=== STEP 4B COMPREHENSIVE URL VERIFICATION ===\n');

  console.log('--- 1. OLD REDIRECT TESTS ---');
  const redirects = [
    { from: '/destinations/dal-lake', expectedTarget: '/destinations/srinagar/dal-lake' },
    { from: '/destinations/betaab-valley', expectedTarget: '/destinations/pahalgam/betaab-valley' },
    { from: '/destinations/aru-valley', expectedTarget: '/destinations/pahalgam/aru-valley' },
  ];

  for (const r of redirects) {
    const res = await fetchInfo(r.from);
    const pass = (res.statusCode === 301 || res.statusCode === 308) && res.location === r.expectedTarget;
    console.log(`${r.from}:`);
    console.log(`  Status: ${res.statusCode} (Expected: 301 or 308)`);
    console.log(`  Location: ${res.location} (Expected: ${r.expectedTarget})`);
    console.log(`  Result: ${pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
  }

  console.log('--- 2. NEW ENTITY URL TESTS ---');
  const newUrls = [
    '/destinations/srinagar/dal-lake',
    '/destinations/pahalgam/betaab-valley',
    '/destinations/pahalgam/aru-valley',
  ];

  for (const url of newUrls) {
    const res = await fetchInfo(url);
    const pass = res.statusCode === 200;
    console.log(`${url}:`);
    console.log(`  Status: ${res.statusCode} (Expected: 200)`);
    console.log(`  Title: ${res.title}`);
    console.log(`  Canonical: ${res.canonical}`);
    console.log(`  Result: ${pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
  }

  console.log('--- 3. WRONG-PARENT TESTS ---');
  const wrongParents = [
    { url: '/destinations/pahalgam/dal-lake', desc: 'Dal Lake under Pahalgam' },
    { url: '/destinations/srinagar/betaab-valley', desc: 'Betaab Valley under Srinagar' },
    { url: '/destinations/srinagar/aru-valley', desc: 'Aru Valley under Srinagar' },
  ];

  for (const wp of wrongParents) {
    const res = await fetchInfo(wp.url);
    const pass = res.statusCode === 404;
    console.log(`${wp.desc} (${wp.url}):`);
    console.log(`  Status: ${res.statusCode} (Expected: 404)`);
    console.log(`  Result: ${pass ? 'PASS ✓' : 'FAIL ✗'}\n`);
  }
}

run().catch(console.error);
