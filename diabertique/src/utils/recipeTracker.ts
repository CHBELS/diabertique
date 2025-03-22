import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const VISITED_RECIPES_KEY = 'diabertique_visited_recipes';
const isNative = Capacitor.isNativePlatform();

/**
 * Enregistre l'ID d'une recette visitée pour les futures générations statiques
 * En environnement web, sauvegarde dans localStorage pour référence future
 */
export const trackRecipeVisit = async (recipeId: string): Promise<void> => {
  if (!recipeId) return;

  try {
    // Stocker dans les préférences utilisateur (pour tous les environnements)
    let visitedRecipes: string[] = [];
    
    if (isNative) {
      // Mode natif (Android/iOS)
      const { value } = await Preferences.get({ key: VISITED_RECIPES_KEY });
      if (value) {
        visitedRecipes = JSON.parse(value);
      }
    } else {
      // Mode web
      const storedValue = localStorage.getItem(VISITED_RECIPES_KEY);
      if (storedValue) {
        visitedRecipes = JSON.parse(storedValue);
      }
    }
    
    // Ajouter l'ID s'il n'existe pas déjà
    if (!visitedRecipes.includes(recipeId)) {
      visitedRecipes.push(recipeId);
      
      // Sauvegarder dans les préférences
      if (isNative) {
        await Preferences.set({
          key: VISITED_RECIPES_KEY,
          value: JSON.stringify(visitedRecipes)
        });
      } else {
        localStorage.setItem(VISITED_RECIPES_KEY, JSON.stringify(visitedRecipes));
        
        // Afficher un message en mode développement pour rappeler de mettre à jour le fichier public/user_recipes.json
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] Nouvel ID de recette visité: ${recipeId}`);
          console.log(`[DEV] N'oubliez pas d'ajouter cet ID à public/user_recipes.json pour le prochain build.`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du suivi de la recette:', error);
  }
}; 