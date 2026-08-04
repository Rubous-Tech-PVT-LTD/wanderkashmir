import { MetadataRoute } from 'next'
import prisma from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.indiahiles.com'

  // Fetch all approved properties (stays) from the database
  let propertyUrls: MetadataRoute.Sitemap = []
  
  try {
    const properties = await prisma.property.findMany({
      where: { isApproved: true, status: 'APPROVED' },
      select: { id: true, updatedAt: true },
      take: 5000
    })

    propertyUrls = properties.map((property) => ({
      url: `${baseUrl}/stays/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Error fetching properties for sitemap:", error)
  }

  let tourUrls: MetadataRoute.Sitemap = []
  let vehicleUrls: MetadataRoute.Sitemap = []
  let guideUrls: MetadataRoute.Sitemap = []

  try {
    const tours = await prisma.tour.findMany({
      select: { slug: true, updatedAt: true },
      take: 5000
    })

    tourUrls = tours.map((tour: any) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Error fetching tours for sitemap:", error)
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isApproved: true, status: 'APPROVED' },
      select: { id: true, updatedAt: true },
      take: 5000
    })

    vehicleUrls = vehicles.map((vehicle) => ({
      url: `${baseUrl}/taxis/${vehicle.id}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch (error) {
    console.error("Error fetching vehicles for sitemap:", error)
  }

  try {
    const guides = await prisma.guideProfile.findMany({
      where: { isApproved: true, status: 'APPROVED' },
      select: { id: true, updatedAt: true },
      take: 5000
    })

    guideUrls = guides.map((guide) => ({
      url: `${baseUrl}/guides/${guide.id}`,
      lastModified: guide.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch (error) {
    console.error("Error fetching guides for sitemap:", error)
  }

  let seoUrls: MetadataRoute.Sitemap = []

  try {
    const seoPages = await prisma.seoLandingPage.findMany({
      select: { slug: true, type: true, updatedAt: true },
      take: 5000
    })

    const getBaseRoute = (type: string) => {
      switch(type) {
        case 'BLOG': return '/blog';
        case 'HOMESTAY': return '/homestays';
        case 'TAXI': return '/taxis';
        case 'TOUR': return '/tours';
        case 'DESTINATION': return '/destinations';
        default: return '/page';
      }
    };

    seoUrls = seoPages.map((page: any) => ({
      url: `${baseUrl}${getBaseRoute(page.type)}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))
  } catch (error) {
    console.error("Error fetching SEO pages for sitemap:", error)
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/stays`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/taxis`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trips`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...propertyUrls,
    ...tourUrls,
    ...vehicleUrls,
    ...guideUrls,
    ...seoUrls,
  ]
}
