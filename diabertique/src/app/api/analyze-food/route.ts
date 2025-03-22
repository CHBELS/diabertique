import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Passer en mode dynamique pour les API routes
export const dynamic = "force-dynamic";
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

// Fonction commune pour analyser l'image
async function analyzeImage(req: NextRequest) {
  try {
    const origin = req.headers.get('origin') || '*';
    const headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Essayer d'extraire le formData
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error("Erreur lors de l'extraction du formData:", error);
      return NextResponse.json({ 
        success: false, 
        error: "Impossible de lire les données du formulaire" 
      }, { status: 400, headers });
    }
    
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Aucune image fournie' 
      }, { status: 400, headers });
    }

    // Vérifier le type de fichier
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Le fichier fourni n\'est pas une image' 
      }, { status: 400, headers });
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
      }, { status: 401, headers });
    }
    
    // Créer un client OpenAI avec la clé appropriée
    let openai;
    try {
      openai = createOpenAIClient(apiKey);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création du client OpenAI',
        foodItems: ["Erreur de configuration"],
        totalCarbs: 0,
        carbsPerPortion: 0,
        portionSize: "Inconnue",
        tips: "Veuillez vérifier votre clé API dans les paramètres."
      }, { status: 500, headers });
    }

    try {
      // Appeler l'API OpenAI Vision avec un timeout plus court
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Remplacer le modèle déprécié par gpt-4o qui supporte l'analyse d'images
        messages: [
          {
            role: "system",
            content: "Tu es un nutritionniste spécialisé dans le diabète. Analyse les photos de nourriture et estime leur contenu en glucides. Réponds UNIQUEMENT au format JSON avec les clés: foodItems (liste des aliments identifiés), totalCarbs (total des glucides en grammes), carbsPerPortion (glucides par portion), portionSize (taille de la portion), tips (conseils pour diabétiques)."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identifie les aliments présents, estime la quantité de glucides (en grammes) et fournis des conseils pour un diabétique."
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
        temperature: 0.3,
        stream: false,
        response_format: { type: "json_object" },
      });

      // Traiter la réponse
      const content = response.choices[0].message.content;
      
      if (!content || content.trim() === '') {
        throw new Error('Réponse vide');
      }
      
      // Parser le JSON
      const analysisResult = JSON.parse(content);
      
      // Vérifier et remplir les champs manquants
      const result = {
        foodItems: Array.isArray(analysisResult.foodItems) ? analysisResult.foodItems : ["Aliment non identifié"],
        totalCarbs: typeof analysisResult.totalCarbs === 'number' ? analysisResult.totalCarbs : 0,
        carbsPerPortion: typeof analysisResult.carbsPerPortion === 'number' ? analysisResult.carbsPerPortion : 0,
        portionSize: analysisResult.portionSize || "Portion standard",
        tips: analysisResult.tips || "Consultez un professionnel de santé pour des conseils adaptés."
      };

      // Retourner les résultats d'analyse
      return NextResponse.json({
        success: true,
        ...result
      }, { headers });

    } catch (error: any) {
      console.error('Erreur OpenAI:', error);
      
      // Renvoyer une réponse JSON valide même en cas d'erreur
      return NextResponse.json({ 
        success: false,
        error: error.message || 'Erreur lors de l\'analyse de l\'image',
        foodItems: ["Erreur d'analyse"],
        totalCarbs: 0,
        carbsPerPortion: 0,
        portionSize: "Inconnue",
        tips: "Une erreur s'est produite. Veuillez réessayer plus tard."
      }, { status: 500, headers });
    }
  } catch (error: any) {
    console.error('Erreur globale:', error);
    
    // Récupérer l'origine pour CORS
    const origin = (error.req && error.req.headers && error.req.headers.get('origin')) || '*';
    
    // Renvoyer une réponse JSON valide même en cas d'erreur globale
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Erreur serveur lors de l\'analyse',
      foodItems: ["Erreur serveur"],
      totalCarbs: 0,
      carbsPerPortion: 0,
      portionSize: "Inconnue",
      tips: "Une erreur s'est produite côté serveur. Veuillez réessayer plus tard."
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }
}

// Handler OPTIONS pour le preflight CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Handler POST pour l'analyse d'image
export async function POST(req: NextRequest) {
  return analyzeImage(req);
}

// Handler GET pour permettre les tests et éviter les erreurs 405
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: "Le service d'analyse d'images est disponible. Utilisez une requête POST pour analyser une image." 
  }, {
    headers: {
      'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-API-Key, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
} 