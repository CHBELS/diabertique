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
    // Ajouter un timeout global pour éviter les problèmes de requête bloquée
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout dépassé')), 25000)
    );

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages invalides' }, { status: 400 });
    }

    // Récupérer la clé API et créer le client OpenAI
    const apiKey = getOpenAIApiKey(req);
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Aucune clé API OpenAI disponible. Veuillez configurer une clé API dans les paramètres.'
      }, { status: 401 });
    }
    
    const openai = createOpenAIClient(apiKey);

    // Ajouter un contexte système pour un assistant spécialisé dans le diabète
    const systemMessage = {
      role: "system",
      content: `Tu es un assistant spécialisé pour les personnes diabétiques. 
      Tu fournis des conseils précis et scientifiquement validés sur la gestion du diabète, 
      l'alimentation, les médicaments, l'activité physique et le suivi de la glycémie. 
      Tu peux suggérer des aliments à faible indice glycémique, expliquer comment gérer 
      les situations difficiles comme l'hypoglycémie, et donner des conseils pratiques pour 
      maintenir un bon équilibre glycémique. Tu n'es pas un médecin et tu dois toujours 
      rappeler que tes conseils ne remplacent pas l'avis d'un professionnel de santé.`
    };

    // Appeler l'API avec timeout
    const apiPromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Utiliser un modèle plus léger pour éviter les problèmes
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 800,
      stream: false,
    });

    // Race entre l'API et le timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;
    
    // Si nous sommes ici, c'est que nous avons une réponse valide
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Réponse OpenAI invalide');
    }

    // Renvoyer la réponse
    return NextResponse.json({
      message: response.choices[0].message.content,
      status: 'success'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la conversation avec l\'assistant:', error);
    
    // Différencier les erreurs d'API OpenAI
    if (error.message && error.message.includes('API key')) {
      return NextResponse.json({ 
        error: 'Clé API OpenAI invalide ou expirée. Veuillez vérifier votre clé API dans les paramètres.'
      }, { status: 401 });
    }

    if (error.message && error.message.includes('Timeout')) {
      return NextResponse.json({ 
        error: 'La requête a pris trop de temps. Veuillez réessayer.',
        details: error.message
      }, { status: 504 });
    }
    
    // Renvoyer une erreur détaillée
    return NextResponse.json({ 
      error: 'Erreur de communication avec l\'assistant',
      details: error.message,
      status: 'error'
    }, { status: 500 });
  }
} 