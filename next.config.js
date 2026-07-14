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
