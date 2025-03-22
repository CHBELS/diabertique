'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecipeById, getAllRecipes } from '@/lib/recipes';
import { Recipe } from '@/types';
import { ArrowLeftIcon, PlusIcon, MinusIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { trackRecipeVisit } from '@/utils/recipeTracker';
import { motion } from 'framer-motion';

// Type pour les props
type RecipeDetailClientProps = {
  params: {
    id: string;
  };
};

// Composant client pour la page de détail de recette
export default function RecipeDetailClient({ params }: RecipeDetailClientProps) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [grammes, setGrammes] = useState(100);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!params || !params.id) {
        setError("ID de recette manquant");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Récupérer toutes les recettes
        const allRecipes = getAllRecipes();
        
        // Rechercher la recette par ID
        const foundRecipe = allRecipes.find(r => r.id === params.id);
        
        if (foundRecipe) {
          // S'assurer que les propriétés requises existent
          const safeRecipe = {
            ...foundRecipe,
            ingredients: foundRecipe.ingredients || [],
            instructions: foundRecipe.instructions || [],
            tags: foundRecipe.tags || []
          };
          setRecipe(safeRecipe);
          setTotalCarbs(foundRecipe.carbs);
          setError(null);
        } else {
          // Si la recette n'est pas trouvée, essayer de la récupérer depuis le stockage local
          try {
            const localRecipes = localStorage.getItem('generatedRecipes');
            if (localRecipes) {
              const parsedLocalRecipes = JSON.parse(localRecipes);
              const localRecipe = parsedLocalRecipes.find((r: Recipe) => r.id === params.id);
              
              if (localRecipe) {
                // S'assurer que les propriétés requises existent
                const safeRecipe = {
                  ...localRecipe,
                  ingredients: localRecipe.ingredients || [],
                  instructions: localRecipe.instructions || [],
                  tags: localRecipe.tags || []
                };
                setRecipe(safeRecipe);
                setTotalCarbs(localRecipe.carbs);
                setError(null);
              } else {
                setError("Recette non trouvée. Il est possible qu'elle ait été créée après la compilation de l'application.");
              }
            } else {
              setError("Recette non trouvée. Il est possible qu'elle ait été créée après la compilation de l'application.");
            }
          } catch (localErr) {
            console.error("Erreur lors de l'accès au stockage local:", localErr);
            setError("Erreur lors de l'accès au stockage local.");
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la recette:", err);
        setError("Erreur lors du chargement de la recette. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [params?.id]);

  useEffect(() => {
    if (recipe) {
      // Calculer les glucides en fonction du grammage
      const calculatedCarbs = (grammes / 100) * recipe.carbs;
      setTotalCarbs(parseFloat(calculatedCarbs.toFixed(1)));
    }
  }, [grammes, recipe]);

  const handleBack = () => {
    router.push('/recettes');
  };

  const incrementWeight = () => {
    setGrammes(prev => prev + 25);
  };

  const decrementWeight = () => {
    setGrammes(prev => Math.max(25, prev - 25));
  };

  const handleGrammageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setGrammes(value);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux recettes
        </button>
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voir toutes les recettes
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux recettes
        </button>
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">Recette introuvable</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voir toutes les recettes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <button
        onClick={handleBack}
        className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Retour aux recettes
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Image de la recette */}
        {recipe.imageUrl && (
          <div className="mb-6 overflow-hidden rounded-lg h-64">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4 text-gray-800">{recipe.name}</h1>
        
        {recipe.prepTime && (
          <div className="flex items-center mb-4 text-gray-600">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>{recipe.prepTime}</span>
          </div>
        )}
        
        {/* Section pour afficher et calculer les glucides */}
        <div className="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">Information nutritionnelle</h2>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-gray-700">Teneur en glucides:</span>
            <span className="font-bold text-blue-600">{recipe.carbs}g / 100g</span>
          </div>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-gray-700">Portion standard:</span>
            <span className="text-gray-800">{recipe.portion}</span>
          </div>
          
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Calculer les glucides pour:
            </label>
            
            <div className="flex items-center">
              <button
                onClick={decrementWeight}
                className="h-10 w-10 rounded-l-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center"
              >
                <MinusIcon className="h-4 w-4 text-blue-600" />
              </button>
              
              <input
                type="number"
                value={grammes}
                onChange={handleGrammageChange}
                className="h-10 w-20 text-center border-y border-blue-200 focus:outline-none text-gray-800"
                min="25"
                step="25"
              />
              
              <button
                onClick={incrementWeight}
                className="h-10 w-10 rounded-r-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4 text-blue-600" />
              </button>
              
              <span className="ml-2 text-gray-700">grammes</span>
            </div>
            
            <div className="mt-4 bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between">
              <span className="text-gray-700">Glucides totaux:</span>
              <span className="text-xl font-bold text-blue-700">{totalCarbs}g</span>
            </div>
          </div>
        </div>
        
        <p className="mb-6 text-gray-700">{recipe.description}</p>
        
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Ingrédients:</h2>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
        
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Instructions:</h2>
            <ol className="list-decimal pl-5 space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{instruction}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
        
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 