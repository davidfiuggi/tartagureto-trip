const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''
const BASE_URL = 'https://api.unsplash.com'

export interface UnsplashPhoto {
  id: string
  url: string
  thumbUrl: string
  alt: string
  credit: string
  creditUrl: string
}

export async function searchPhotos(query: string, perPage = 4): Promise<UnsplashPhoto[]> {
  if (!ACCESS_KEY) return []

  const params = new URLSearchParams({
    query: `${query} travel landscape`,
    per_page: String(perPage),
    orientation: 'landscape',
  })

  const res = await fetch(`${BASE_URL}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  })

  if (!res.ok) return []

  const data = await res.json()
  return (data.results || []).map((photo: {
    id: string
    urls: { regular: string; small: string }
    alt_description: string | null
    user: { name: string; links: { html: string } }
  }) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    alt: photo.alt_description || query,
    credit: photo.user.name,
    creditUrl: photo.user.links.html,
  }))
}
