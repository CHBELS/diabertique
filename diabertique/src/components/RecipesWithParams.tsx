'use client';

import React, { useState, useEffect } from 'react';
import { commonRecipes, recipeCategories, searchRecipes, saveRecipe } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Recipe, RecipeCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { addApiKeyToHeaders } from '@/components/ApiKeyManager';
import { useSearchParams } from 'next/navigation';
import RecipeDetailClient from '@/components/RecipeDetailClient';

export default function RecipesWithParams() {
  const searchParams = useSearchParams();
  const recipeId = searchParams?.get('id');
  
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');
  
  // Charger les recettes au chargement de la page
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // S'assurer qu'on est côté client avant d'accéder à localStorage
        const loadedRecipes = commonRecipes || [];
        
        // Récupérer les recettes stockées localement
        try {
          const localRecipes = localStorage.getItem('generatedRecipes');
          if (localRecipes) {
            const parsedLocalRecipes = JSON.parse(localRecipes);
            // Combiner les recettes communes et les recettes personnalisées
            setRecipes([...loadedRecipes, ...parsedLocalRecipes]);
          } else {
            setRecipes(loadedRecipes);
          }
        } catch (localErr) {
          console.error("Erreur lors de l'accès au stockage local:", localErr);
          setRecipes(loadedRecipes);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des recettes:", err);
      setRecipes([]);
    }
  }, []);
  
  // Filtrer les recettes en fonction de la catégorie active et du terme de recherche
  const filteredRecipes = React.useMemo(() => {
    // Vérifier si recipes est bien défini avant de filtrer
    if (!recipes || !Array.isArray(recipes)) {
      return [];
    }

    let filteredRecipes = recipes;
    
    // Si une catégorie spécifique est sélectionnée (différente de "Tous")
    if (activeCategory !== 'Tous') {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.category === activeCategory);
    }
    
    // Si un terme de recherche est présent
    if (searchQuery.trim()) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredRecipes;
  }, [activeCategory, searchQuery, recipes]);

  const generateRecipe = async (name: string) => {
    setIsCreatingRecipe(true);
    setError('');
    
    try {
      // Appel à l'API pour générer les détails de la recette
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la recette');
      }
      
      const data = await response.json();
      
      // Création d'une nouvelle recette avec les données générées
      const newRecipe: Recipe = {
        id: uuidv4(),
        name: name,
        category: data.category || 'Divers',
        carbs: data.carbs || 0,
        description: data.description || '',
        portion: data.portion || 'Inconnue',
        imageUrl: data.imageUrl || '',
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || []
      };
      
      // Ajout de la nouvelle recette à la liste affichée
      setRecipes(prev => [newRecipe, ...(prev || [])]);
      
      // Sauvegarde dans le stockage local
      if (typeof window !== 'undefined') {
        try {
          const existingRecipesJSON = localStorage.getItem('generatedRecipes');
          const existingRecipes = existingRecipesJSON ? JSON.parse(existingRecipesJSON) : [];
          localStorage.setItem('generatedRecipes', JSON.stringify([newRecipe, ...existingRecipes]));
        } catch (err) {
          console.error('Erreur lors de la sauvegarde dans localStorage:', err);
        }
      }
      
      // Réinitialisation du formulaire
      setNewRecipeName('');
      setShowAddForm(false);
      
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsCreatingRecipe(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecipeName.trim()) {
      generateRecipe(newRecipeName.trim());
    }
  };

  // Si un ID de recette est spécifié dans l'URL, afficher les détails de cette recette
  if (recipeId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <RecipeDetailClient params={{ id: recipeId }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 text-center md:text-left">
          Recettes et contenu en glucides
        </h1>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une recette
        </button>
      </div>

      {/* Formulaire d'ajout de recette */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Créer une nouvelle recette</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Nom de la recette
                </label>
                <input
                  type="text"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  placeholder="Ex: Poulet au curry, Tarte aux fraises..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  disabled={isCreatingRecipe}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Entrez seulement le nom du plat, l'IA générera automatiquement les détails!
                </p>
              </div>
              
              {error && (
                <div className="mb-4 text-red-500">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  disabled={isCreatingRecipe}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isCreatingRecipe || !newRecipeName.trim()}
                >
                  {isCreatingRecipe ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                    </>
                  ) : 'Créer la recette'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une recette..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Filtres par catégorie */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 pb-2 min-w-max">
          <button
            onClick={() => setActiveCategory('Tous')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === 'Tous'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Tous
          </button>
          
          {(recipeCategories || []).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des recettes */}
      {filteredRecipes.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Aucune recette trouvée pour "{searchQuery}" dans la catégorie "{activeCategory}".
          </p>
        </div>
      )}
    </div>
  );
} 