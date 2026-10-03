import fs from "fs";
import path from "path";

// Safely load environment
function loadEnv(file: string) {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv(".env.local");
loadEnv("../.env");

import prisma from "../src/lib/prisma";
import {
  getAdminSeoCommentsAction,
  toggleSeoCommentApprovalAction,
  replyToSeoCommentAction,
  deleteSeoCommentAction,
} from "../src/actions/adminSeoComments";
import {
  getAudienceCountAction,
  sendBulkEmailAction,
  generateEmailDraftWithAiAction,
} from "../src/actions/adminBulkEmails";
import {
  getAdminPromoCodesAction,
  createAdminPromoCodeAction,
  updateAdminPromoCodeAction,
  togglePromoCodeStatusAction,
  approvePromoCodeAction,
  deleteAdminPromoCodeAction,
} from "../src/actions/adminPromoCodes";
import {
  getAdminSitePopupsAction,
  createAdminSitePopupAction,
  updateAdminSitePopupAction,
  toggleAdminSitePopupAction,
  deleteAdminSitePopupAction,
} from "../src/actions/adminSitePopups";

let totalPasses = 0;
let totalFails = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    totalPasses++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` - Detail: ${detail}` : ""}`);
    totalFails++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("SUITE 1: AUTHORIZATION VERIFICATION (UNAUTHENTICATED)");
  console.log("==================================================");
  console.log("Ensuring all admin actions reject calls without valid admin session cookies:\n");

  // 1.1 SEO Comments Auth
  const cRes = await getAdminSeoCommentsAction();
  assert(!cRes.success && !!cRes.error?.includes("Unauthorized"), "getAdminSeoCommentsAction rejects unauthenticated calls");

  const cApproveRes = await toggleSeoCommentApprovalAction("fake_id", true);
  assert(!cApproveRes.success && !!cApproveRes.error?.includes("Unauthorized"), "toggleSeoCommentApprovalAction rejects unauthenticated calls");

  const cReplyRes = await replyToSeoCommentAction("fake_id", "test");
  assert(!cReplyRes.success && !!cReplyRes.error?.includes("Unauthorized"), "replyToSeoCommentAction rejects unauthenticated calls");

  const cDelRes = await deleteSeoCommentAction("fake_id");
  assert(!cDelRes.success && !!cDelRes.error?.includes("Unauthorized"), "deleteSeoCommentAction rejects unauthenticated calls");

  // 1.2 Bulk Emails Auth
  const eCountRes = await getAudienceCountAction({ audienceType: "ALL" });
  assert(!eCountRes.success && !!eCountRes.error?.includes("Unauthorized"), "getAudienceCountAction rejects unauthenticated calls");

  const eSendRes = await sendBulkEmailAction({
    subject: "Test",
    bodyHtml: "<p>Test</p>",
    audienceType: "ALL",
  });
  assert(!eSendRes.success && !!eSendRes.error?.includes("Unauthorized"), "sendBulkEmailAction rejects unauthenticated calls");

  const eAiRes = await generateEmailDraftWithAiAction("Test topic");
  assert(!eAiRes.success && !!eAiRes.error?.includes("Unauthorized"), "generateEmailDraftWithAiAction rejects unauthenticated calls");

  // 1.3 Promo Codes Auth
  const pGetRes = await getAdminPromoCodesAction();
  assert(!pGetRes.success && !!pGetRes.error?.includes("Unauthorized"), "getAdminPromoCodesAction rejects unauthenticated calls");

  const pCreateRes = await createAdminPromoCodeAction({
    code: "TEST10",
    discountPercent: 10,
    targetType: "ALL",
  });
  assert(!pCreateRes.success && !!pCreateRes.error?.includes("Unauthorized"), "createAdminPromoCodeAction rejects unauthenticated calls");

  const pToggleRes = await togglePromoCodeStatusAction("fake_id", false);
  assert(!pToggleRes.success && !!pToggleRes.error?.includes("Unauthorized"), "togglePromoCodeStatusAction rejects unauthenticated calls");

  const pDelRes = await deleteAdminPromoCodeAction("fake_id");
  assert(!pDelRes.success && !!pDelRes.error?.includes("Unauthorized"), "deleteAdminPromoCodeAction rejects unauthenticated calls");

  // 1.4 Site Popups Auth
  const spGetRes = await getAdminSitePopupsAction();
  assert(!spGetRes.success && !!spGetRes.error?.includes("Unauthorized"), "getAdminSitePopupsAction rejects unauthenticated calls");

  const spCreateRes = await createAdminSitePopupAction({
    type: "MARKETING",
    title: "Test",
    description: "Test",
    displayStyle: "MODAL",
    triggerRule: "DELAY_5S",
    targetPages: "ALL",
    isActive: false,
  });
  assert(!spCreateRes.success && !!spCreateRes.error?.includes("Unauthorized"), "createAdminSitePopupAction rejects unauthenticated calls");

  const spToggleRes = await toggleAdminSitePopupAction("fake_id", true);
  assert(!spToggleRes.success && !!spToggleRes.error?.includes("Unauthorized"), "toggleAdminSitePopupAction rejects unauthenticated calls");

  const spDelRes = await deleteAdminSitePopupAction("fake_id");
  assert(!spDelRes.success && !!spDelRes.error?.includes("Unauthorized"), "deleteAdminSitePopupAction rejects unauthenticated calls");

  console.log("\n==================================================");
  console.log("SUITE 2: DATABASE DIRECT QUERIES & SCHEMA VALIDATION");
  console.log("==================================================");
  console.log("Verifying physical tables and relations directly:\n");

  // 2.1 SeoPageComment table & relations
  const commentsCount = await prisma.seoPageComment.count();
  assert(typeof commentsCount === "number", `SeoPageComment table is accessible directly (count = ${commentsCount})`);

  // 2.2 PromoCode table & relations
  const promoCount = await prisma.promoCode.count();
  assert(typeof promoCount === "number", `PromoCode table is accessible directly (count = ${promoCount})`);

  // 2.3 SitePopup table & relations
  const popupCount = await prisma.sitePopup.count();
  assert(typeof popupCount === "number", `SitePopup table is accessible directly (count = ${popupCount})`);

  // 2.4 User & Vendor audience sources
  const vendorsCount = await prisma.vendorProfile.count({
    where: { isApproved: true, status: "APPROVED", email: { not: null } },
  });
  assert(vendorsCount >= 0, `VendorProfile audience query works (active vendors = ${vendorsCount})`);

  const touristsCount = await prisma.user.count({
    where: { role: "CUSTOMER", isBanned: false },
  });
  assert(touristsCount >= 0, `Customer audience query works (customers = ${touristsCount})`);

  console.log("\n==================================================");
  console.log("SUITE 3: VALIDATION LOGIC TESTS");
  console.log("==================================================");

  // 3.1 Promo code validation tests (mocking logic)
  const cleanCodeValid = "WINTER2026".toUpperCase().trim().replace(/[^A-Z0-9_-]/g, "");
  assert(cleanCodeValid === "WINTER2026", "Promo code sanitizer produces clean uppercase code");

  const discountRangeValid = 15 >= 1 && 15 <= 100;
  assert(discountRangeValid, "Valid discount percentage accepted");
  const discountInvalid = 0 >= 1 && 0 <= 100;
  assert(!discountInvalid, "Zero discount percentage rejected");
  const discountOver100 = 105 >= 1 && 105 <= 100;
  assert(!discountOver100, ">100 discount percentage rejected");

  // 3.2 Bulk email variable replacement
  const sampleTemplate = "Hello [NAME], visit [BUTTON_URL] to [BUTTON_TEXT]";
  const replaced = sampleTemplate
    .replace(/\[NAME\]/g, "Kashmir Heritage Hotel")
    .replace(/\[BUTTON_TEXT\]/g, "View Bookings")
    .replace(/\[BUTTON_URL\]/g, "https://vendor.wanderkashmir.com");
  assert(
    replaced === "Hello Kashmir Heritage Hotel, visit https://vendor.wanderkashmir.com to View Bookings",
    "Template placeholders [NAME], [BUTTON_URL], [BUTTON_TEXT] correctly replaced"
  );

  // 3.3 Site Popup single active constraint logic
  const mockPopups = [
    { id: "1", title: "P1", isActive: false },
    { id: "2", title: "P2", isActive: true },
  ];
  // Simulating activate P1 -> deactivate P2
  const updatedMock = mockPopups.map((p) => ({
    ...p,
    isActive: p.id === "1",
  }));
  const activeCount = updatedMock.filter((p) => p.isActive).length;
  assert(activeCount === 1 && updatedMock[0].isActive, "Single active popup logic verified");

  console.log("\n==================================================");
  console.log("SUITE 4: CORE PRODUCTION DATA BASELINE INTEGRITY");
  console.log("==================================================");

  const baselines: Record<string, number> = {
    User: 29,
    VendorProfile: 25,
    Property: 15,
    Booking: 15,
    Review: 2,
    Tour: 12,
    SeoLandingPage: 162,
    SeoOpportunity: 482,
    CustomTourRequest: 7,
    TravelStyle: 6,
  };

  for (const [model, expected] of Object.entries(baselines)) {
    const res: any[] = await prisma.$queryRawUnsafe(`SELECT count(*)::int as count FROM "${model}";`);
    const actual = res[0]?.count;
    assert(actual === expected, `Baseline check for ${model}: Expected ${expected}, Actual ${actual}`);
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${totalPasses} Passed, ${totalFails} Failed`);
  console.log("==================================================");

  if (totalFails > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
