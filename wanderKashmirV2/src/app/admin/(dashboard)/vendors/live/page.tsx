import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminVendorsLiveRedirectPage() {
  const headerList = await headers();
  const base = headerList.get("x-admin-alias") === "wander-admin" ? "/wander-admin" : "/admin";
  redirect(`${base}/vendors?status=LIVE`);
}
