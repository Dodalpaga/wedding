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
        hostname: 'dodalpaga.github.io',
        port: '', // Empty string indicates no specific port
        pathname: '/wedding/**', // Allow all paths under this domain
      },
    ],
  },

  // Ajouter la variable d'environnement
  env: {
    NEXT_PUBLIC_BASE_PATH:
      process.env.NODE_ENV === 'production' ? '/wedding' : '',
  },

  basePath: process.env.NODE_ENV === 'production' ? '/wedding' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/wedding' : '',

  // Permet le trailing slash (optionnel mais recommandé pour GitHub Pages)
  trailingSlash: true,
};

module.exports = nextConfig;
