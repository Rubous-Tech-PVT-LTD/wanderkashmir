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
            const basePath = route.type === "TAXI" ? "taxis" : route.type === "HOMESTAY" ? "homestays" : route.type === "BLOG" ? "blog" : "tours";
            return (
              <Link
                key={route.id}
                href={`/${basePath}/${route.slug}`}
                className="group p-4 rounded-2xl border border-slate-100 hover:border-[#0284c7]/30 hover:shadow-lg hover:shadow-[#0284c7]/5 bg-slate-50 hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 group-hover:text-[#0284c7] transition-colors text-sm line-clamp-2">
                    {route.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
