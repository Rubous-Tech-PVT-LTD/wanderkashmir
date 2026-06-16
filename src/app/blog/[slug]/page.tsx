import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Calendar, User, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { marked } from "marked";

export const revalidate = 3600; // ISR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug: resolvedParams.slug }
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
      where: { slug: resolvedParams.slug }
    });

    if (!page || page.type !== "BLOG") {
      notFound();
    }

    const publishDate = new Date(page.createdAt).toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    });

    const parsedContent = page.content ? await marked.parse(page.content) : "";
    const safeContent = parsedContent;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
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

        {/* Hero Image */}
        {page.imageUrl && (
          <div className="w-full aspect-[21/9] min-h-[300px] md:min-h-[400px] relative rounded-3xl overflow-hidden shadow-xl mb-16">
            <Image 
              src={page.imageUrl} 
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
          <article className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-16">
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
