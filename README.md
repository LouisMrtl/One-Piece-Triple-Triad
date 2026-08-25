# One Piece Triple Triad (fan-project web)

Recréation navigateur, façon Triple Triad, de l'esprit de l'appli
Android GupyDroid disparue — mode histoire arc par arc, en HTML/CSS/JS
pur (pas de build, pas de backend, sauvegarde locale).

⚠️ Projet de fan non officiel : aucune image officielle One Piece n'est
incluse. Ajoute tes propres visuels dans `images/` (voir `images/README.md`).

## Lancer le projet

Aucune installation nécessaire. Deux options :

- **Le plus simple** : ouvre `index.html` directement dans un navigateur.
- **Recommandé** (évite certains soucis de chemins relatifs) : sers le
  dossier avec un petit serveur local, par ex. :
  ```bash
  cd onepiece-triad
  python3 -m http.server 8000
  # puis ouvre http://localhost:8000
  ```

## Parcours utilisateur

1. `index.html` — création de profil (nom + Jolly Roger). Sauvegardé en
   `localStorage`, donc pas de retour à cet écran tant que le profil existe.
2. `menu.html` — équipage animé (frames en boucle), choix du mode de jeu,
   puis sélection d'un arc dans le mode Histoire.
3. `game.html?arc=<id-arc>` — le combat : plateau 3x3, ta main de 5
   cartes, l'IA joue l'adversaire.

## Architecture

```
index.html          page de création de profil
menu.html            menu principal + sélection d'arc
game.html             écran de combat
css/style.css         tout le style (thème "avis de recherche")
js/
  storage.js          lecture/écriture localStorage (profil, progression, deck)
  ui-helpers.js        placeholders d'image (initiales/emoji) si pas d'image fournie
  engine.js             règles du jeu : plateau, pose, calcul des captures
  ai.js                  IA du CPU (glouton -> minimax selon le niveau de l'arc)
  profile.js             logique de index.html
  menu.js                 logique de menu.html
  game.js                  logique de game.html
  data/
    data-cards.js          LE pool de toutes les cartes (stats + image)
    data-crew.js             deck de départ du joueur + déblocages de perso
    data-flags.js             drapeaux sélectionnables
    data-arcs.js               sagas + arcs (adversaires, difficulté IA, etc.)
images/
  characters/<id>/1.png..    frames par personnage (voir images/README.md)
  flags/<id>.png              Jolly Rogers
```

## Règles implémentées

- Plateau 3x3, chaque carte a 4 valeurs (haut/droite/bas/gauche, 1-9).
- Le joueur commence. On alterne : joueur, CPU, joueur, CPU...
  → le joueur pose 5 cartes, le CPU en pose 4 (le plateau a 9 cases).
- Poser une carte à côté d'une carte adverse : si la valeur du bord qui
  se fait face est strictement supérieure côté attaquant, la carte
  adverse est capturée (elle change de couleur/propriétaire).
- Fin de partie quand le plateau est plein : le camp avec le plus de
  cases à sa couleur gagne. Victoire dans un arc "ready" → arc suivant
  débloqué, et si l'arc débloque un membre d'équipage (`CREW_UNLOCKS`
  dans `data-crew.js`), il devient sélectionnable.

Pas encore implémenté (facile à ajouter dans `engine.js` si tu veux
la variante "règles avancées" du Triple Triad original) : règle "Same",
règle "Plus", combos en chaîne, éléments de terrain.

## Étendre le contenu (ajouter un arc, un perso, etc.)

Tout le monde de One Piece (East Blue → Egghead) est déjà structuré en
sagas/arcs dans `js/data/data-arcs.js` : chaque arc a un `status` :
- `'ready'` : jouable, `deck` rempli avec 5 ids de personnages.
- `'todo'` : arc prévu, visible dans le menu une fois débloqué
  ("bientôt disponible"), mais pas encore de deck.

Pour rendre un arc jouable :
1. Ajoute les personnages manquants dans `data-cards.js` (stats + dossier
   d'image).
2. Remplis son `deck` (5 ids) et passe `status: 'ready'`.
3. Ajuste `cpuLevel` (1 à 5) pour la difficulté de l'IA.

Rien d'autre à modifier : le menu et le moteur de jeu lisent cette
liste dynamiquement.

## Idées pour la suite

- Mode Duel libre (choisir son deck + un adversaire hors histoire).
- Règles avancées Triple Triad (Same/Plus/Combo).
- Écran de sélection de deck dans le menu (actuellement le deck actif
  est celui sauvegardé par défaut, modifiable via `saveDeck()` dans
  `storage.js` — reste à câbler une UI dessus).
- Multijoueur (mentionné en griffé dans le menu, pas encore actif).
