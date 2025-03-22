/** @type {import('next').NextConfig} */
const nextConfig = {
  // Utiliser output: 'export' uniquement en production
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // Autres configurations
  images: {
    unoptimized: true,
  },
  // Pour la compatibilité avec les anciennes versions d'Android
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig; 