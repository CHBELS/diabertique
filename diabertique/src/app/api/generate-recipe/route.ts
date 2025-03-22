import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RecipeCategory } from '@/types';
import { cookies } from 'next/headers';

// Pour compatibilité avec l'export statique de Capacitor
export const dynamic = "force-static";
export const revalidate = false;

// Fonction pour obtenir la clé API OpenAI
const getOpenAIApiKey = (req: NextRequest) => {
  // Vérifier si une clé API est fournie dans l'en-tête de la requête
  const customApiKey = req.headers.get('X-OpenAI-API-Key');
  
  // Utiliser la clé API personnalisée si elle existe, sinon utiliser la clé par défaut
  return customApiKey || process.env.OPENAI_API_KEY || '';
};

// Initialiser le client OpenAI avec la clé appropriée
const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,
  });
};

// Images spécifiques par plat (nom normalisé -> URL de l'image)
const specificImages: Record<string, string> = {
  "ratatouille": "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?q=80&w=500&auto=format&fit=crop",
  "lasagnes": "https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=500&auto=format&fit=crop",
  "tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea2dda9?q=80&w=500&auto=format&fit=crop",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop",
  "salade": "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=500&auto=format&fit=crop",
  "soupe": "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?q=80&w=500&auto=format&fit=crop",
  "poulet": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=500&auto=format&fit=crop",
  "boeuf": "https://images.unsplash.com/photo-1545465270-b28c0992c8ff?q=80&w=500&auto=format&fit=crop",
  "poisson": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500&auto=format&fit=crop",
  "pates": "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=500&auto=format&fit=crop",
  "riz": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=500&auto=format&fit=crop",
  "gateau": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=500&auto=format&fit=crop",
  "tarte": "https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?q=80&w=500&auto=format&fit=crop",
  "quiche": "https://images.unsplash.com/photo-1588165171080-c89acfa5a696?q=80&w=500&auto=format&fit=crop",
  "omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=500&auto=format&fit=crop",
  "curry": "https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=500&auto=format&fit=crop",
  "sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=500&auto=format&fit=crop",
  "yaourt": "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500&auto=format&fit=crop",
  "muesli": "https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=500&auto=format&fit=crop",
  "salade de fruits": "https://images.unsplash.com/photo-1566443280617-55417af5536d?q=80&w=500&auto=format&fit=crop",
  "smoothie": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=500&auto=format&fit=crop",
  "crepes": "https://images.unsplash.com/photo-1586489549737-34b078749399?q=80&w=500&auto=format&fit=crop"
};

// Liste d'images par défaut pour les catégories (à utiliser en fallback)
const defaultImages: Record<RecipeCategory, string[]> = {
  'Plats principaux': [
    'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=500&auto=format&fit=crop'
  ],
  'Desserts': [
    'https://images.unsplash.com/photo-1551024506-0bcbd69ad6b0?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542124937-d67b5330d973?q=80&w=500&auto=format&fit=crop'
  ],
  'Petit-déjeuner': [
    'https://images.unsplash.com/photo-1533089860892-a9c9970ae01a?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500&auto=format&fit=crop'
  ],
  'Collations': [
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=500&auto=format&fit=crop'
  ],
  'Soupes et salades': [
    'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=500&auto=format&fit=crop'
  ],
  'Accompagnements': [
    'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=500&auto=format&fit=crop'
  ]
};

/**
 * Trouve une image appropriée pour la recette en fonction de son nom et sa catégorie
 */
const findRecipeImage = (recipeName: string, category: RecipeCategory, imageQuery?: string): string => {
  // Normaliser le nom de la recette (en minuscules, sans accents)
  const normalizedName = recipeName.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // 1. Essayer de trouver une correspondance directe dans les images spécifiques
  for (const [keyword, imageUrl] of Object.entries(specificImages)) {
    if (normalizedName.includes(keyword)) {
      return imageUrl;
    }
  }
  
  // 2. Si un terme de recherche d'image est fourni, utiliser les mots-clés pour trouver une correspondance
  if (imageQuery) {
    const normalizedQuery = imageQuery.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    for (const [keyword, imageUrl] of Object.entries(specificImages)) {
      if (normalizedQuery.includes(keyword)) {
        return imageUrl;
      }
    }
  }
  
  // 3. Fallback: sélectionner une image aléatoire de la catégorie
  const randomIndex = Math.floor(Math.random() * defaultImages[category].length);
  return defaultImages[category][randomIndex];
};

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Le nom de la recette est requis' }, { status: 400 });
    }

    // Récupérer la clé API OpenAI
    const apiKey = getOpenAIApiKey(req);
    
    // Créer un client OpenAI avec la clé appropriée
    const openai = createOpenAIClient(apiKey);

    // Prompt pour générer les informations sur la recette
    const prompt = `
    Analyse le nom de cette recette: "${name}" et génère des informations détaillées pour une personne diabétique.
    Détermine à quelle catégorie elle appartient parmi ces options strictement: "Plats principaux", "Desserts", "Petit-déjeuner", "Collations", "Soupes et salades", "Accompagnements".
    Estime sa teneur en glucides pour 100g, sa portion standard et écris une description détaillée.
    Réponds uniquement au format JSON suivant:
    {
      "category": "une des catégories mentionnées ci-dessus",
      "carbs": nombre (teneur en glucides pour 100g),
      "description": "description détaillée de la recette avec conseils pour diabétiques",
      "portion": "description de la portion standard (ex: 200g, 1 part, etc.)",
      "imageQuery": "termes de recherche pour trouver une image pertinente de ce plat (ingrédients principaux, type de plat)"
    }
    `;

    // Appeler l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es un expert en nutrition spécialisé dans le diabète." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      stream: false,
    });

    // Extraire et parser la réponse
    const content = completion.choices[0].message.content;
    let recipeData;
    
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0]);
      } else if (content) {
        recipeData = JSON.parse(content);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON:', error);
      return NextResponse.json({ 
        error: 'Impossible de générer la recette',
        rawContent: content 
      }, { status: 500 });
    }

    // Vérifier que la catégorie est valide
    if (!Object.keys(defaultImages).includes(recipeData.category)) {
      recipeData.category = 'Plats principaux';
    }

    // Trouver une image appropriée pour cette recette
    const imageUrl = findRecipeImage(
      name, 
      recipeData.category as RecipeCategory, 
      recipeData.imageQuery
    );

    // Retourner les détails de la recette
    return NextResponse.json({
      name: name,
      category: recipeData.category,
      carbs: recipeData.carbs,
      description: recipeData.description,
      portion: recipeData.portion,
      imageUrl: imageUrl
    });

  } catch (error: any) {
    console.error('Erreur lors de la génération de la recette:', error);
    
    // Différencier les erreurs d'API OpenAI
    if (error.message && error.message.includes('API key')) {
      return NextResponse.json({ 
        error: 'Clé API OpenAI invalide ou expirée. Veuillez vérifier votre clé API dans les paramètres.'
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la génération de la recette' 
    }, { status: 500 });
  }
} 