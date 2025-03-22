// Exporter tous les types
// export * from './recipe';

export interface FoodAnalysis {
  name: string;
  carbs: number; // en grammes
  estimatedWeight?: number; // poids estimé en grammes
  imageUrl?: string;
  timestamp: string;
}

export interface EnhancedFoodAnalysis {
  foodItems: string[];
  totalCarbs: number;
  carbsPerPortion: number;
  portionSize: string;
  tips: string;
  imageUrl?: string;
  timestamp?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  carbs: number; // glucides par 100g
  description: string;
  portion: string;
  prepTime?: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  imageUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserRecord {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: FoodAnalysis[];
  totalCarbs: number;
}

export interface OpenAIVisionResponse {
  carbs: number;
  name: string;
  estimatedWeight?: number;
  details?: string;
}

export interface OpenAIAudioResponse {
  text: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  language: string;
  duration?: number;
}

export type RecipeCategory = 
  | 'Plats principaux' 
  | 'Desserts' 
  | 'Petit-déjeuner' 
  | 'Collations'
  | 'Soupes et salades'
  | 'Accompagnements'; 