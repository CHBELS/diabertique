'use client';

import React, { useState, useRef } from 'react';
import { CameraIcon, ArrowUpTrayIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { saveUserRecord } from '@/utils/storage';
import { EnhancedFoodAnalysis } from '@/types';
import { addApiKeyToHeaders, addApiKeyToHeadersSync } from '@/components/ApiKeyManager';

export default function AnalysePhoto() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<EnhancedFoodAnalysis | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
        setError(null);
        setIsSaved(false);
        analyzeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    setShowCamera(true);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          setError("Impossible d'accéder à la caméra: " + err.message);
          setShowCamera(false);
        });
    } else {
      setError("La caméra n'est pas prise en charge par votre navigateur");
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/png');
        setSelectedImage(imageDataUrl);
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setShowCamera(false);
        
        // Automatically analyze the captured image
        setAnalysisResult(null);
        setError(null);
        setIsSaved(false);
        analyzeImage(imageDataUrl);
      }
    }
  };

  const analyzeImage = async (imageData: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convertir l'image base64 en blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Créer un objet FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('image', blob, 'food-image.jpg');

      // URL de base de l'application
      const baseUrl = window.location.origin;
      
      // Appeler l'API d'analyse avec les en-têtes appropriés - utiliser la version synchrone
      const apiResponse = await fetch(`${baseUrl}/api/analyze-food`, {
        method: 'POST',
        headers: addApiKeyToHeadersSync({
          // Ne pas définir Content-Type ici car le navigateur le fait automatiquement avec le boundary pour FormData
        }),
        body: formData,
        // Assurer que les cookies sont envoyés avec la requête
        credentials: 'include'
      });

      if (!apiResponse.ok) {
        let errorMessage = `Erreur HTTP: ${apiResponse.status}`;
        
        try {
          const errorData = await apiResponse.text();
          errorMessage = errorData || errorMessage;
        } catch (e) {
          console.error("Impossible de lire la réponse d'erreur", e);
        }
        
        throw new Error(errorMessage);
      }

      // Vérifier que la réponse contient du contenu
      const text = await apiResponse.text();
      if (!text || text.trim() === '') {
        throw new Error('Réponse vide du serveur');
      }

      const data = JSON.parse(text);
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse de l\'image');
      }

      // Mettre à jour l'état avec les résultats
      const result: EnhancedFoodAnalysis = {
        foodItems: data.foodItems || [],
        totalCarbs: data.totalCarbs || 0,
        carbsPerPortion: data.carbsPerPortion || 0,
        portionSize: data.portionSize || 'Standard',
        tips: data.tips || 'Aucun conseil spécifique pour ce plat.',
        imageUrl: imageData,
        timestamp: new Date().toISOString()
      };
      
      setAnalysisResult(result);
      console.log('Analyse complétée:', result);

    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'analyse');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnalysis = () => {
    if (analysisResult) {
      // Sauvegarder l'analyse avec l'image et les résultats
      saveUserRecord({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mealType: 'lunch', // Par défaut
        foodItems: analysisResult.foodItems.map(item => ({
          name: item,
          carbs: Math.round(analysisResult.totalCarbs / analysisResult.foodItems.length),
          imageUrl: analysisResult.imageUrl,
          timestamp: analysisResult.timestamp || new Date().toISOString()
        })),
        totalCarbs: analysisResult.totalCarbs
      });
      setIsSaved(true);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
    setIsSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 text-center">
        Analyse de photos d'aliments
      </h1>

      {!selectedImage && !showCamera ? (
        <div className="flex flex-col items-center justify-center space-y-6 mb-8">
          <p className="text-xl text-center text-gray-300 mb-4">
            Prenez une photo de votre repas ou téléchargez une image pour estimer le contenu en glucides
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleCameraCapture}
              className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Prendre une photo
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center bg-zinc-800 text-white px-6 py-3 rounded-full hover:bg-zinc-700 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Télécharger une image
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      ) : null}

      {showCamera && (
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-full max-w-lg mx-auto bg-zinc-900 rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-0 left-0 right-0 py-4 px-4 bg-black bg-opacity-50 flex justify-center">
              <button
                onClick={captureImage}
                className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2 rounded-full"
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Capturer
              </button>
              
              <button
                onClick={() => {
                  if (videoRef.current) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    if (stream) {
                      stream.getTracks().forEach(track => track.stop());
                    }
                  }
                  setShowCamera(false);
                }}
                className="flex items-center bg-zinc-700 text-white px-6 py-2 rounded-full ml-4"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && !showCamera && (
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-lg mx-auto bg-zinc-900 rounded-lg overflow-hidden">
            <img src={selectedImage} alt="Repas à analyser" className="w-full object-contain max-h-96" />
          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {!analysisResult && !isLoading && !error && (
              <button
                onClick={() => analyzeImage(selectedImage)}
                className="flex items-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Analyser cette image
              </button>
            )}
            
            <button
              onClick={resetAnalysis}
              className="flex items-center bg-zinc-800 text-white px-6 py-2 rounded-full hover:bg-zinc-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Nouvelle image
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-xl">Analyse en cours...</span>
        </div>
      )}

      {error && (
        <div className="w-full max-w-lg mx-auto bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-4 mb-8">
          <h3 className="text-red-400 text-lg font-medium mb-2">Erreur lors de l'analyse</h3>
          <p className="text-white">{error}</p>
        </div>
      )}

      {analysisResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Résultats de l'analyse</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Aliments identifiés:</h3>
              <ul className="list-disc pl-5 mt-2">
                {analysisResult.foodItems.map((item, index) => (
                  <li key={index} className="text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Glucides totaux</div>
                <div className="text-2xl font-bold text-blue-700">{analysisResult.totalCarbs}g</div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Par portion ({analysisResult.portionSize})</div>
                <div className="text-2xl font-bold text-blue-700">{analysisResult.carbsPerPortion}g</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">Conseils pour diabétiques:</h3>
              <p className="text-gray-600 mt-1">{analysisResult.tips}</p>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveAnalysis}
                disabled={isSaved}
                className={`px-4 py-2 rounded-lg ${
                  isSaved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                {isSaved ? 'Sauvegardé ✓' : 'Sauvegarder l\'analyse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 