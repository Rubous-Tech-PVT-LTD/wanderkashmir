import prisma from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExperienceCard from "@/components/ExperienceCard";

export const metadata: Metadata = {
  title: "Kashmir Experiences & Activities | WanderKashmir",
  description: "Discover top-rated activities and experiences in Kashmir, from Shikara rides to Gondola tickets.",
  alternates: {
    canonical: "https://www.wanderkashmir.com/experiences",
  },
  openGraph: {
    title: "Kashmir Experiences & Activities | WanderKashmir",
    description: "Discover top-rated activities and experiences in Kashmir, from Shikara rides to Gondola tickets.",
    url: "https://www.wanderkashmir.com/experiences",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kashmir Experiences & Activities | WanderKashmir",
    description: "Discover top-rated activities and experiences in Kashmir, from Shikara rides to Gondola tickets.",
  },
};

export const revalidate = 60;

export default async function ExperiencesPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};
  const pageParam = resolvedSearchParams.page;
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const currentPage = isNaN(page) || page < 1 ? 1 : page;
  const take = 12;
  const skip = (currentPage - 1) * take;

  const [experiences, totalCount] = await Promise.all([
    prisma.experience.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.experience.count({
      where: { status: 'ACTIVE' },
    })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return (
    <main>
      <Navbar />
      
      <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
        <div className="container-custom py-8 md:py-12">
          {/* Minimal Hero */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Discover Kashmir Experiences
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl">
              Curated local activities, cultural immersions, and breathtaking sights to enhance your journey.
            </p>
          </div>

          {/* Grid */}
          {experiences.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {experiences.map((exp: (typeof experiences)[number]) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {currentPage > 1 && (
                    <Link
                      href={`/experiences?page=${currentPage - 1}`}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Link>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/experiences?page=${pageNum}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors font-semibold text-sm ${
                        currentPage === pageNum
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}

                  {currentPage < totalPages && (
                    <Link
                      href={`/experiences?page=${currentPage + 1}`}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Experiences will be added soon.</h2>
              <p className="text-slate-500">We are currently curating the best local experiences for you.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
