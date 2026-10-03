import { getAdminSeoCommentsAction } from "@/actions/adminSeoComments";
import SeoCommentsClient from "@/components/admin/seoComments/SeoCommentsClient";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: "ALL" | "APPROVED" | "PENDING";
  }>;
}

export const metadata = {
  title: "SEO Comments Moderation | WanderKashmir Admin",
};

export default async function AdminSeoCommentsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10) || 1;
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "ALL";

  const res = await getAdminSeoCommentsAction({
    page,
    limit: 20,
    search,
    status,
  });

  const comments = res.data?.comments || [];
  const total = res.data?.total || 0;
  const totalPages = res.data?.totalPages || 1;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <SeoCommentsClient
        initialComments={comments}
        total={total}
        totalPages={totalPages}
        currentPage={page}
        currentSearch={search}
        currentStatus={status}
      />
    </div>
  );
}
