import { Recipe, RecipeCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Clé pour le stockage local des recettes
const RECIPES_STORAGE_KEY = 'diabetique_user_recipes';

export const recipeCategories: RecipeCategory[] = [
  'Plats principaux',
  'Desserts',
  'Petit-déjeuner',
  'Collations',
  'Soupes et salades',
  'Accompagnements'
];

// Les recettes de base fournies avec l'application
export const defaultRecipes: Recipe[] = [
  // Plats principaux
  {
    id: uuidv4(),
    name: 'Pâtes bolognaise',
    category: 'Plats principaux',
    carbs: 30,
    description: 'Pâtes avec sauce à la viande tomate et légumes. Riche en protéines et source de fibres grâce aux légumes dans la sauce.',
    portion: '100g de pâtes cuites + 150g de sauce',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Pizza Margherita',
    category: 'Plats principaux',
    carbs: 33,
    description: 'Pizza classique avec sauce tomate et mozzarella. Une option de repas occasionnel pour les personnes diabétiques.',
    portion: '1 part moyenne (100g)',
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Riz au poulet',
    category: 'Plats principaux',
    carbs: 28,
    description: 'Riz blanc avec morceaux de poulet et légumes. Un plat équilibré riche en protéines et en glucides complexes.',
    portion: '200g',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Lasagnes',
    category: 'Plats principaux',
    carbs: 23,
    description: 'Lasagnes à la bolognaise avec béchamel. Un plat riche en protéines avec une teneur modérée en glucides.',
    portion: '1 portion (250g)',
    imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Sandwich au jambon',
    category: 'Plats principaux',
    carbs: 30,
    description: 'Sandwich avec pain blanc, jambon, beurre et salade. Un repas pratique à faible indice glycémique si préparé avec du pain complet.',
    portion: '1 sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Saumon grillé aux légumes',
    category: 'Plats principaux',
    carbs: 12,
    description: 'Pavé de saumon grillé servi avec des légumes de saison. Excellent choix pour les diabétiques grâce à sa faible teneur en glucides et ses acides gras oméga-3.',
    portion: '150g de saumon + 100g de légumes',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Poulet rôti aux herbes',
    category: 'Plats principaux',
    carbs: 3,
    description: 'Poulet rôti assaisonné aux herbes de Provence. Très faible en glucides, ce plat est idéal pour contrôler la glycémie.',
    portion: '150g',
    imageUrl: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Ratatouille',
    category: 'Plats principaux',
    carbs: 10,
    description: 'Mélange de légumes du sud mijotés avec des herbes aromatiques. Un plat végétarien faible en glucides et riche en fibres.',
    portion: '250g',
    imageUrl: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?q=80&w=500&auto=format&fit=crop'
  },
  
  // Desserts
  {
    id: uuidv4(),
    name: 'Mousse au chocolat',
    category: 'Desserts',
    carbs: 20,
    description: 'Dessert aérien au chocolat noir. Version allégée en sucre, adaptée pour les personnes diabétiques en consommation modérée.',
    portion: '1 ramequin (100g)',
    imageUrl: 'https://images.unsplash.com/photo-1514508985285-52fa488e199a?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Tarte aux pommes',
    category: 'Desserts',
    carbs: 45,
    description: 'Tarte sucrée avec garniture aux pommes. À consommer occasionnellement et en petite portion pour les diabétiques.',
    portion: '1 part (120g)',
    imageUrl: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Crème caramel',
    category: 'Desserts',
    carbs: 26,
    description: 'Dessert à base de crème et caramel. Version allégée en sucre pour une option de dessert occasionnel.',
    portion: '1 pot (125g)',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0bfdf63?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Salade de fruits frais',
    category: 'Desserts',
    carbs: 15,
    description: 'Mélange de fruits frais de saison sans sucre ajouté. Une option saine riche en fibres et vitamines pour les diabétiques.',
    portion: '150g',
    imageUrl: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Yaourt grec aux myrtilles',
    category: 'Desserts',
    carbs: 12,
    description: 'Yaourt grec nature avec des myrtilles fraîches et un peu de miel. Faible en glucides et riche en protéines.',
    portion: '150g',
    imageUrl: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?q=80&w=500&auto=format&fit=crop'
  },
  
  // Petit-déjeuner
  {
    id: uuidv4(),
    name: 'Céréales avec lait',
    category: 'Petit-déjeuner',
    carbs: 60,
    description: 'Céréales de type corn flakes avec lait demi-écrémé. Optez pour des céréales complètes à faible indice glycémique pour un meilleur contrôle de la glycémie.',
    portion: '30g de céréales + 125ml de lait',
    imageUrl: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Tartines beurre et confiture',
    category: 'Petit-déjeuner',
    carbs: 40,
    description: 'Pain de mie avec beurre et confiture de fraise. Préférez du pain complet et de la confiture sans sucre ajouté pour réduire l\'impact glycémique.',
    portion: '2 tranches avec garniture',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Croissant',
    category: 'Petit-déjeuner',
    carbs: 25,
    description: 'Viennoiserie feuilletée au beurre. À consommer occasionnellement par les personnes diabétiques en raison de sa teneur élevée en matières grasses et en glucides.',
    portion: '1 croissant (60g)',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Omelette aux légumes',
    category: 'Petit-déjeuner',
    carbs: 5,
    description: 'Omelette avec poivrons, oignons et épinards. Un petit-déjeuner riche en protéines et très faible en glucides, idéal pour les diabétiques.',
    portion: '1 omelette (200g)',
    imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Porridge à l\'avoine',
    category: 'Petit-déjeuner',
    carbs: 27,
    description: 'Flocons d\'avoine cuits avec du lait et garnis de fruits. Un petit-déjeuner équilibré avec des glucides à libération lente.',
    portion: '200g',
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=500&auto=format&fit=crop'
  },
  
  // Collations
  {
    id: uuidv4(),
    name: 'Pomme',
    category: 'Collations',
    carbs: 14,
    description: 'Fruit frais entier. Les pommes ont un indice glycémique bas et sont riches en fibres, ce qui en fait une excellente collation pour les diabétiques.',
    portion: '1 moyenne (150g)',
    imageUrl: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Yaourt nature',
    category: 'Collations',
    carbs: 5,
    description: 'Yaourt nature sans sucre ajouté. Une option riche en protéines et faible en glucides, idéale pour une collation équilibrée.',
    portion: '1 pot (125g)',
    imageUrl: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Barre de céréales',
    category: 'Collations',
    carbs: 20,
    description: 'Barre aux céréales et fruits secs. Choisissez des versions à faible teneur en sucres ajoutés pour limiter l\'impact sur la glycémie.',
    portion: '1 barre (30g)',
    imageUrl: 'https://images.unsplash.com/photo-1490567674467-85447a82593a?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Noix mixtes',
    category: 'Collations',
    carbs: 5,
    description: 'Mélange de noix non salées (amandes, noix, noisettes). Une excellente source de graisses saines et très faible en glucides.',
    portion: '30g',
    imageUrl: 'https://images.unsplash.com/photo-1525904333075-ce0186549ae2?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Fromage et crackers',
    category: 'Collations',
    carbs: 10,
    description: 'Fromage à pâte dure avec crackers de seigle. Une collation équilibrée combinant protéines et glucides complexes.',
    portion: '30g de fromage + 2 crackers',
    imageUrl: 'https://images.unsplash.com/photo-1505575967455-40e256f73376?q=80&w=500&auto=format&fit=crop'
  },
  
  // Soupes et salades
  {
    id: uuidv4(),
    name: 'Soupe de légumes',
    category: 'Soupes et salades',
    carbs: 10,
    description: 'Soupe maison aux légumes variés. Faible en glucides et riche en fibres, nutriments et antioxydants.',
    portion: '1 bol (250ml)',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Salade César',
    category: 'Soupes et salades',
    carbs: 7,
    description: 'Salade avec laitue, poulet, parmesan et croûtons. Demandez la sauce à part pour contrôler l\'apport en glucides.',
    portion: '1 assiette (200g)',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Soupe de lentilles',
    category: 'Soupes et salades',
    carbs: 20,
    description: 'Soupe consistante aux lentilles et légumes. Riche en protéines végétales et en fibres pour un meilleur contrôle de la glycémie.',
    portion: '250ml',
    imageUrl: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Salade grecque',
    category: 'Soupes et salades',
    carbs: 5,
    description: 'Salade de concombre, tomate, oignon, olives et feta. Très faible en glucides et riche en graisses saines.',
    portion: '200g',
    imageUrl: 'https://images.unsplash.com/photo-1563252720-7e5bd60490c4?q=80&w=500&auto=format&fit=crop'
  },
  
  // Accompagnements
  {
    id: uuidv4(),
    name: 'Purée de pommes de terre',
    category: 'Accompagnements',
    carbs: 15,
    description: 'Purée de pommes de terre au beurre et lait. Un accompagnement classique avec un indice glycémique modéré.',
    portion: '100g',
    imageUrl: 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Haricots verts',
    category: 'Accompagnements',
    carbs: 7,
    description: 'Haricots verts cuits à la vapeur. Un légume vert faible en glucides et riche en fibres, parfait pour les diabétiques.',
    portion: '100g',
    imageUrl: 'https://images.unsplash.com/photo-1601493700611-3b716f4df7f9?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Riz basmati',
    category: 'Accompagnements',
    carbs: 28,
    description: 'Riz à grain long cuit à l\'eau. A un indice glycémique plus bas que le riz blanc ordinaire, ce qui en fait un meilleur choix pour les diabétiques.',
    portion: '100g cuit',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Quinoa aux herbes',
    category: 'Accompagnements',
    carbs: 20,
    description: 'Quinoa cuit avec des herbes fraîches. Une pseudo-céréale riche en protéines avec un indice glycémique bas.',
    portion: '100g',
    imageUrl: 'https://images.unsplash.com/photo-1544899447-ac1559ffcef2?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: uuidv4(),
    name: 'Légumes rôtis',
    category: 'Accompagnements',
    carbs: 8,
    description: 'Mélange de légumes (carottes, courgettes, poivrons) rôtis au four. Faible en glucides et riche en nutriments.',
    portion: '100g',
    imageUrl: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2a?q=80&w=500&auto=format&fit=crop'
  }
];

// Récupère toutes les recettes (par défaut + ajoutées par l'utilisateur)
export const getAllRecipes = (): Recipe[] => {
  if (typeof window === 'undefined') {
    return defaultRecipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      tags: recipe.tags || []
    }));
  }

  try {
    const savedRecipesJSON = localStorage.getItem(RECIPES_STORAGE_KEY);
    let savedRecipes = savedRecipesJSON ? JSON.parse(savedRecipesJSON) : [];
    
    // S'assurer que toutes les recettes ont les tableaux requis
    savedRecipes = savedRecipes.map((recipe: Recipe) => ({
      ...recipe,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      tags: recipe.tags || []
    }));
    
    const safeDefaultRecipes = defaultRecipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      tags: recipe.tags || []
    }));
    
    return [...savedRecipes, ...safeDefaultRecipes];
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes:', error);
    return defaultRecipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      tags: recipe.tags || []
    }));
  }
};

