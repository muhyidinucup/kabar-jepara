import { Metadata } from 'next'

type SeoProps = {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kabarjepara.web.id'
const SITE_NAME = 'Kabar Jepara'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`

export function generateSeo({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: SeoProps): Metadata {
  const url = `${SITE_URL}${path}`
  const ogImage = image || DEFAULT_OG_IMAGE

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'id_ID',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}