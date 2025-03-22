'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { commonRecipes, recipeCategories, searchRecipes, saveRecipe } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Recipe, RecipeCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { addApiKeyToHeaders } from '@/components/ApiKeyManager';
import RecipeDetailClient from '@/components/RecipeDetailClient';

// Composant client séparé pour gérer les paramètres de recherche
import RecipesWithParams from '@/components/RecipesWithParams';

export default function Recettes() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <RecipesWithParams />
    </Suspense>
  );
} 