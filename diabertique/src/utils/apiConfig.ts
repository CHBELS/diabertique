import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Déterminer si nous sommes dans une application native ou web
const isNative = Capacitor.isNativePlatform();

// Base URL pour les requêtes API
export const getApiBaseUrl = () => {
  // En mode natif (Android, iOS), on utilise l'URL définie dans capacitor.config.ts
  if (isNative) {
    return '';  // URL relative à la configuration du serveur dans capacitor.config.ts
  }
  
  // En mode web/développement, on utilise les routes API locales
  return '';
};

// Configuration pour les API OpenAI
export const apiConfig = {
  apiBaseUrl: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes
};

// Pour vérifier si une clé API personnalisée existe
export const getOpenAIApiKey = async () => {
  try {
    if (isNative) {
      // En mode natif, utiliser Preferences API
      const { value } = await Preferences.get({ key: 'diabetique_openai_api_key' });
      return value || null;
    } else {
      // En mode web, utiliser localStorage
      return localStorage.getItem('diabetique_openai_api_key') || null;
    }
  } catch {
    return null;
  }
};

// Version synchrone pour compatibilité
export const getOpenAIApiKeySync = () => {
  try {
    if (!isNative) {
      return localStorage.getItem('diabetique_openai_api_key') || null;
    }
    return null; // En mode natif, impossible d'accéder de manière synchrone
  } catch {
    return null;
  }
}; 