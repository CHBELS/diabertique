import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Gérer les requêtes OPTIONS pour CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-OpenAI-API-Key, X-Requested-With',
        'Access-Control-Max-Age': '86400', // 24 heures
      },
    });
  }

  // Pour les autres requêtes
  const response = NextResponse.next();
  
  // Ajouter les headers CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-OpenAI-API-Key, X-Requested-With');
  
  // Ajouter les headers pour éviter la mise en cache
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 