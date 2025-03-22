import React from 'react';
import { Recipe } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface RecipeCardProps {
  recipe: Recipe;
  useQueryParam?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, useQueryParam = false }) => {
  const recipeUrl = `/recettes?id=${recipe.id}`;
    
  return (
    <Link href={recipeUrl} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer h-full border border-gray-200">
        {recipe.imageUrl ? (
          <div className="h-48 overflow-hidden relative">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Pas d'image</span>
          </div>
        )}
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{recipe.name}</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Glucides:</span>
            <span className="font-bold text-blue-600">{recipe.carbs}g / 100g</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Portion:</span>
            <span className="text-gray-800">{recipe.portion}</span>
          </div>
          
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {recipe.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mt-3 line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard; 