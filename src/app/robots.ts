import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indiahiles.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/wander-admin/', '/partner/', '/dashboard/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'GoogleOther', 'PerplexityBot'],
        allow: '/',
        disallow: ['/wander-admin/', '/partner/', '/dashboard/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
