import axios from 'axios';
import { OpenAIVisionResponse, OpenAIAudioResponse } from '@/types';
import { getApiKey } from '@/components/ApiKeyManager';

// Détecte si l'application est en cours d'exécution dans un environnement Capacitor
const isCapacitor = typeof window !== 'undefined' && 
                   window.hasOwnProperty('Capacitor') && 
                   (window as any).Capacitor.isNativePlatform();

// Ajuste l'URL de base pour les requêtes API en fonction de l'environnement
const getApiBaseUrl = () => {
  if (isCapacitor) {
    // Dans Capacitor, on doit utiliser l'URL complète du serveur backend
    // L'API est exposée au serveur distant après build
    return 'https://diabertique-api.example.com';
  }
  // En développement ou dans le navigateur, on utilise le chemin relatif
  return '';
};

export async function analyzeImageForCarbs(imageData: string): Promise<OpenAIVisionResponse> {
  try {
    const apiKey = await getApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-OpenAI-API-Key'] = apiKey;
    }
    
    const apiUrl = `${getApiBaseUrl()}/api/openai/vision`;
    const response = await axios.post(apiUrl, { imageData }, { headers });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    throw new Error('Impossible d\'analyser l\'image pour les glucides');
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<OpenAIAudioResponse> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.mp3');
    
    const apiKey = await getApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data'
    };
    
    if (apiKey) {
      headers['X-OpenAI-API-Key'] = apiKey;
    }
    
    const apiUrl = `${getApiBaseUrl()}/api/openai/transcription`;
    const response = await axios.post(apiUrl, formData, {
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la transcription audio:', error);
    throw new Error('Impossible de transcrire l\'audio');
  }
}

export async function chatWithAssistant(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  try {
    const apiKey = await getApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-OpenAI-API-Key'] = apiKey;
    }
    
    const apiUrl = `${getApiBaseUrl()}/api/openai/chat`;
    const response = await axios.post(apiUrl, { messages }, { headers });
    return response.data.message;
  } catch (error) {
    console.error('Erreur lors de la conversation avec l\'assistant:', error);
    throw new Error('Impossible de communiquer avec l\'assistant');
  }
}

export async function generateSpeech(text: string, voice: string = 'alloy'): Promise<Blob> {
  try {
    const apiKey = await getApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-OpenAI-API-Key'] = apiKey;
    }
    
    const apiUrl = `${getApiBaseUrl()}/api/openai/speech`;
    const response = await axios.post(apiUrl, { text, voice }, {
      responseType: 'blob',
      headers
    });
    
    return new Blob([response.data], { type: 'audio/mpeg' });
  } catch (error) {
    console.error('Erreur lors de la génération de la parole:', error);
    throw new Error('Impossible de générer l\'audio');
  }
} 