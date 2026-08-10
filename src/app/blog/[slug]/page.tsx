import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { ChevronRight, Calendar, User, ArrowLeft, ChevronDown } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { marked } from "marked";
import { getValidImageUrl } from "@/lib/imageUtils";
import { JsonLd } from "@/components/JsonLd";
import SeoCommentForm from "@/components/SeoCommentForm";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 3600; // ISR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!page || page.type !== "BLOG") return { title: "Blog Not Found" };

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description || "",
      images: page.imageUrl ? [page.imageUrl] : [],
    }
  };
}

export async function generateStaticParams() {
  const pages = await prisma.seoLandingPage.findMany({
    where: { type: "BLOG" },
    select: { slug: true }
  });
  return pages.map(page => ({ slug: page.slug }));
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const page = await prisma.seoLandingPage.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!page || page.type !== "BLOG") {
      notFound();
    }

    const publishDate = new Date(page.createdAt).toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    });

    const parsedContent = page.content ? await marked.parse(page.content, { breaks: true, gfm: true }) : "";
    const safeContent = parsedContent;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanderkashmir.com';
    const url = `${baseUrl}/blog/${resolvedParams.slug}`;

    // Fetch Related Blogs for Internal Linking
    const relatedBlogs = await prisma.seoLandingPage.findMany({
      where: { type: "BLOG", slug: { not: resolvedParams.slug } },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { title: true, slug: true, description: true, imageUrl: true }
    });

    const schemas: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": page.h1Heading,
        "description": page.description,
        "image": page.imageUrl ? [page.imageUrl] : [],
        "datePublished": page.createdAt.toISOString(),
        "dateModified": page.updatedAt.toISOString(),
        "author": {
          "@type": "Organization",
          "name": "WanderKashmir",
          "url": baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "WanderKashmir",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/icon.jpg`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        }
      }
    ];

    if (page.faqs && Array.isArray(page.faqs) && page.faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": page.faqs.map((faq: any) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      });
    }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {schemas.map((schema, idx) => (
        <JsonLd key={idx} data={schema} />
      ))}
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-medium truncate">{page.h1Heading}</span>
        </nav>

        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>

        {/* Hero Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-6">
            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4" />
              WanderKashmir Experts
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {publishDate}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            {page.h1Heading}
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
            {page.description}
          </p>
        </header>

        {page.imageUrl && (
          <div className="relative w-full aspect-[21/9] max-h-[500px] rounded-3xl overflow-hidden shadow-xl mb-16">
            <ImageWithFallback 
              src={getValidImageUrl([page.imageUrl])} 
              alt={page.h1Heading} 
              fill 
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        {page.content && (
          <article className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-8">
            <div 
              className="prose prose-slate prose-lg md:prose-xl max-w-none 
                         prose-headings:text-slate-900 prose-headings:font-bold 
                         prose-a:text-indigo-600 hover:prose-a:text-indigo-700
                         prose-img:rounded-2xl prose-img:shadow-lg
                         prose-strong:text-slate-900 prose-strong:font-bold
                         prose-li:marker:text-indigo-600"
              dangerouslySetInnerHTML={{ __html: safeContent }} 
            />
          </article>
        )}

        <ShareButtons title={page.title} />

        {/* FAQs */}
        {page.faqs && Array.isArray(page.faqs) && page.faqs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {page.faqs.map((faq: any, idx: number) => (
                <details key={idx} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-semibold hover:bg-slate-50 transition-colors">
                    <span className="text-lg pr-4">{faq.question}</span>
                    <span className="shrink-0 bg-slate-100 p-1.5 rounded-full text-slate-500 group-open:-rotate-180 transition-transform duration-300">
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </summary>
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-2 bg-slate-50/50">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Call To Action Block */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 md:p-12 mb-16 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Experience Kashmir?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Turn your reading into reality. Book verified local tours and authentic homestays with WanderKashmir experts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/tours" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors text-lg shadow-lg shadow-indigo-500/30"
            >
              Explore Tour Packages
            </Link>
            <Link 
              href="/stays?type=Homestay" 
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-indigo-900 font-bold rounded-xl transition-colors text-lg shadow-lg"
            >
              Find a Homestay
            </Link>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="bg-indigo-50 rounded-3xl p-8 md:p-10 mb-16 flex flex-col md:flex-row items-center md:items-start gap-6 border border-indigo-100">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-3xl font-bold shadow-lg">
            W
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Written by WanderKashmir</h3>
            <p className="text-slate-600 leading-relaxed">
              We are a team of passionate local experts dedicated to helping you experience the true beauty of Kashmir. Book your taxis, homestays, and tour packages securely with us.
            </p>
          </div>
        </div>

        {/* Customer Reviews & Testimonials Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center md:text-left">
              Traveler Reviews & Comments
            </h2>
          </div>
          <div className="mb-10">
            <SeoCommentForm seoPageId={page.id} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            {page.comments && page.comments.length > 0 ? (
              page.comments.map((comment: any) => (
                <div key={comment.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < (comment.rating || 5) ? "text-yellow-400" : "text-slate-200"}>★</span>
                    ))}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                    "{comment.comment}"
                  </p>
                  <div className="mt-auto pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{comment.name}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {comment.adminReply && (
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        W
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">Response from WanderKashmir</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{comment.adminReply}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center p-8 bg-white rounded-3xl border border-slate-100">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>

        {/* Related Blogs Section */}
        {relatedBlogs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              More Travel Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map(blog => (
                <Link href={`/blog/${blog.slug}`} key={blog.slug} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
                  {blog.imageUrl ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <ImageWithFallback 
                        src={getValidImageUrl([blog.imageUrl])} 
                        alt={blog.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-400 font-medium">WanderKashmir</span>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">{blog.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">{blog.description}</p>
                    <span className="text-indigo-600 font-medium text-sm flex items-center gap-1 mt-auto">
                      Read Guide <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
  } catch (error: any) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 text-center flex-col">
        <h1 className="text-3xl text-red-600 font-bold mb-4">Error Loading Blog</h1>
        <p className="text-slate-800 p-4 bg-slate-100 rounded-xl whitespace-pre-wrap font-mono text-sm max-w-2xl">{error.stack || error.message || "Unknown error"}</p>
        <Link href="/blog" className="mt-8 text-indigo-600 underline">Go back to Blog</Link>
      </main>
    );
  }
}
