import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Clé de stockage dans le localStorage ou Preferences
export const API_KEY_STORAGE_KEY = 'diabetique_openai_api_key';

// Vérifier si nous sommes sur mobile
const isNativePlatform = Capacitor.isNativePlatform();

// Enregistrer la clé API dans le localStorage ou Preferences
export const saveApiKey = async (apiKey: string): Promise<void> => {
  const trimmedApiKey = apiKey.trim();
  
  if (isNativePlatform) {
    // Utiliser Preferences API pour les applications natives
    if (trimmedApiKey) {
      await Preferences.set({
        key: API_KEY_STORAGE_KEY,
        value: trimmedApiKey
      });
    } else {
      await Preferences.remove({ key: API_KEY_STORAGE_KEY });
    }
  } else {
    // Utiliser localStorage pour le web
    if (typeof window !== 'undefined') {
      if (trimmedApiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, trimmedApiKey);
      } else {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    }
  }
};

// Récupérer la clé API depuis le localStorage ou Preferences
export const getApiKey = async (): Promise<string> => {
  if (isNativePlatform) {
    // Utiliser Preferences API pour les applications natives
    const { value } = await Preferences.get({ key: API_KEY_STORAGE_KEY });
    return value || '';
  } else {
    // Utiliser localStorage pour le web
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    }
    return '';
  }
};

// Version synchrone pour la compatibilité
export const getApiKeySync = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  }
  return '';
};

// Ajouter la clé API aux en-têtes de la requête si elle existe
export const addApiKeyToHeaders = async (headers: HeadersInit = {}): Promise<HeadersInit> => {
  const apiKey = await getApiKey();
  if (apiKey) {
    return {
      ...headers,
      'X-OpenAI-API-Key': apiKey
    };
  }
  return headers;
};

// Version synchrone pour la compatibilité
export const addApiKeyToHeadersSync = (headers: HeadersInit = {}): HeadersInit => {
  const apiKey = getApiKeySync();
  if (apiKey) {
    return {
      ...headers,
      'X-OpenAI-API-Key': apiKey
    };
  }
  return headers;
}; 