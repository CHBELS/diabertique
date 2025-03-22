export interface Recipe {
  id: string;
  name: string;
  description: string;
  cookingTime: number;
  preparationTime: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  tags?: string[];
  nutritionalInfo?: {
    calories?: number;
    carbs?: number;
    proteins?: number;
    fats?: number;
    glycemicIndex?: number;
  };
} 