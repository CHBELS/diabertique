'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PaperAirplaneIcon, MicrophoneIcon, StopCircleIcon, SpeakerWaveIcon, TrashIcon, ArrowLeftIcon, SparklesIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { HeartIcon, LightBulbIcon, BeakerIcon } from '@heroicons/react/24/solid';
import { chatWithAssistant, transcribeAudio, generateSpeech } from '@/utils/openai';
import { ChatMessage } from '@/types';
import { saveChatMessage, getChatHistory, clearChatHistory } from '@/utils/storage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RealTimeVoiceChat from '@/components/RealTimeVoiceChat';

export default function ChatDiabete() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [activeTab, setActiveTab] = useState('text');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Charger l'historique des messages depuis le stockage local
  useEffect(() => {
    const history = getChatHistory();
    setMessages(history);
  }, []);

  // Faire défiler vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus sur l'input au chargement de la page
  useEffect(() => {
    if (activeTab === 'text' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    saveChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Préparer les messages pour l'API (uniquement le contenu et le rôle)
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Obtenir la réponse de l'assistant
      const response = await chatWithAssistant(apiMessages);
      
      // Ajouter la réponse de l'assistant
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      saveChatMessage(assistantMessage);
    } catch (error: any) {
      console.error('Erreur lors de la conversation:', error);
      
      // Message d'erreur plus explicite en fonction du type d'erreur
      let errorMessage = 'Erreur lors de la communication avec l\'assistant. Veuillez réessayer.';
      
      if (error.message && error.message.includes('API key')) {
        errorMessage = 'Clé API OpenAI manquante ou invalide. Veuillez configurer votre clé API dans les paramètres.';
      } else if (error.message && error.message.includes('network')) {
        errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.';
      }
      
      // Ajouter un message d'erreur dans la conversation
      const errorAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorAssistantMessage]);
      saveChatMessage(errorAssistantMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(audioBlob);
        
        try {
          setIsLoading(true);
          const transcription = await transcribeAudio(audioBlob);
          setInput(transcription.text);
        } catch (error) {
          console.error('Erreur lors de la transcription:', error);
          alert('Erreur lors de la transcription audio. Veuillez réessayer.');
        } finally {
          setIsLoading(false);
          // Arrêter tous les tracks audio pour libérer le microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      alert('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer toute la conversation ?')) {
      clearChatHistory();
      setMessages([]);
    }
  };

  const speakMessage = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Diviser le texte en phrases
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      
      for (const sentence of sentences) {
        if (sentence.trim().length > 0) {
          // Générer la parole à partir du texte
          const audioBlob = await generateSpeech(sentence.trim());
          
          // Créer une URL pour le blob audio
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Créer un élément audio pour la lecture
          if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio();
          }
          
          audioPlayerRef.current.src = audioUrl;
          
          // Attendre que la lecture soit terminée avant de passer à la suivante
          await new Promise((resolve) => {
            audioPlayerRef.current!.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve(null);
            };
            audioPlayerRef.current!.play();
          });
        }
      }
      
      setIsSpeaking(false);
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
      setIsSpeaking(false);
      alert('Impossible de lire le message audio. Veuillez réessayer.');
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  // Générer des exemples de questions basés sur des catégories
  const questionExamples = [
    { 
      icon: <HeartIcon className="w-5 h-5 text-blue-400" />, 
      category: "Santé", 
      question: "Quels sont les symptômes d'une hypoglycémie ?" 
    },
    { 
      icon: <BeakerIcon className="w-5 h-5 text-blue-400" />, 
      category: "Traitement", 
      question: "Comment calculer mes besoins en insuline ?" 
    },
    { 
      icon: <LightBulbIcon className="w-5 h-5 text-blue-400" />, 
      category: "Nutrition", 
      question: "Quels fruits ont un faible index glycémique ?" 
    }
  ];

  const handleExampleClick = (question: string) => {
    setInput(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Cercles décoratifs */}
      <div className="fixed top-20 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      <div className="fixed bottom-20 left-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête */}
        <header className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors group">
            <ArrowLeftIcon className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Retour à l'accueil</span>
          </Link>
          
          <div className="flex items-center">
            <div className="bg-blue-600/20 p-3 rounded-full mr-4">
              <SparklesIcon className="h-7 w-7 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              DiabetIA
            </h1>
          </div>
          
          <p className="text-zinc-400 mt-2 max-w-2xl">
            Votre assistant personnel pour la gestion du diabète. Posez toutes vos questions sur le diabète, l'alimentation, les traitements et la santé.
          </p>
        </header>
        
        {/* Onglets Mode Texte/Vocal */}
        <div className="mb-8">
          <div className="inline-flex bg-zinc-800/50 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
              }`}
            >
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-2" />
              <span>Mode Texte</span>
            </button>
            
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                activeTab === 'voice'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
              }`}
            >
              <SpeakerWaveIcon className="h-4 w-4 mr-2" />
              <span>Mode Vocal</span>
            </button>
          </div>
        </div>
        
        {activeTab === 'text' ? (
          <div className="max-w-4xl mx-auto">
            {/* Interface de chat textuel */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Messages */}
              <div className="p-6 h-[500px] overflow-y-auto bg-gradient-to-b from-zinc-900/30 to-black/30 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-blue-600/10 p-6 rounded-full mb-6">
                      <SparklesIcon className="h-16 w-16 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Bienvenue sur DiabetIA
                    </h3>
                    <p className="text-zinc-400 max-w-md mb-8">
                      Je suis votre assistant personnel pour toutes vos questions sur le diabète.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                      {[
                        "Comment calculer mes glucides ?",
                        "Quels fruits ont un index glycémique bas ?",
                        "Comment gérer l'hypoglycémie ?",
                        "Quels sont les signes de l'hyperglycémie ?"
                      ].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInput(example);
                            handleSendMessage();
                          }}
                          className="text-left p-3 bg-blue-600/10 rounded-lg border border-blue-500/20 text-blue-300 hover:bg-blue-600/20 transition-colors text-sm"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, i) => (
                      <div
                        key={i}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                            <SparklesIcon className="h-4 w-4 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-md ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                              : 'bg-zinc-800/80 text-zinc-200 backdrop-blur-sm border border-zinc-700/50'
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            {message.role === 'assistant' && (
                              <span className="text-xs font-medium text-blue-400">DIABETIA</span>
                            )}
                            {message.role === 'user' && (
                              <span className="text-xs font-medium text-blue-200">VOUS</span>
                            )}
                            <span className="text-xs ml-2 text-zinc-500">
                              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                            <span className="text-xs font-bold text-blue-400">V</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              
              {/* Formulaire */}
              <div className="p-4 border-t border-zinc-800/50 bg-gradient-to-r from-zinc-900 to-zinc-900/90">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-full transition-colors"
                    title="Effacer la conversation"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 bg-zinc-800/60 rounded-xl border border-zinc-700/50 focus-within:border-blue-500/50 transition-colors overflow-hidden">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Posez votre question sur le diabète..."
                      className="w-full bg-transparent px-4 py-3 text-white focus:outline-none"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || input.trim() === ''}
                    className={`p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-colors ${
                      isLoading || input.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          // Interface vocale
          <RealTimeVoiceChat />
        )}
      </div>
    </div>
  );
} 