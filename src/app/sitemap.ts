import { MetadataRoute } from 'next';
import { THEMED_PUZZLES } from '@/lib/themes';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Bump when page content changes meaningfully. A build-time `new Date()` would
// tell crawlers every page changed on every deploy.
const LAST_MODIFIED = new Date('2026-10-09');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/create`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/faq`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/puzzles`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    ...THEMED_PUZZLES.map(p => ({
      url: `${SITE_URL}/puzzles/${p.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