// Sauvegarde une nouvelle recette
export const saveRecipe = (recipe: Recipe): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const savedRecipesJSON = localStorage.getItem(RECIPES_STORAGE_KEY);
    const savedRecipes = savedRecipesJSON ? JSON.parse(savedRecipesJSON) : [];
    const updatedRecipes = [recipe, ...savedRecipes];
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la recette:', error);
  }
};

// Supprime une recette utilisateur
export const deleteRecipe = (recipeId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const savedRecipesJSON = localStorage.getItem(RECIPES_STORAGE_KEY);
    const savedRecipes = savedRecipesJSON ? JSON.parse(savedRecipesJSON) : [];
    const updatedRecipes = savedRecipes.filter((recipe: Recipe) => recipe.id !== recipeId);
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
  } catch (error) {
    console.error('Erreur lors de la suppression de la recette:', error);
  }
};

export const commonRecipes = typeof window !== 'undefined' ? getAllRecipes() : defaultRecipes;

export function getRecipesByCategory(category: RecipeCategory): Recipe[] {
  return getAllRecipes().filter(recipe => recipe.category === category);
}

export function getRecipeById(id: string): Recipe | undefined {
  return getAllRecipes().find(recipe => recipe.id === id);
}

export function searchRecipes(query: string): Recipe[] {
  const lowerCaseQuery = query.toLowerCase();
  return getAllRecipes().filter(recipe => 
    recipe.name.toLowerCase().includes(lowerCaseQuery) || 
    recipe.description.toLowerCase().includes(lowerCaseQuery)
  );
} 