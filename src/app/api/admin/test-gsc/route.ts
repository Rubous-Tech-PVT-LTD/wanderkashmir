import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getGscConnectionDiagnostics } from "@/lib/gsc-client";

export async function GET() {
  const session = await getAdminSession();
  
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const diagnostics = await getGscConnectionDiagnostics();

    // Map to structured PASS/FAIL diagnostic checks
    const hasOAuth = diagnostics.oauthConfig.clientIdPresent && diagnostics.oauthConfig.clientSecretPresent;
    const hasToken = diagnostics.tokenStatus.tokenPresent && diagnostics.tokenStatus.decryptionSuccess;
    const hasScope = diagnostics.accountIdentity.scopes.some(s => s.includes("webmasters"));
    const hasPropertyAccess = ["siteOwner", "siteFullUser", "siteRestrictedUser"].includes(diagnostics.property.permissionLevel);
    const searchAnalyticsPass = diagnostics.searchAnalytics.httpStatus === 200;

    // Mask account email safely (e.g. j***n@gmail.com)
    let maskedAccount = diagnostics.accountIdentity.authenticatedEmail;
    if (maskedAccount && maskedAccount.includes("@")) {
      const [local, domain] = maskedAccount.split("@");
      const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}***`;
      maskedAccount = `${maskedLocal}@${domain}`;
    }

    const testMatrix = {
      googleOAuth: hasOAuth ? "PASS" : "FAIL",
      refreshToken: hasToken ? (diagnostics.tokenStatus.refreshSuccess ? "PASS" : "FAIL") : "FAIL",
      searchConsoleScope: hasScope ? "PASS" : "FAIL",
      authenticatedAccount: maskedAccount || "Unknown",
      property: diagnostics.property.configuredUrl,
      propertyPermissionLevel: diagnostics.property.permissionLevel,
      propertyAccess: hasPropertyAccess ? "PASS" : "FAIL",
      searchAnalyticsApi: searchAnalyticsPass ? "PASS" : "FAIL",
      rowsReturned: diagnostics.searchAnalytics.rowsCount,
      dateRange: diagnostics.searchAnalytics.dateRange,
    };

    return NextResponse.json({
      success: diagnostics.overallStatus === "SUCCESS_WITH_DATA" || diagnostics.overallStatus === "SUCCESS_NO_DATA",
      status: diagnostics.overallStatus,
      message: diagnostics.userFriendlyMessage,
      matrix: testMatrix,
      rawDiagnostics: diagnostics,
    });
  } catch (error: any) {
    console.error("Test GSC Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        status: "API_ERROR",
        error: "Failed to run GSC connection diagnostics",
        details: error.message,
      }, 
      { status: 500 }
    );
  }
}
