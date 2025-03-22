'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  CameraIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import ApiKeyModal from '@/components/ApiKeyModal';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black">
      {/* Section Héro avec image en arrière-plan */}
      <div className="relative overflow-hidden">
        {/* Overlay gradient pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-zinc-900/80 z-10"></div>
        
        {/* Image d'arrière-plan */}
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full relative">
            <div className="absolute inset-0 bg-[url('/images/diabete/bg-diabetes.jpg')] bg-cover bg-center opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
          </div>
        </div>
        
        {/* Contenu héros */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            <span className="text-white">Anthony Couve</span>
          </h1>
          
          <p className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
            DiabetApp
          </p>
          
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto mb-10">
            Votre assistant intelligent pour gérer votre diabète au quotidien
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href="/chat-diabete" 
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-blue-900/30 transition-all duration-300 font-medium flex items-center justify-center">
              Commencer maintenant
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="#features" 
              className="px-8 py-4 bg-zinc-800/50 text-white border border-zinc-700/30 backdrop-blur-sm rounded-full hover:bg-zinc-700/50 transition-all duration-300 font-medium">
              Découvrir les fonctionnalités
            </Link>
          </div>
        </div>
      </div>
      
      {/* Section Caractéristiques */}
      <div id="features" className="py-16 md:py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              Des fonctionnalités pour vous simplifier la vie
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Assistant IA */}
            <div className="group relative bg-zinc-800 rounded-2xl p-8 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900/20 rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl w-fit mb-6">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">Assistant Diabète</h3>
                
                <p className="text-zinc-400 mb-6">
                  Posez toutes vos questions sur le diabète et obtenez des réponses précises et personnalisées.
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-zinc-500">
                  <MicrophoneIcon className="h-4 w-4" />
                  <span>Interaction vocale disponible</span>
                </div>
                
                <Link href="/chat-diabete" className="mt-6 inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300">
                  Discuter maintenant 
                  <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Analyse de plats */}
            <div className="group relative bg-zinc-800 rounded-2xl p-8 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900/20 rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl w-fit mb-6">
                  <CameraIcon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">Analyse de plats</h3>
                
                <p className="text-zinc-400 mb-6">
                  Photographiez votre repas pour estimer sa valeur nutritionnelle et son impact glycémique.
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-zinc-500">
                  <span className="inline-block h-2 w-2 bg-blue-500 rounded-full"></span>
                  <span>Intelligence artificielle avancée</span>
                </div>
                
                <Link href="/analyse-photo" className="mt-6 inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300">
                  Analyser un plat 
                  <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Recettes adaptées */}
            <div className="group relative bg-zinc-800 rounded-2xl p-8 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-zinc-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900/20 rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl w-fit mb-6">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">Recettes adaptées</h3>
                
                <p className="text-zinc-400 mb-6">
                  Découvrez des recettes délicieuses, équilibrées et adaptées aux personnes diabétiques.
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-zinc-500">
                  <span className="inline-block h-2 w-2 bg-blue-500 rounded-full"></span>
                  <span>Index glycémique contrôlé</span>
                </div>
                
                <Link href="/recettes" className="mt-6 inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300">
                  Explorer les recettes 
                  <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section Comment ça marche avec animation */}
      <div className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Comment ça fonctionne
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion sur desktop */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            
            {/* Étape 1 */}
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative z-10 bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mb-6">
                  1
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 text-center">Posez une question ou prenez une photo</h3>
              <p className="text-zinc-400 text-center">
                Utilisez l'application pour poser une question sur le diabète ou photographier votre repas.
              </p>
            </div>
            
            {/* Étape 2 */}
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
                <div className="relative z-10 bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mb-6">
                  2
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 text-center">Notre intelligence analyse les données</h3>
              <p className="text-zinc-400 text-center">
                Notre IA spécialisée en diabète analyse votre requête ou votre photo instantanément.
              </p>
            </div>
            
            {/* Étape 3 */}
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>
                <div className="relative z-10 bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mb-6">
                  3
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 text-center">Recevez des conseils personnalisés</h3>
              <p className="text-zinc-400 text-center">
                Obtenez des réponses précises et des recommandations adaptées à votre situation.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="py-16 md:py-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Commencez à gérer votre diabète intelligemment
          </h2>
          
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-10">
            Notre assistant IA vous accompagne au quotidien pour une meilleure qualité de vie avec le diabète.
          </p>
          
          <Link href="/chat-diabete" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
            Discuter avec l'assistant
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-12 bg-black border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Anthony Couve - DiabetApp</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Votre compagnon intelligent pour la gestion du diabète
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
              <Link href="/chat-diabete" className="text-zinc-400 hover:text-white transition-colors">
                Assistant Diabète
              </Link>
              <Link href="/analyse-photo" className="text-zinc-400 hover:text-white transition-colors">
                Analyse de plats
              </Link>
              <Link href="/recettes" className="text-zinc-400 hover:text-white transition-colors">
                Recettes adaptées
              </Link>
              <Link href="/mes-enregistrements" className="text-zinc-400 hover:text-white transition-colors">
                Mes enregistrements
              </Link>
            </div>
            
            <div className="text-zinc-500 text-xs">
              <p>© {new Date().getFullYear()} Anthony Couve - DiabetApp. Tous droits réservés.</p>
              <p className="mt-1">
                Développé par Bellilhomemade
              </p>
              <p className="mt-1">
                Les conseils fournis par cette application ne remplacent pas l'avis d'un professionnel de santé.
              </p>
              <button 
                onClick={() => setIsApiKeyModalOpen(true)}
                className="mt-3 text-zinc-600 hover:text-zinc-400 transition-colors flex items-center mx-auto opacity-50 hover:opacity-100"
              >
                <Cog6ToothIcon className="h-3 w-3 mr-1" />
                <span className="text-xs">Configuration API</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modal de configuration API */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </main>
  );
}
