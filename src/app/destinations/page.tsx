import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { getValidImageUrl } from "@/lib/imageUtils";

// Revalidate occasionally, or make it dynamic
export const dynamic = 'force-dynamic';

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam = resolvedParams.page;
  const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const itemsPerPage = 24;

  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const skip = (validPage - 1) * itemsPerPage;

  const [routes, totalCount] = await Promise.all([
    prisma.seoLandingPage.findMany({
      skip,
      take: itemsPerPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.seoLandingPage.count(),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="bg-white min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-bold text-slate-900">All Destinations & Routes</h1>
          <p className="mt-4 text-lg text-slate-500 max-w-3xl">
            Explore our complete collection of travel routes, homestays, and tour packages across the beautiful valleys of Kashmir.
          </p>
        </div>

        {routes.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-slate-600">No destinations found.</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {routes.map((route) => {
                const getBasePath = (type: string) => {
                  switch (type) {
                    case "BLOG": return "blogs";
                    case "HOMESTAY": return "homestays";
                    case "DESTINATION": return "destinations";
                    case "TOUR": return "tours";
                    case "TAXI": return "taxis";
                    default: return type ? `${type.toLowerCase()}s` : "tours";
                  }
                };
                const basePath = getBasePath(route.type);
                
                return (
                  <Link
                    key={route.id}
                    href={`/${basePath}/${route.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 hover:border-[#f97316]/30 hover:shadow-xl hover:shadow-[#f97316]/10 bg-white transition-all duration-300 h-full"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      {route.imageUrl ? (
                        <Image
                          src={getValidImageUrl([route.imageUrl])}
                          alt={route.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="text-xs font-semibold tracking-wider text-[#f97316] mb-2 uppercase">
                        {route.type}
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-[#f97316] transition-colors line-clamp-2 mb-3">
                        {route.title}
                      </h3>
                      <div className="mt-auto flex items-center text-sm font-medium text-[#f97316]">
                        Read more
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2 border-t border-slate-100 pt-8">
                <Link
                  href={`/destinations?page=${validPage - 1}`}
                  className={`p-2 rounded-full border ${
                    validPage <= 1
                      ? "border-slate-200 text-slate-300 pointer-events-none"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  aria-disabled={validPage <= 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                
                <span className="text-sm font-medium text-slate-600 mx-4">
                  Page {validPage} of {totalPages}
                </span>

                <Link
                  href={`/destinations?page=${validPage + 1}`}
                  className={`p-2 rounded-full border ${
                    validPage >= totalPages
                      ? "border-slate-200 text-slate-300 pointer-events-none"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  aria-disabled={validPage >= totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
