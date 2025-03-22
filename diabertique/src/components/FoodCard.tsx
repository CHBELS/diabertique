import React from 'react';
import { FoodAnalysis } from '@/types';

interface FoodCardProps {
  food: FoodAnalysis;
  onSave?: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onSave }) => {
  const formattedDate = new Date(food.timestamp).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {food.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={food.imageUrl} 
            alt={food.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{food.name}</h3>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Glucides:</span>
          <span className="font-bold text-blue-600">{food.carbs}g</span>
        </div>
        
        {food.estimatedWeight && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Poids estimé:</span>
            <span>{food.estimatedWeight}g</span>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-3">
          Analysé le {formattedDate}
        </div>
        
        {onSave && (
          <button
            onClick={onSave}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Enregistrer
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodCard; 