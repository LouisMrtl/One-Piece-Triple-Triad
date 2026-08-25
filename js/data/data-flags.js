/* =========================================================
   DRAPEAUX (Jolly Rogers) sélectionnables à la création du profil
   -----------------------------------------------------------
   img : chemin attendu, ex "images/flags/skull-classic.png"
   Tant qu'aucune image n'est présente, l'emoji "fallback" est affiché.
   Ajoute/retire des entrées librement — le menu s'adapte automatiquement.
   ========================================================= */

const FLAGS = [
  { id:'skull-classic',   label:'Drapeau 1', img:'images/characters/band1.png', fallback:'☠️' },
  { id:'skull-hat',       label:'Drapeau 2', img:'images/characters/band2.png', fallback:'🏴‍☠️' },
  { id:'skull-crossbones',label:'Drapeau 3', img:'images/characters/band3.png', fallback:'💀' },
  { id:'skull-swords',    label:'Drapeau 4', img:'images/characters/band4.png', fallback:'⚔️' },
  { id:'skull-flower',    label:'Drapeau 5', img:'images/characters/band5.png', fallback:'🌸' },
  { id:'skull-star',      label:'Drapeau 6', img:'images/characters/band6.png', fallback:'⭐' },
];
