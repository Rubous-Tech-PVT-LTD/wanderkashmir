import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, Calendar, User, ArrowLeft, ChevronDown, Compass, PhoneCall } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { marked } from "marked";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;
export const dynamicParams = true;

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const page = await prisma.seoLandingPage.findFirst({
      where: {
        slug: resolvedParams.slug,
        type: "BLOG",
        workflowState: "PUBLISHED",
      },
    });

    if (!page) {
      return {
        title: "Blog Article Not Found | WanderKashmir",
        robots: { index: false, follow: false },
      };
    }

    const baseUrl = "https://www.wanderkashmir.com";
    const canonicalUrl = `${baseUrl}/blog/${page.slug}`;
    const cleanDescription = page.description?.replace(/^Meta\s*Description:\s*/i, "").trim() || "";

    return {
      title: `${page.title} | WanderKashmir`,
      description: cleanDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: page.title,
        description: cleanDescription,
        url: canonicalUrl,
        images: page.imageUrl ? [{ url: page.imageUrl }] : [],
        type: "article",
        publishedTime: page.createdAt.toISOString(),
        modifiedTime: page.updatedAt.toISOString(),
      },
      twitter: {
        card: "summary_large_image",
        title: page.title,
        description: cleanDescription,
        images: page.imageUrl ? [page.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating blog metadata:", error);
    return {
      title: "Kashmir Travel Blog | WanderKashmir",
    };
  }
}

export async function generateStaticParams() {
  // Return empty list to use on-demand ISR and prevent build-time database pool saturation
  return [];
}

export default async function BlogArticlePage({ params }: BlogPageProps) {
  const resolvedParams = await params;
  let page: any = null;

  try {
    page = await prisma.seoLandingPage.findFirst({
      where: {
        slug: resolvedParams.slug,
        type: "BLOG",
        workflowState: "PUBLISHED",
      },
    });
  } catch (error) {
    console.error("Error fetching blog article from DB:", error);
  }

  if (!page) {
    notFound();
  }

  const publishDate = new Date(page.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const parsedContent = page.content
    ? await marked.parse(page.content, { breaks: true, gfm: true })
    : "";

  const baseUrl = "https://www.wanderkashmir.com";
  const canonicalUrl = `${baseUrl}/blog/${page.slug}`;

  // Fetch Related Blogs
  const relatedBlogs = await prisma.seoLandingPage.findMany({
    where: {
      type: "BLOG",
      workflowState: "PUBLISHED",
      slug: { not: page.slug },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  const schemas: Record<string, any>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.h1Heading || page.title,
      description: page.description?.replace(/^Meta\s*Description:\s*/i, "").trim() || "",
      image: page.imageUrl ? [page.imageUrl] : [],
      datePublished: page.createdAt.toISOString(),
      dateModified: page.updatedAt.toISOString(),
      author: {
        "@type": "Organization",
        name: "WanderKashmir",
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "WanderKashmir",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/brand-logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
    },
  ];

  if (page.faqs && Array.isArray(page.faqs) && page.faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (page.faqs as Array<{ question?: string; answer?: string }>).map((faq) => ({
        "@type": "Question",
        name: faq.question || "",
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer || "",
        },
      })),
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {schemas.map((schema, idx) => (
        <JsonLd key={idx} data={schema} />
      ))}
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <Link href="/blog" className="hover:text-emerald-700 transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
            {page.h1Heading || page.title}
          </span>
        </nav>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 mb-8 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>

        {/* Hero Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
              <User className="w-3.5 h-3.5" />
              WanderKashmir Experts
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {publishDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6 font-display">
            {page.h1Heading || page.title}
          </h1>

          {page.description && (
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
              {page.description.replace(/^Meta\s*Description:\s*/i, "").trim()}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {page.imageUrl && (
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-md mb-12 bg-slate-100 relative">
            <img
              src={page.imageUrl}
              alt={page.h1Heading || page.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        {parsedContent && (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10 md:p-12 mb-12">
            <div
              className="prose prose-slate prose-lg max-w-none 
                         prose-headings:text-slate-900 prose-headings:font-bold prose-headings:font-display
                         prose-a:text-emerald-700 hover:prose-a:text-emerald-800
                         prose-img:rounded-xl prose-img:shadow-md
                         prose-strong:text-slate-900 prose-strong:font-bold
                         prose-li:marker:text-emerald-600"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          </article>
        )}

        {/* FAQs Section */}
        {page.faqs && Array.isArray(page.faqs) && page.faqs.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center font-display">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {(page.faqs as Array<{ question?: string; answer?: string }>).map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 p-5 text-slate-900 font-semibold hover:bg-slate-50 transition-colors">
                    <span className="text-base sm:text-lg pr-4">{faq.question}</span>
                    <span className="shrink-0 bg-slate-100 p-1 rounded-full text-slate-500 group-open:-rotate-180 transition-transform duration-200">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </summary>
                  <div className="p-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2 bg-slate-50/50 text-sm sm:text-base">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-8 sm:p-10 mb-16 text-center text-white shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-display">
            Plan Your Kashmir Dream Journey
          </h2>
          <p className="text-emerald-200 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Experience verified local hotels, licensed drivers, and customized itineraries backed by local Kashmir hospitality.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tours"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4" />
              Explore Kashmir Tours
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/20"
            >
              <PhoneCall className="w-4 h-4" />
              Speak with a Specialist
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 font-display">
              More Kashmir Travel Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedBlogs.map((b: (typeof relatedBlogs)[number]) => (
                <Link
                  key={b.id}
                  href={`/blog/${b.slug}`}
                  className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {b.imageUrl && (
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2 font-display">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-auto">
                      {b.description?.replace(/^Meta\s*Description:\s*/i, "").trim()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
