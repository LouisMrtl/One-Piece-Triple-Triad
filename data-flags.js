/* =========================================================
   DRAPEAUX (Jolly Rogers) sélectionnables à la création du profil
   -----------------------------------------------------------
   img : chemin attendu, ex "images/flags/skull-classic.png"
   Tant qu'aucune image n'est présente, l'emoji "fallback" est affiché.
   Ajoute/retire des entrées librement — le menu s'adapte automatiquement.
   ========================================================= */

const FLAGS = [
  { id:'skull-classic',   label:'Crâne classique',   img:'images/flags/skull-classic.png',   fallback:'☠️' },
  { id:'skull-hat',       label:'Crâne au chapeau',  img:'images/flags/skull-hat.png',        fallback:'🏴‍☠️' },
  { id:'skull-crossbones',label:'Tibias croisés',    img:'images/flags/skull-crossbones.png', fallback:'💀' },
  { id:'skull-swords',    label:'Sabres croisés',    img:'images/flags/skull-swords.png',     fallback:'⚔️' },
  { id:'skull-flower',    label:'Fleuri',            img:'images/flags/skull-flower.png',     fallback:'🌸' },
  { id:'skull-star',      label:'Étoilé',            img:'images/flags/skull-star.png',       fallback:'⭐' },
];
