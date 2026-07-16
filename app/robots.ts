import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

/**
 * robots.txt: Suchmaschinen dürfen die öffentliche Seite indexieren, der
 * CMS-Bereich (/admin) bleibt außen vor. Verweis auf die Sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
