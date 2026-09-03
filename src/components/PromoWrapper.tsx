import { getHomepagePromos } from "@/actions/promo-codes";
import PromoPopup from "@/components/PromoPopup";

export default async function PromoWrapper() {
  const activePromosRes = await getHomepagePromos();

  if (!activePromosRes.success || !activePromosRes.promos || activePromosRes.promos.length === 0) {
    return null;
  }

  return <PromoPopup promos={activePromosRes.promos} />;
}
