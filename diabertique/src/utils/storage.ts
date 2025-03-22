import { FoodAnalysis, UserRecord, ChatMessage } from '@/types';

// Clés de stockage
const FOOD_ANALYSES_KEY = 'diabertique-food-analyses';
const USER_RECORDS_KEY = 'diabertique-user-records';
const CHAT_HISTORY_KEY = 'diabertique-chat-history';

// Fonctions pour les analyses alimentaires
export function saveFoodAnalysis(analysis: FoodAnalysis): void {
  const existingData = getFoodAnalyses();
  localStorage.setItem(FOOD_ANALYSES_KEY, JSON.stringify([...existingData, analysis]));
}

export function getFoodAnalyses(): FoodAnalysis[] {
  const data = localStorage.getItem(FOOD_ANALYSES_KEY);
  return data ? JSON.parse(data) : [];
}

// Fonctions pour les enregistrements utilisateur
export function saveUserRecord(record: UserRecord): void {
  const existingData = getUserRecords();
  localStorage.setItem(USER_RECORDS_KEY, JSON.stringify([...existingData, record]));
}

export function getUserRecords(): UserRecord[] {
  const data = localStorage.getItem(USER_RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserRecordById(id: string): UserRecord | undefined {
  const records = getUserRecords();
  return records.find(record => record.id === id);
}

export function deleteUserRecord(id: string): void {
  const records = getUserRecords();
  const filteredRecords = records.filter(record => record.id !== id);
  localStorage.setItem(USER_RECORDS_KEY, JSON.stringify(filteredRecords));
}

// Fonctions pour l'historique des chats
export function saveChatMessage(message: ChatMessage): void {
  const existingData = getChatHistory();
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([...existingData, message]));
}

export function getChatHistory(): ChatMessage[] {
  const data = localStorage.getItem(CHAT_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearChatHistory(): void {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([]));
} 