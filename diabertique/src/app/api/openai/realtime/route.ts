// Pour compatibilité avec l'export statique de Capacitor
export const dynamic = "force-static";
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { AzureKeyCredential } from "@azure/core-auth";
import { LowLevelRTClient } from "rt-client";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_REALTIME_MODEL || "gpt-4o-mini-realtime-preview"; // Modèle Realtime
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API OpenAI non configurée' }, { status: 500 });
    }
    
    const body = await req.json();
    const { audio, session_id, prompt, format } = body;
    
    if (!session_id) {
      return NextResponse.json({ error: 'Identifiant de session manquant' }, { status: 400 });
    }

    // Vérifier si l'API a été initialisée pour cette session
    const sessionData = sessions.get(session_id);
    
    if (audio && sessionData) {
      // Si nous recevons de l'audio et que la session existe, transcrivons-le d'abord avec Whisper
      console.log(`Réception d'audio pour la session ${session_id}, format: ${format || 'non spécifié'}`);
      
      try {
        // 1. Transcription avec Whisper
        const audioTranscription = await transcribeAudio(audio, apiKey, format);
        console.log("Transcription:", audioTranscription);
        
        if (!audioTranscription) {
          throw new Error("Échec de la transcription audio");
        }
        
        // 2. Envoi à ChatGPT avec la transcription réelle
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              ...sessionData.messages,
              { 
                role: 'user', 
                content: audioTranscription
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
            stream: false
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Erreur API: ${response.status} - ${error}`);
        }
        
        const result = await response.json();
        const assistantMessage = result.choices[0].message.content;
        
        // Ajouter le message à l'historique
        sessionData.messages.push({ role: 'user', content: audioTranscription });
        sessionData.messages.push({ role: 'assistant', content: assistantMessage });
        
        // Mettre à jour la session
        sessions.set(session_id, sessionData);
        
        // Générer l'audio de la réponse
        const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'shimmer',
            input: assistantMessage
          })
        });
        
        if (!audioResponse.ok) {
          const error = await audioResponse.text();
          throw new Error(`Erreur API Audio: ${audioResponse.status} - ${error}`);
        }
        
        const audioData = await audioResponse.arrayBuffer();
        const base64Audio = Buffer.from(audioData).toString('base64');
        
        return NextResponse.json({ 
          status: 'success',
          text: assistantMessage,
          audio: base64Audio,
          transcription: audioTranscription  // Retourner la transcription pour l'afficher
        });
      } catch (err) {
        const error = err as Error;
        console.error("Erreur lors du traitement de l'audio:", error.message);
        return NextResponse.json({ error: `Erreur lors du traitement de l'audio: ${error.message}` }, { status: 500 });
      }
    } else {
      // Si nous ne recevons pas d'audio ou si la session n'existe pas, initialisons une nouvelle session
      console.log(`Initialisation d'une nouvelle session ${session_id} avec prompt: ${prompt || 'défaut'}`);
      
      try {
        // Créer une nouvelle session avec un message initial
        const systemPrompt = prompt || "Tu es un assistant spécialisé pour les personnes diabétiques, réponds de manière concise, claire et en français.";
        
        // Stocker la session
        sessions.set(session_id, {
          id: session_id,
          messages: [
            { role: 'system', content: systemPrompt }
          ],
          created_at: new Date().toISOString()
        });
        
        return NextResponse.json({ 
          status: 'session_initialized',
          message: 'Session initialisée avec succès'
        });
      } catch (err) {
        const error = err as Error;
        console.error("Erreur lors de l'initialisation de la session:", error.message);
        return NextResponse.json({ 
          error: `Erreur lors de l'initialisation de la session: ${error.message}`
        }, { status: 500 });
      }
    }
  } catch (err) {
    const error = err as Error;
    console.error('Erreur dans l\'API:', error.message);
    return NextResponse.json({ 
      error: `Erreur dans l'API: ${error.message}`
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const session_id = url.searchParams.get('session_id');
  
  if (!session_id) {
    return NextResponse.json({ error: 'Identifiant de session manquant' }, { status: 400 });
  }
  
  console.log(`Connexion SSE établie pour la session ${session_id}`);
  
  // Pour SSE, nous devons retourner un flux d'événements
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Envoyer un message initial pour établir la connexion
      controller.enqueue(encoder.encode(JSON.stringify({
        type: "connection",
        session_id: session_id,
        status: "connected"
      }) + "\n"));
      
      // Garder la connexion ouverte avec des ping toutes les 30 secondes
      const intervalId = setInterval(() => {
        controller.enqueue(encoder.encode(JSON.stringify({
          type: "ping",
          timestamp: Date.now()
        }) + "\n"));
      }, 30000);
      
      // Nettoyer l'intervalle si le stream est fermé
      return () => clearInterval(intervalId);
    }
  });
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// Fonction pour transcrire l'audio avec l'API Whisper
async function transcribeAudio(base64Audio: string, apiKey: string, format: string = 'webm'): Promise<string> {
  try {
    console.log(`Début de la transcription audio en format ${format}`);
    
    // Convertir la chaîne base64 en Buffer
    const binaryData = Buffer.from(base64Audio, 'base64');
    
    // Créer un FormData pour l'API Whisper
    const formData = new FormData();
    
    // Ajouter le buffer directement comme fichier avec un nom de fichier et extension
    // Cela permet à l'API de détecter correctement le type MIME
    formData.append('file', new Blob([binaryData]), `audio.mp3`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'fr');
    
    console.log(`Taille des données audio: ${Math.round(binaryData.length / 1024)} KB`);
    console.log(`Envoi à l'API Whisper...`);
    
    // Appeler l'API Whisper
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Whisper: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`Transcription réussie: "${result.text}"`);
    return result.text;
  } catch (error) {
    console.error('Erreur de transcription:', error);
    throw error;
  }
}

// Stockage en mémoire des sessions (pourrait être remplacé par une base de données)
const sessions = new Map<string, {
  id: string;
  messages: Array<{ role: string; content: string }>;
  created_at: string;
}>(); 