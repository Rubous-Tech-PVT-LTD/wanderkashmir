"use server";

import { headers } from "next/headers";

export async function triggerSeoGeneration(topic?: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const url = new URL(`${baseUrl}/api/cron/generate-seo`);
    if (topic) url.searchParams.set("topic", topic);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to trigger SEO generation");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Manual Trigger Error:", error);
    return { success: false, error: error.message };
  }
}

export async function triggerBlogGeneration(topic?: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const url = new URL(`${baseUrl}/api/cron/generate-blog`);
    if (topic) url.searchParams.set("topic", topic);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || "Failed to trigger Blog generation");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Manual Blog Trigger Error:", error);
    return { success: false, error: error.message };
  }
}
