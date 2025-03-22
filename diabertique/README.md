# Diabertique - Assistant pour diabétiques

Une application d'assistance pour les personnes diabétiques, utilisant l'intelligence artificielle pour analyser le contenu en glucides des aliments et offrir des conseils personnalisés.

## Fonctionnalités

- **Analyse de photos d'aliments** : Utilisez votre appareil photo pour photographier un repas et obtenez instantanément son contenu en glucides.
- **Base de données de recettes** : Explorez une bibliothèque de recettes avec leur contenu en glucides détaillé.
- **Assistant conversationnel** : Discutez avec un assistant spécialisé en diabète par texte ou par commande vocale.
- **Suivi des enregistrements** : Gardez une trace de vos repas et de votre consommation de glucides.

## Technologies utilisées

- Next.js 14 (React)
- TypeScript
- TailwindCSS
- OpenAI APIs (GPT-4 Vision, GPT-4 Turbo, Whisper)

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/votre-nom/diabertique.git
   cd diabertique
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement :
   - Créez un fichier `.env.local` à la racine du projet
   - Ajoutez votre clé API OpenAI :
   ```
   OPENAI_API_KEY=votre_cle_api_openai
   ```

4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

5. Ouvrez votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000)

## Configuration pour la production

Pour déployer l'application en production :

```bash
npm run build
npm start
```

## Utilisation

### Analyse de photo
1. Accédez à la page "Analyse Photo"
2. Prenez une photo de votre aliment ou téléchargez une image existante
3. L'IA analysera automatiquement l'image et détectera le contenu en glucides
4. Vous pouvez enregistrer l'analyse dans votre historique

### Assistant vocal
1. Accédez à la page "Assistance"
2. Appuyez sur le bouton du microphone pour commencer à parler
3. Posez votre question sur le diabète
4. L'assistant transcrira votre question et y répondra

### Recettes
1. Parcourez les recettes par catégorie
2. Utilisez la barre de recherche pour trouver des recettes spécifiques
3. Consultez les détails de chaque recette avec son contenu en glucides

## Remarque importante

Cette application est conçue comme un outil d'assistance et ne remplace pas l'avis d'un professionnel de santé. Consultez toujours votre médecin pour des questions médicales liées à votre diabète.
