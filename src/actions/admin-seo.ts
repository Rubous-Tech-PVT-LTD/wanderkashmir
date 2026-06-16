"use server";

export async function triggerSeoGeneration() {
  try {
    // We call the API route locally but pass the CRON_SECRET from the server environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wanderkashmir.com";
    const res = await fetch(`${baseUrl}/api/cron/generate-seo`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to trigger generation");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Manual Trigger Error:", error);
    return { success: false, error: error.message };
  }
}
