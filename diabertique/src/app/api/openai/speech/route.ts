import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Pour compatibilité avec l'export statique de Capacitor
export const dynamic = "force-static";
export const revalidate = false;

// Clé API de secours
const FALLBACK_API_KEY = process.env.OPENAI_API_KEY || "";

// Fonction pour obtenir la clé API OpenAI
const getOpenAIApiKey = (req: NextRequest) => {
  try {
    // Vérifier si une clé API est fournie dans l'en-tête de la requête
    const customApiKey = req.headers.get('X-OpenAI-API-Key');
    
    // Utiliser la clé API personnalisée si elle existe, sinon utiliser la clé par défaut
    return customApiKey || FALLBACK_API_KEY;
  } catch (error) {
    console.error("Erreur lors de la récupération de la clé API:", error);
    return FALLBACK_API_KEY;
  }
};

// Initialiser le client OpenAI avec la clé appropriée
const createOpenAIClient = (apiKey: string) => {
  try {
    return new OpenAI({
      apiKey: apiKey,
    });
  } catch (error) {
    console.error("Erreur lors de la création du client OpenAI:", error);
    // Utiliser une clé de fallback si disponible
    if (FALLBACK_API_KEY) {
      return new OpenAI({
        apiKey: FALLBACK_API_KEY,
      });
    }
    throw new Error("Impossible de créer un client OpenAI");
  }
};

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'alloy' } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Le texte est requis' },
        { status: 400 }
      );
    }

    // Récupérer la clé API et créer le client OpenAI
    const apiKey = getOpenAIApiKey(req);
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Aucune clé API OpenAI disponible. Veuillez configurer une clé API dans les paramètres.'
      }, { status: 401 });
    }
    
    const openai = createOpenAIClient(apiKey);

    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice, // alloy, echo, fable, onyx, nova, ou shimmer
      input: text,
    });

    // Convertir la réponse en ArrayBuffer
    const buffer = await audioResponse.arrayBuffer();
    
    // Créer un objet Blob à partir du buffer
    const blob = new Blob([buffer], { type: 'audio/mpeg' });

    // Retourner l'audio en tant que réponse blob
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération audio:', error);
    
    // Différencier les erreurs d'API OpenAI
    if (error.message && error.message.includes('API key')) {
      return NextResponse.json({ 
        error: 'Clé API OpenAI invalide ou expirée. Veuillez vérifier votre clé API dans les paramètres.'
      }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de la génération audio' },
      { status: 500 }
    );
  }
} 