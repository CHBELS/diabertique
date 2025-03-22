import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.diabetia.app',
  appName: 'DiabetIA',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Mettre à jour avec la vraie URL ou laisser vide pour utiliser les fichiers statiques
    // url: 'https://api.votre-domaine.com',
  },
  android: {
    backgroundColor: "#ffffff",
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerColor: "#3b82f6",
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
