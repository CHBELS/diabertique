import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

// Initialiser le client OpenAI avec la clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pour compatibilité avec l'export statique de Capacitor
export const dynamic = "force-static";
export const revalidate = false;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'Fichier audio requis' }, { status: 400 });
    }

    // Créer un fichier temporaire à partir des données binaires
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Créer un dossier temporaire (assurez-vous qu'il existe)
    const tempDir = join(process.cwd(), 'tmp');
    
    // Créer le dossier s'il n'existe pas
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
    } catch (error) {
      console.error('Erreur lors de la création du dossier temporaire:', error);
      return NextResponse.json({ error: 'Impossible de créer le dossier temporaire' }, { status: 500 });
    }
    
    const filePath = join(tempDir, `audio_${Date.now()}.mp3`);
    
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('Erreur lors de l\'écriture du fichier temporaire:', error);
      return NextResponse.json({ error: 'Impossible de traiter le fichier audio' }, { status: 500 });
    }

    // Appeler l'API de transcription audio avec GPT-4o-audio
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      language: 'fr',
      response_format: 'text'
    });
    
    // Nettoyer le fichier temporaire
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier temporaire:', error);
    }

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error('Erreur lors de la transcription audio:', error);
    return NextResponse.json({ error: 'Erreur de transcription audio' }, { status: 500 });
  }
} 