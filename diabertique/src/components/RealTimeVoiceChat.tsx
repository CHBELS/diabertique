'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopCircleIcon, SpeakerWaveIcon, BoltIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function RealTimeVoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const sessionInitializedRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialiser un identifiant de session unique
  useEffect(() => {
    setSessionId(`session_${Date.now()}`);
  }, []);
  
  // Faire défiler automatiquement vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const initializeSession = async () => {
    try {
      setDebugInfo("Initialisation de la session...");
      
      // Initialiser la session avec le serveur
      const response = await fetch('/api/openai/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          prompt: "Tu es un assistant spécialisé pour les personnes diabétiques. Réponds de manière concise, claire et en français."
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setDebugInfo(`Erreur d'initialisation: ${response.status} - ${errorText}`);
        return false;
      }
      
      const data = await response.json();
      
      if (data.status === 'session_initialized') {
        setDebugInfo("Session initialisée avec succès");
        sessionInitializedRef.current = true;
        return true;
      } else {
        setDebugInfo(`Erreur: ${data.error || 'Initialisation échouée'}`);
        return false;
      }
    } catch (err) {
      const error = err as Error;
      setDebugInfo(`Erreur d'initialisation: ${error.message}`);
      console.error('Erreur lors de l\'initialisation de la session:', error);
      return false;
    }
  };
  
  const startListening = async () => {
    try {
      setDebugInfo("Initialisation du microphone...");
      
      // Initialiser la session si ce n'est pas déjà fait
      if (!sessionInitializedRef.current) {
        const initialized = await initializeSession();
        if (!initialized) {
          return;
        }
      }
      
      // Initialiser le contexte audio
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Obtenir l'accès au microphone avec des contraintes de qualité
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100  // Fréquence d'échantillonnage standard
        } 
      });
      setDebugInfo("Microphone activé avec succès");
      
      // Priorité des formats pour une meilleure compatibilité avec Whisper
      const mimeTypePreference = [
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/webm;codecs=opus',
        'audio/webm'
      ];
      
      let selectedMimeType = '';
      
      // Trouver le premier format pris en charge
      for (const type of mimeTypePreference) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          console.log(`Format audio sélectionné: ${selectedMimeType}`);
          break;
        }
      }
      
      // Si aucun format préféré n'est supporté, utiliser le format par défaut
      if (!selectedMimeType) {
        selectedMimeType = 'audio/webm';
        console.log(`Aucun format préféré supporté, utilisation du format par défaut: ${selectedMimeType}`);
      }
      
      // Créer un nouvel enregistreur avec des paramètres optimaux
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000  // 128 kbps pour une qualité claire et un fichier plus petit
      });
      
      setDebugInfo(`Enregistrement en format: ${selectedMimeType}`);
      
      // Pour éviter de trop grandes quantités de données
      let audioChunks: Blob[] = [];
      let recordingStartTime = Date.now();
      let recordingTimeoutId: NodeJS.Timeout | null = null;
      
      // Maximum 10 secondes d'enregistrement pour éviter des fichiers trop volumineux
      const MAX_RECORDING_TIME = 10000; // 10 secondes
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunks.length === 0) {
          setDebugInfo("Aucune donnée audio enregistrée");
          return;
        }
        
        // Créer un nouveau blob avec tous les fragments audio
        const audioBlob = new Blob(audioChunks, { type: selectedMimeType });
        audioChunks = []; // Réinitialiser pour le prochain enregistrement
        
        setDebugInfo(`Audio enregistré: ${Math.round(audioBlob.size / 1024)} KB`);
        
        // Convertir en base64 et envoyer au serveur
        const fileReader = new FileReader();
        
        fileReader.onloadend = async () => {
          try {
            // Extraire la partie base64 du résultat
            const result = fileReader.result as string;
            const base64Audio = result.split(',')[1];
            
            setDebugInfo(`Envoi au serveur: ${Math.round(base64Audio.length / 1024)} KB`);
            
            // Envoyer l'audio au serveur
            const response = await fetch('/api/openai/realtime', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                session_id: sessionId,
                audio: base64Audio,
                format: selectedMimeType.split('/')[1].split(';')[0] // Extraire mp3, ogg, etc.
              })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              setDebugInfo(`Erreur API: ${response.status} - ${errorText}`);
              return;
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
              setDebugInfo("Réponse reçue avec succès");
              
              // Afficher la transcription
              if (data.transcription) {
                setTranscript(data.transcription);
              }
              
              // Ajouter les messages à la conversation
              setMessages(prevMessages => {
                // Filtrer le message d'enregistrement en cours et toute duplication potentielle
                const filteredMessages = prevMessages.filter(m => 
                  m.content !== 'Enregistrement en cours...' && 
                  m.content !== data.transcription
                );
                
                return [
                  ...filteredMessages,
                  { role: 'user', content: data.transcription || "J'ai posé une question audio" },
                  { role: 'assistant', content: data.text }
                ];
              });
              
              // Jouer l'audio de réponse
              if (data.audio) {
                playAudio(data.audio);
              }
            } else {
              setDebugInfo(`Erreur: ${data.error || 'Traitement audio échoué'}`);
            }
          } catch (err) {
            const error = err as Error;
            console.error('Erreur lors de l\'envoi de l\'audio:', error);
            setDebugInfo(`Erreur d'envoi: ${error.message}`);
          }
        };
        
        fileReader.readAsDataURL(audioBlob);
      };
      
      // Ajouter un message utilisateur
      setMessages(prevMessages => [...prevMessages, {
        role: 'user',
        content: 'Enregistrement en cours...'
      }]);
      
      // Démarrer l'enregistrement
      mediaRecorderRef.current.start(1000); // Enregistrer par intervalles de 1 seconde
      setIsListening(true);
      
      // Arrêter automatiquement après MAX_RECORDING_TIME
      recordingTimeoutId = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          setDebugInfo("Arrêt automatique après 10 secondes");
          stopListening();
        }
      }, MAX_RECORDING_TIME);
      
      // Stocker l'ID pour l'annuler plus tard si nécessaire
      (window as any).recordingTimeoutId = recordingTimeoutId;
      
      setDebugInfo("Enregistrement démarré (max 10s)");
      
    } catch (err) {
      const error = err as Error;
      console.error('Erreur lors du démarrage de l\'écoute:', error);
      setDebugInfo(`Erreur d'initialisation: ${error.message}`);
      alert('Impossible d\'accéder au microphone. Veuillez vérifier les permissions.');
    }
  };
  
  const stopListening = () => {
    // Annuler le timeout si présent
    if ((window as any).recordingTimeoutId) {
      clearTimeout((window as any).recordingTimeoutId);
      (window as any).recordingTimeoutId = null;
    }
    
    // Arrêter l'enregistrement
    if (mediaRecorderRef.current && isListening) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();  // Ceci déclenchera l'événement onstop
        setDebugInfo("Enregistrement arrêté, traitement de l'audio...");
      }
      
      // Arrêter tous les tracks audio
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsListening(false);
    }
  };
  
  const playAudio = (base64Audio: string) => {
    try {
      setDebugInfo("Lecture de l'audio...");
      setIsPlaying(true);
      
      const audioBlob = base64ToBlob(base64Audio, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
        setDebugInfo("Lecture audio terminée");
      };
      
      audioPlayerRef.current.play().catch(err => {
        const error = err as Error;
        console.error('Erreur lors de la lecture audio:', error);
        setDebugInfo(`Erreur de lecture: ${error.message}`);
        setIsPlaying(false);
      });
    } catch (err) {
      const error = err as Error;
      setDebugInfo(`Erreur de lecture audio: ${error.message}`);
      setIsPlaying(false);
    }
  };
  
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };
  
  const resetConversation = () => {
    setMessages([]);
    setTranscript('');
    setSessionId(`session_${Date.now()}`);
    sessionInitializedRef.current = false;
    setDebugInfo('Conversation réinitialisée');
  };
  
  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-zinc-800/50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-white/10 p-2 rounded-full mr-3">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">DiabetIA Vocal</h2>
            <div className="flex items-center">
              <span className={`w-2 h-2 ${isListening ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'} rounded-full mr-1`}></span>
              <span className="text-xs text-white/70">{isListening ? 'Écoute active' : 'En attente'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={resetConversation}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all hover:scale-110"
            title="Réinitialiser la conversation"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Corps de la conversation */}
      <div className="p-6 h-[500px] overflow-y-auto bg-gradient-to-b from-zinc-900/50 to-black/50 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-600/10 p-6 rounded-full mb-6">
              <SparklesIcon className="h-16 w-16 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Mode conversation vocale en temps réel
            </h3>
            <p className="text-zinc-400 max-w-md mb-8">
              Cliquez sur le bouton microphone ci-dessous pour démarrer une conversation vocale avec DiabetIA. 
              Parlez clairement et attendez la réponse vocale.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
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
                </div>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-400">V</span>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Indicateur de transcription en cours */}
        {isListening && transcript && (
          <div className="flex justify-end">
            <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
              <span className="text-xs font-bold text-blue-400">V</span>
            </div>
            <div className="max-w-[80%] px-5 py-3 rounded-2xl shadow-md bg-blue-700/40 text-white border border-blue-600/30 ml-2">
              <p className="whitespace-pre-wrap text-sm opacity-80">{transcript}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      
      {/* Pied avec boutons de contrôle */}
      <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-900/90 border-t border-zinc-800/50">
        <div className="flex items-center justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center justify-center p-5 rounded-full transition-all transform hover:scale-105 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-700/30'
            }`}
            title={isListening ? "Arrêter d'écouter" : "Commencer à écouter"}
          >
            {isListening ? (
              <StopCircleIcon className="h-8 w-8" />
            ) : (
              <MicrophoneIcon className="h-8 w-8" />
            )}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-zinc-400 text-sm">
            {isListening 
              ? "J'écoute... Parlez clairement puis attendez ma réponse" 
              : "Appuyez sur le bouton pour commencer à parler"}
          </p>
        </div>
        
        {showDebug && (
          <div className="mt-4 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs font-mono text-zinc-400 max-h-32 overflow-y-auto">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-blue-400">Debug</span>
              <button 
                onClick={() => setShowDebug(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                Fermer
              </button>
            </div>
            <p className="whitespace-pre-wrap">{debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
} 