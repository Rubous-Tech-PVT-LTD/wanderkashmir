import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wanderkashmir.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/wander-admin/', '/wander-admin/', '/partner/', '/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
