const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

const imageCache = new Map();

/**
 * Fetch top Unsplash photo URLs matching a specific search query string
 */
export async function fetchUnsplashPhotos(query, count = 5) {
  if (!query) return [];
  const cleanQuery = query.trim().toLowerCase();
  
  if (imageCache.has(cleanQuery)) {
    return imageCache.get(cleanQuery);
  }

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(cleanQuery)}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`);
    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
    const data = await res.json();
    const urls = (data.results || []).map(p => p.urls?.regular || p.urls?.small).filter(Boolean);
    if (urls.length > 0) {
      imageCache.set(cleanQuery, urls);
      return urls;
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('Unsplash fetch error:', err);
  }

  return [];
}

/**
 * Synchronously resolve best cached or fallback photo for an alt text context
 */
export function getCachedOrFallbackPhoto(altText, fallbackPool = []) {
  if (!altText) return fallbackPool[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop';
  
  const clean = altText.trim().toLowerCase();
  for (const [key, urls] of imageCache.entries()) {
    if (clean.includes(key) || key.includes(clean)) {
      return urls[0];
    }
  }

  return fallbackPool[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop';
}
