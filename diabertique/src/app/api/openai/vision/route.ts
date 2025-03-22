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
      setTimeout(() => reject(new Error('Timeout dépassé')), 30000)
    );

    const { imageData } = await req.json();

    if (!imageData) {
      return NextResponse.json({ error: 'Données d\'image requises' }, { status: 400 });
    }

    // Récupérer la clé API et créer le client OpenAI
    const apiKey = getOpenAIApiKey(req);
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Aucune clé API OpenAI disponible. Veuillez configurer une clé API dans les paramètres.'
      }, { status: 401 });
    }
    
    const openai = createOpenAIClient(apiKey);

    // Construire le prompt pour l'analyse des glucides
    const prompt = `
    Analyse cette image d'aliment pour un patient diabétique. 
    Identifie l'aliment, estime son poids en grammes si possible, et calcule sa teneur en glucides.
    Réponds uniquement au format JSON suivant:
    {
      "name": "nom de l'aliment",
      "estimatedWeight": nombre en grammes (optionnel),
      "carbs": nombre de grammes de glucides,
      "details": "informations supplémentaires (optionnel)"
    }
    `;

    // Appeler l'API avec timeout
    const apiPromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Utiliser un modèle plus léger pour éviter les problèmes
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      stream: false,
    });

    // Race entre l'API et le timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;

    // Extraire et parser la réponse JSON
    const content = response.choices[0].message.content;
    let jsonResponse;
    
    try {
      // Extraire JSON si la réponse contient d'autres textes
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else if (content) {
        jsonResponse = JSON.parse(content);
      } else {
        throw new Error('Format de réponse invalide');
      }
      
      // Ajouter un indicateur de succès à la réponse
      jsonResponse.status = 'success';
      
      return NextResponse.json(jsonResponse);
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON:', error);
      return NextResponse.json({ 
        error: 'Impossible de parser la réponse',
        rawContent: content,
        status: 'error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    
    // Différencier les erreurs d'API OpenAI
    if (error.message && error.message.includes('API key')) {
      return NextResponse.json({ 
        error: 'Clé API OpenAI invalide ou expirée. Veuillez vérifier votre clé API dans les paramètres.',
        status: 'error'
      }, { status: 401 });
    }

    if (error.message && error.message.includes('Timeout')) {
      return NextResponse.json({ 
        error: 'La requête a pris trop de temps. Veuillez réessayer.',
        details: error.message,
        status: 'error'
      }, { status: 504 });
    }
    
    return NextResponse.json({ 
      error: 'Erreur de traitement de l\'image',
      details: error.message,
      status: 'error'  
    }, { status: 500 });
  }
} 