export interface RelatedImage {
  id: string;
  title: string;
  pageUrl: string;
  imageUrl: string;
  width?: number;
  height?: number;
  creator?: string;
  license?: string;
}

interface CommonsResponse {
  query?: {
    pages?: Record<string, {
      pageid: number;
      title: string;
      imageinfo?: Array<{
        descriptionurl?: string;
        thumburl?: string;
        url?: string;
        width?: number;
        height?: number;
        extmetadata?: {
          Artist?: { value?: string };
          LicenseShortName?: { value?: string };
        };
      }>;
    }>;
  };
}

function plainText(value?: string): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#0*39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || undefined;
}

/**
 * Fetch freely licensed, topic-related images from Wikimedia Commons.
 * The Commons API supports browser CORS via origin=* and needs no API key.
 */
export async function searchRelatedImages(
  query: string,
  signal?: AbortSignal,
): Promise<RelatedImage[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '720',
    format: 'json',
    origin: '*',
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Image search failed (${response.status})`);

  const payload = await response.json() as CommonsResponse;
  return Object.values(payload.query?.pages ?? {})
    .map((page): RelatedImage | null => {
      const info = page.imageinfo?.[0];
      const imageUrl = info?.thumburl || info?.url;
      const pageUrl = info?.descriptionurl;
      if (!imageUrl || !pageUrl || !/^https:\/\//.test(imageUrl)) return null;
      return {
        id: String(page.pageid),
        title: page.title.replace(/^File:/, '').replace(/_/g, ' '),
        pageUrl,
        imageUrl,
        width: info?.width,
        height: info?.height,
        creator: plainText(info?.extmetadata?.Artist?.value),
        license: plainText(info?.extmetadata?.LicenseShortName?.value),
      };
    })
    .filter((image): image is RelatedImage => image !== null);
}
