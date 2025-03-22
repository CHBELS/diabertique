import React from 'react';
import Link from 'next/link';
import { HomeIcon, CameraIcon, BookOpenIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="bg-black text-white border-b border-zinc-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
              Couve Diabet App
            </span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-300 transition">
              Accueil
            </Link>
            <Link href="/analyse-photo" className="hover:text-blue-300 transition">
              Analyse Photo
            </Link>
            <Link href="/recettes" className="hover:text-blue-300 transition">
              Recettes
            </Link>
            <Link href="/chat-diabete" className="hover:text-blue-300 transition">
              Assistance
            </Link>
            <Link href="/mes-enregistrements" className="hover:text-blue-300 transition">
              Mes Enregistrements
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Menu mobile en bas de l'écran */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 md:hidden z-10">
        <div className="flex justify-around items-center py-2">
          <Link href="/" className="flex flex-col items-center px-2 py-1">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Accueil</span>
          </Link>
          <Link href="/analyse-photo" className="flex flex-col items-center px-2 py-1">
            <CameraIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Photo</span>
          </Link>
          <Link href="/recettes" className="flex flex-col items-center px-2 py-1">
            <BookOpenIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Recettes</span>
          </Link>
          <Link href="/chat-diabete" className="flex flex-col items-center px-2 py-1">
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link href="/mes-enregistrements" className="flex flex-col items-center px-2 py-1">
            <ClipboardDocumentListIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Données</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 