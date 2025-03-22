import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Pour compatibilité avec l'export statique de Capacitor
export const dynamic = "force-static";
export const revalidate = false;

// Clé API de secours (à remplacer par la vôtre pour la production)
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

// Ajouter la gestion de la méthode OPTIONS pour résoudre l'erreur 405
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Ajouter un timeout pour éviter les problèmes avec les requêtes longues
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout dépassé')), 30000)
    );

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ success: false, error: 'Aucune image fournie' }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Le fichier fourni n\'est pas une image' }, { status: 400 });
    }

    // Convertir l'image en Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Récupérer la clé API OpenAI
    const apiKey = getOpenAIApiKey(req);
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false,
        error: 'Aucune clé API OpenAI disponible. Veuillez configurer une clé API dans les paramètres.'
      }, { status: 401 });
    }
    
    // Créer un client OpenAI avec la clé appropriée
    const openai = createOpenAIClient(apiKey);

    // Appeler l'API OpenAI Vision avec un timeout
    const apiPromise = openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Utiliser un modèle plus léger pour éviter les problèmes
      messages: [
        {
          role: "system",
          content: "Tu es un nutritionniste spécialisé dans le diabète. Analyse les photos de nourriture et estime leur contenu en glucides. Réponds UNIQUEMENT au format JSON avec les clés: foodItems, totalCarbs, carbsPerPortion, portionSize, tips."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyse cette photo de nourriture. Identifie les aliments présents, estime la quantité de glucides (en grammes) dans ce plat, et fournis des conseils pour un diabétique qui voudrait consommer ce plat. Donne ta réponse au format JSON avec les clés suivantes: foodItems (tableau des aliments identifiés), totalCarbs (estimation des glucides totaux en grammes), carbsPerPortion (glucides par portion), portionSize (description de la taille de portion), tips (conseils pour diabétiques)."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageFile.type};base64,${buffer.toString('base64')}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.5,
      stream: false, // Important: désactiver le streaming pour éviter les problèmes de parsing JSON
      response_format: { type: "json_object" }, // Forcer OpenAI à retourner un JSON valide
    });

    // Race entre l'API et le timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;

    // Traiter la réponse
    const content = response.choices[0].message.content;
    let analysisResult;

    try {
      // Essayer de parser la réponse comme JSON
      if (!content) {
        throw new Error('Réponse vide');
      }
      
      analysisResult = JSON.parse(content);
      
      // Vérifier que les propriétés requises sont présentes
      if (!analysisResult.foodItems || !Array.isArray(analysisResult.foodItems)) {
        analysisResult.foodItems = ["Aliment non identifié"];
      }
      
      if (typeof analysisResult.totalCarbs !== 'number') {
        analysisResult.totalCarbs = 0;
      }
      
      if (typeof analysisResult.carbsPerPortion !== 'number') {
        analysisResult.carbsPerPortion = 0;
      }
      
      if (!analysisResult.portionSize) {
        analysisResult.portionSize = "Portion standard";
      }
      
      if (!analysisResult.tips) {
        analysisResult.tips = "Consultez un professionnel de santé pour des conseils adaptés.";
      }
      
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON:', error, 'Contenu brut:', content);
      
      // Créer une réponse formatée manuellement si le parsing échoue
      return NextResponse.json({
        success: true,
        foodItems: ["Aliment non identifié"],
        totalCarbs: 0,
        carbsPerPortion: 0,
        portionSize: "Portion standard",
        tips: "Impossible d'analyser précisément. Consultez un professionnel de santé pour des conseils adaptés."
      });
    }

    // Retourner les résultats d'analyse
    return NextResponse.json({
      success: true,
      ...analysisResult
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    
    // Différencier les erreurs d'API OpenAI
    if (error.message && error.message.includes('API key')) {
      return NextResponse.json({ 
        success: false,
        error: 'Clé API OpenAI invalide ou expirée. Veuillez vérifier votre clé API dans les paramètres.'
      }, { status: 401 });
    }
    
    if (error.message && error.message.includes('Timeout')) {
      return NextResponse.json({ 
        success: false,
        error: 'La requête a pris trop de temps. Veuillez réessayer.',
        foodItems: ["Erreur: timeout"],
        totalCarbs: 0,
        carbsPerPortion: 0,
        portionSize: "Inconnue",
        tips: "Une erreur s'est produite. Veuillez réessayer plus tard."
      }, { status: 504 });
    }
    
    // Réponse par défaut en cas d'erreur
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Erreur lors de l\'analyse de l\'image',
      // Ajouter des données simulées pour éviter le crash de l'application
      foodItems: ["Erreur d'analyse"],
      totalCarbs: 0,
      carbsPerPortion: 0,
      portionSize: "Inconnue",
      tips: "Une erreur s'est produite. Veuillez réessayer plus tard."
    });
  }
} 