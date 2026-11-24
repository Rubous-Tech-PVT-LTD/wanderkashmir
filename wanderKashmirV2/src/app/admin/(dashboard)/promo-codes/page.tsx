import { getAdminPromoCodesAction, getPromoTargetsAction } from "@/actions/adminPromoCodes";
import PromoCodesClient from "@/components/admin/promoCodes/PromoCodesClient";

export const metadata = {
  title: "Promo Codes & Discounts | WanderKashmir Admin",
};

export default async function AdminPromoCodesPage() {
  const [promosRes, targetsRes] = await Promise.all([
    getAdminPromoCodesAction(),
    getPromoTargetsAction(),
  ]);

  const promoCodes = promosRes.data?.promoCodes || [];
  const targets = targetsRes.data || { tours: [], properties: [], vehicles: [] };

  return <PromoCodesClient initialPromoCodes={promoCodes} targets={targets} />;
}
