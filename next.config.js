/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export statique pour GitHub Pages
  output: 'export',

  // Désactiver l'optimisation d'images pour l'export statique
  images: {
    unoptimized: true,
  },

  // IMPORTANT : Remplacez 'your-repo-name' par le nom EXACT de votre repository GitHub
  // Par exemple, si votre repo est https://github.com/username/mariage-solenne-dorian
  // alors mettez 'mariage-solenne-dorian'
  basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',

  // Permet le trailing slash (optionnel mais recommandé pour GitHub Pages)
  trailingSlash: true,
};

module.exports = nextConfig;

/*
  📝 INSTRUCTIONS :
  
  1. Remplacez '/your-repo-name' par le nom de votre repository GitHub
     Exemple : Si votre URL GitHub est https://github.com/dorian/mariage-sd
     Alors mettez : basePath: '/mariage-sd'
  
  2. Si vous déployez sur Vercel ou un domaine custom, commentez les lignes basePath et assetPrefix :
     // basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
     // assetPrefix: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  
  3. Pour tester en local, utilisez toujours : npm run dev
     (basePath ne s'applique qu'en production)
*/
