'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getUserRecords, deleteUserRecord, getFoodAnalyses } from '@/utils/storage';
import { UserRecord, FoodAnalysis } from '@/types';

export default function MesEnregistrements() {
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<UserRecord | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FoodAnalysis | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecords(getUserRecords());
    setAnalyses(getFoodAnalyses());
  };

  const handleDeleteRecord = (id: string) => {
    deleteUserRecord(id);
    loadData();
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour traduire le type de repas
  const translateMealType = (mealType: string) => {
    const translations: Record<string, string> = {
      breakfast: 'Petit déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Collation'
    };
    return translations[mealType] || mealType;
  };
  
  const handleAnalysisClick = (analysis: FoodAnalysis) => {
    setSelectedAnalysis(analysis);
    setSelectedRecord(null);
  };
  
  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
            Mes Enregistrements
          </span>
        </h1>

        {selectedRecord && (
          <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400">
                {translateMealType(selectedRecord.mealType)} du {formatDate(selectedRecord.date)}
              </h2>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="text-zinc-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-1">Glucides totaux:</p>
              <p className="text-3xl font-bold text-blue-400">{selectedRecord.totalCarbs}g</p>
            </div>
            
            <div>
              <p className="text-gray-300 mb-2">Aliments:</p>
              <ul className="space-y-2">
                {selectedRecord.foodItems.map((item, index) => (
                  <li key={index} className="bg-zinc-800 rounded-lg p-3 flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.carbs}g</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {selectedAnalysis && (
          <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400">
                Analyse du {formatDate(selectedAnalysis.timestamp)}
              </h2>
              <button 
                onClick={() => setSelectedAnalysis(null)}
                className="text-zinc-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {selectedAnalysis.imageUrl && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={selectedAnalysis.imageUrl} 
                  alt={selectedAnalysis.name} 
                  className="max-h-64 object-contain rounded-lg border border-zinc-700"
                />
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-gray-300 mb-1">Aliment détecté:</p>
              <p className="text-xl font-medium">{selectedAnalysis.name}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-1">Glucides estimés:</p>
              <p className="text-3xl font-bold text-blue-400">{selectedAnalysis.carbs}g</p>
            </div>
            
            {selectedAnalysis.estimatedWeight && (
              <div>
                <p className="text-gray-300 mb-1">Poids estimé:</p>
                <p className="text-xl font-medium">{selectedAnalysis.estimatedWeight}g</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Historique des repas */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Historique des repas</h2>
            
            {records.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Aucun enregistrement trouvé. Ajoutez des repas pour les voir apparaître ici.
              </p>
            ) : (
              <div className="space-y-4">
                {records.map(record => (
                  <div 
                    key={record.id} 
                    className="bg-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-700 transition-colors"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">{translateMealType(record.mealType)}</h3>
                        <p className="text-gray-400 text-sm">{formatDate(record.date)}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-blue-400 mr-4">{record.totalCarbs}g</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecord(record.id);
                          }}
                          className="text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Analyses récentes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Analyses récentes</h2>
            
            {analyses.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Aucune analyse récente. Utilisez l'outil d'analyse photo pour en créer.
              </p>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis, index) => (
                  <div 
                    key={index}
                    className="bg-zinc-800 rounded-lg p-3 cursor-pointer hover:bg-zinc-700 transition-colors"
                    onClick={() => handleAnalysisClick(analysis)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{analysis.name}</h3>
                        <p className="text-gray-400 text-sm">{formatDate(analysis.timestamp)}</p>
                      </div>
                      <span className="text-lg font-bold text-blue-400">{analysis.carbs}g</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 