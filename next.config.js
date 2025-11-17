/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export statique pour GitHub Pages
  output: 'export',

  // Désactiver l'optimisation d'images pour l'export statique
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'https://dodalpaga.github.io/wedding/',
        port: '', // Empty string indicates no specific port
        pathname: '**', // Allow all paths under this domain
      },
    ],
  },

  basePath: process.env.NODE_ENV === 'production' ? '/wedding' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/wedding' : '',

  // Permet le trailing slash (optionnel mais recommandé pour GitHub Pages)
  trailingSlash: true,
};

module.exports = nextConfig;
