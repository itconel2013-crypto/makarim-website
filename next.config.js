/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['better-sqlite3', 'sharp'],

  /**
   * Rubrik-URLs wurden umgestellt (/umrah → /umrah-reisen, /hajj → /hajj-reisen).
   * Dauerhafte Weiterleitung (301), damit alte Links — auch auf Reise-Unterseiten
   * wie /umrah/winter-umrah — nicht ins Leere laufen und Google die neue Adresse
   * als Nachfolger wertet.
   */
  async redirects() {
    return [
      { source: '/umrah', destination: '/umrah-reisen', permanent: true },
      { source: '/umrah/:path*', destination: '/umrah-reisen/:path*', permanent: true },
      { source: '/hajj', destination: '/hajj-reisen', permanent: true },
      { source: '/hajj/:path*', destination: '/hajj-reisen/:path*', permanent: true },

      // ── Alte WordPress-URLs → neue Seiten (SEO beim Domainumzug makarim.de) ──
      // Spezifische Rubriken zuerst, danach die Auffang-Muster (Reihenfolge zählt:
      // Next.js nimmt den ersten Treffer).
      { source: '/reisekategorie/umrah', destination: '/umrah-reisen', permanent: true },
      { source: '/reisekategorie/hajj', destination: '/hajj-reisen', permanent: true },
      { source: '/reisekategorie/kulturreisen', destination: '/kulturreisen', permanent: true },
      { source: '/reisekategorie/:rest*', destination: '/umrah-reisen', permanent: true },

      // Einzelne alte Reise-Seiten: /reise/hajj2027 ist die einzige Hajj-Reise,
      // alle übrigen sind Umrah-Reisen → auf die jeweilige Rubrik.
      { source: '/reise/hajj2027', destination: '/hajj-reisen', permanent: true },
      { source: '/reise/:rest*', destination: '/umrah-reisen', permanent: true },

      { source: '/umra-2022', destination: '/umrah-reisen', permanent: true },
    ];
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  },
};

module.exports = nextConfig;
