import { MetadataRoute } from 'next';
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.wanderkashmir.com';

  // 1. Static Public Pages served by V2
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stays`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experiences`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/our-vision`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cancellation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Dynamic Live Tours (Strictly isLive = true)
  let tourUrls: MetadataRoute.Sitemap = [];
  try {
    const tours = await prisma.tour.findMany({
      where: { isLive: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    });

    tourUrls = tours.map((tour: (typeof tours)[number]) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching tours for sitemap:", error);
  }

  // 3. Dynamic Travel Styles (Strictly isActive = true)
  let travelStyleUrls: MetadataRoute.Sitemap = [];
  try {
    const styles = await prisma.travelStyle.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      take: 100,
    });

    travelStyleUrls = styles.map((style: (typeof styles)[number]) => ({
      url: `${baseUrl}/tours/${style.slug}`,
      lastModified: style.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching travel styles for sitemap:", error);
  }

  // 4. Dynamic Approved Stays (Strictly isApproved = true and status = APPROVED)
  let propertyUrls: MetadataRoute.Sitemap = [];
  try {
    const properties = await prisma.property.findMany({
      where: { isApproved: true, status: 'APPROVED' },
      select: { id: true, updatedAt: true },
      take: 5000,
    });

    propertyUrls = properties.map((property: (typeof properties)[number]) => ({
      url: `${baseUrl}/stays/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching properties for sitemap:", error);
  }

  // 5. Dynamic Published Destinations (Strictly DESTINATION and PUBLISHED)
  let destinationUrls: MetadataRoute.Sitemap = [];
  try {
    const destinations = await prisma.seoLandingPage.findMany({
      where: {
        type: 'DESTINATION',
        workflowState: 'PUBLISHED',
      },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });

    destinationUrls = destinations.map((dest: (typeof destinations)[number]) => ({
      url: `${baseUrl}/destinations/${dest.slug}`,
      lastModified: dest.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching destinations for sitemap:", error);
  }

  // 6. Dynamic Destination Places (Strictly destination PUBLISHED and place ACTIVE)
  let placeUrls: MetadataRoute.Sitemap = [];
  try {
    const destinationPlaces = await prisma.destinationPlace.findMany({
      where: {
        destination: { workflowState: 'PUBLISHED', type: 'DESTINATION' },
        place: { status: 'ACTIVE' },
      },
      select: {
        updatedAt: true,
        destination: { select: { slug: true } },
        place: { select: { slug: true, updatedAt: true } },
      },
      take: 5000,
    });

    placeUrls = destinationPlaces.map((dp: (typeof destinationPlaces)[number]) => ({
      url: `${baseUrl}/destinations/${dp.destination.slug}/${dp.place.slug}`,
      lastModified: dp.place.updatedAt || dp.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching destination places for sitemap:", error);
  }

  // 7. Dynamic Experiences (Strictly status = ACTIVE)
  let experienceUrls: MetadataRoute.Sitemap = [];
  try {
    const experiences = await prisma.experience.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });

    experienceUrls = experiences.map((exp: (typeof experiences)[number]) => ({
      url: `${baseUrl}/experiences/${exp.slug}`,
      lastModified: exp.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching experiences for sitemap:", error);
  }

  // 8. Dynamic Published Blogs (Strictly type = BLOG and workflowState = PUBLISHED)
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const blogs = await prisma.seoLandingPage.findMany({
      where: { type: 'BLOG', workflowState: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      take: 2000,
    });

    blogUrls = blogs.map((blog: (typeof blogs)[number]) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  // Combine and deduplicate strictly by URL
  const allEntries = [
    ...staticRoutes,
    ...tourUrls,
    ...travelStyleUrls,
    ...propertyUrls,
    ...destinationUrls,
    ...placeUrls,
    ...experienceUrls,
    ...blogUrls,
  ];

  const uniqueUrlMap = new Map<string, (typeof allEntries)[number]>();
  for (const entry of allEntries) {
    if (!uniqueUrlMap.has(entry.url)) {
      uniqueUrlMap.set(entry.url, entry);
    }
  }

  return Array.from(uniqueUrlMap.values());
}
