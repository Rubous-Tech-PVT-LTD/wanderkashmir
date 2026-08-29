import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function PopularSeoRoutes() {
  const routes = await prisma.seoLandingPage.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' }
  });

  if (routes.length === 0) return null;

  return (
    <div className="bg-white py-16 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Popular Routes & Destinations</h2>
          <p className="mt-2 text-slate-500">Discover top-rated cab routes, homestays, and tour packages in Kashmir.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                className="group p-4 rounded-2xl border border-slate-100 hover:border-[#f97316]/30 hover:shadow-lg hover:shadow-[#f97316]/5 bg-slate-50 hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 group-hover:text-[#f97316] transition-colors text-sm line-clamp-2">
                    {route.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-10 flex justify-center">
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#f97316] hover:bg-[#ea580c] shadow-sm hover:shadow-md transition-all"
          >
            View All Destinations
            <ArrowRight className="ml-2 -mr-1 w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
