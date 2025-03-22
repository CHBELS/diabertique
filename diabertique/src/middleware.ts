import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Créer la réponse
  const response = NextResponse.next();
  
  // Ajouter les headers CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-OpenAI-API-Key');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 