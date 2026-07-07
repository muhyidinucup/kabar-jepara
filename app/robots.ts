import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kabarjepara.web.id'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/preview-berita'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}