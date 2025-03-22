"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllRecipes } from '@/lib/recipes';
import { Recipe } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetailClient from '@/components/RecipeDetailClient';
import SearchBar from '@/components/SearchBar';

// Composant qui utilise useSearchParams et qui sera enveloppé dans Suspense
function RecipeListWithParams() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  const recipeId = searchParams?.get('id') || null;

  useEffect(() => {
    const fetchRecipes = async () => {
      const allRecipes = await getAllRecipes();
      setRecipes(allRecipes);
    };
    fetchRecipes();
  }, []);

  // Filtrer les recettes en fonction de la recherche
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Si un ID de recette est spécifié dans l'URL, afficher le détail de la recette
  if (recipeId) {
    return <RecipeDetailClient recipeId={recipeId} />;
  }

  // Sinon, afficher la liste des recettes
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Recettes adaptées aux diabétiques</h1>
      
      <div className="mb-8">
        <SearchBar 
          placeholder="Rechercher une recette..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredRecipes.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-xl">Aucune recette ne correspond à votre recherche.</p>
          <p className="mt-2">Essayez avec des termes différents ou consultez toutes nos recettes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id}
              recipe={recipe}
              useQueryParam={true} // Utiliser ?id= au lieu de /id
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Composant principal qui enveloppe RecipeListWithParams dans Suspense
export default function RecipeListClient() {
  return (
    <Suspense fallback={<div className="text-center p-8">Chargement des recettes...</div>}>
      <RecipeListWithParams />
    </Suspense>
  );
} 