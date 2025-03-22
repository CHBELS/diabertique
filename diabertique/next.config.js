// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supprimer l'export statique pour permettre les API routes dynamiques
  // output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // Désactiver la génération des routes dynamiques pour les pages avec [paramètres]
  // Cela permet de créer une page générique qui sera utilisée pour tous les IDs
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  // ESLint errors shouldn't stop the build for Capacitor
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver les vérifications de type TypeScript lors du build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs de pages manquantes (comme des routes dynamiques non générées)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // ⭐ Configuration critique pour la compatibilité avec Capacitor
  trailingSlash: true, // Ajoute un slash à la fin des URLs pour la compatibilité
};

module.exports = nextConfig; 