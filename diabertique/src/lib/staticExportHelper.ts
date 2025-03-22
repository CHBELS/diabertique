// Utilitaire pour aider à gérer les exportations statiques avec Next.js et Capacitor

/**
 * Solution pour l'erreur "Page is missing param in generateStaticParams()"
 * 
 * Cette erreur se produit car Next.js avec "output: export" nécessite que toutes
 * les routes dynamiques soient pré-générées lors du build. Quand vous avez des
 * données générées dynamiquement (comme les recettes ajoutées par l'utilisateur),
 * cela peut poser problème.
 * 
 * Options de solution:
 * 
 * 1. Statique (approche actuelle):
 *    - Dans chaque fichier de page dynamique (comme [id]/page.tsx), ajouter 
 *      explicitement tous les IDs dynamiques connus dans generateStaticParams()
 *    - À chaque fois qu'un nouvel ID cause une erreur, l'ajouter à la liste
 * 
 * 2. Client-side uniquement:
 *    - Modifier l'architecture pour que les routes dynamiques soient gérées 
 *      uniquement côté client avec React Router ou une autre solution
 *    - Les routes non statiques seraient gérées par des composants React 
 *      sans utiliser le système de routage de Next.js
 * 
 * 3. Fallback strategy:
 *    - Utiliser un composant d'erreur global qui attrape cette erreur
 *    - Rediriger vers une page statique qui charge dynamiquement le contenu
 * 
 * 4. Stocker les IDs d'intérêt:
 *    - Lors de la création de nouvelles recettes, stocker leurs IDs dans un
 *      fichier ou une base de données
 *    - Avant le build, extraire ces IDs et les injecter dans la configuration
 */

// Liste des IDs connus qui doivent être inclus dans les exports statiques
export const knownDynamicIds = {
  recipes: [
    'e0ad651c-3336-4d2c-aed8-0d2a142718c6',
    'f460e140-5879-416a-a7d7-30c5cb69de5a',
    '1d2772d2-3ab6-478d-89d9-01d45a2050ca',
    'aa2d90fc-aeac-4958-bb80-4916cee03178',
    // Ajouter ici les nouveaux IDs qui causent des erreurs
  ]
};

/**
 * Helper function pour ajouter un nouvel ID à la liste des IDs connus
 * Note: Cette fonction n'a d'effet qu'en développement, elle ne peut pas
 * modifier le code source directement.
 */
export const addKnownId = (type: keyof typeof knownDynamicIds, id: string) => {
  if (!knownDynamicIds[type].includes(id)) {
    console.log(`[DEV] Nouvel ID '${id}' pour '${type}' détecté. Ajoutez-le à knownDynamicIds dans staticExportHelper.ts.`);
    knownDynamicIds[type].push(id);
  }
}; 