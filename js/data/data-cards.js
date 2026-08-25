/* =========================================================
   CARD_POOL — la base de toutes les cartes du jeu.
   -----------------------------------------------------------
   Chaque carte :
   {
     id, name, top, right, bottom, left,
     portrait : image fixe utilisée sur la carte pendant les combats
                ex "images/characters/luffy/portrait.webp"
     sheet    : bande d'images (sprite sheet) utilisée pour l'animation
                en boucle du menu — toutes les frames côte à côte dans
                UN SEUL fichier horizontal, largeur = frames × hauteur
                ex "images/characters/luffy/anim.webp"
     frames   : nombre de frames dans le sheet (1 si pas d'animation :
                dans ce cas `sheet` peut pointer vers la même image
                que `portrait`, ou être omis)
   }

   Pourquoi un sprite sheet plutôt que plusieurs fichiers (1.png,2.png..) ?
   -> 1 seule requête HTTP par personnage au lieu de N, chargement plus
      rapide dès qu'on a beaucoup de persos. L'animation se fait en CSS/JS
      en déplaçant background-position, pas en changeant de fichier.

   Tant que les fichiers ne sont pas fournis, un placeholder (initiales)
   s'affiche automatiquement — le jeu reste jouable sans aucune image.
   ========================================================= */

const CARD_POOL = {
  roger:   { id:'roger',   name:'Gol D. Roger',       top:12, right:12, bottom:12, left:12 },
  pirate1: { id:'pirate1', name:'Recrue pirate',      top:0, right:0, bottom:1, left:1 },
  pirate2: { id:'pirate2', name:'Matelot pirate',      top:0, right:0, bottom:1, left:1 },
  pirate3: { id:'pirate3', name:'Jeune pirate',        top:0, right:1, bottom:1, left:1 },
  soldier: { id:'soldier', name:'Recrue',             top:1, right:1, bottom:0, left:0 },
  soldierph:{ id:'soldierph', name:'Soldat de la Marine', top:1, right:0, bottom:1, left:0 },
  luffy:   { id:'luffy',   name:'Monkey D. Luffy',   top:6, right:4, bottom:3, left:7 },
  zoro:    { id:'zoro',    name:'Roronoa Zoro',      top:7, right:5, bottom:4, left:2 },
  nami:    { id:'nami',    name:'Nami',              top:3, right:6, bottom:5, left:4 },
  usopp:   { id:'usopp',   name:'Usopp',             top:5, right:3, bottom:2, left:6 },
  sanji:   { id:'sanji',   name:'Sanji',             top:5, right:6, bottom:4, left:3 },
  chopper: { id:'chopper', name:'Tony Tony Chopper', top:4, right:4, bottom:6, left:3 },
  robin:   { id:'robin',   name:'Nico Robin',        top:5, right:5, bottom:5, left:5 },
  franky:  { id:'franky',  name:'Franky',            top:6, right:6, bottom:3, left:4 },
  brook:   { id:'brook',   name:'Brook',             top:5, right:4, bottom:3, left:6 },
  jinbe:   { id:'jinbe',   name:'Jinbe',             top:6, right:5, bottom:6, left:3 },
  coby:    { id:'coby',    name:'Coby',              top:2, right:3, bottom:2, left:3 },
  alvida:  { id:'alvida',  name:'Alvida',            top:3, right:5, bottom:2, left:4 },
  buggy:   { id:'buggy',   name:'Buggy le Clown',    top:4, right:6, bottom:3, left:5 },
  mohji:   { id:'mohji',   name:'Mohji',             top:3, right:3, bottom:3, left:4 },
  cabaji:  { id:'cabaji',  name:'Cabaji',            top:4, right:4, bottom:3, left:3 },
  kuro:    { id:'kuro',    name:'Kuro',              top:6, right:3, bottom:4, left:5 },
  django:  { id:'django',  name:'Django',            top:3, right:4, bottom:3, left:4 },
  sham:    { id:'sham',    name:'Sham',              top:3, right:3, bottom:4, left:3 },
  krieg:   { id:'krieg',   name:'Don Krieg',         top:6, right:5, bottom:4, left:5 },
  arlong:  { id:'arlong',  name:'Arlong',            top:7, right:5, bottom:5, left:4 },
};

function displayCardValue(value){
  return value >= 12 ? 'C' : value === 11 ? 'B' : value === 10 ? 'A' : value;
}

/** Chemins d'images dérivés automatiquement de l'id (convention fixe). */
function cardImagePaths(id){
  const frames = [1, 2, 3].map(n => `images/characters/${id}/${n}.png`);
  return {
    portrait: `images/characters/${id}/${id}.png`, // carte principale fixe
    frames,              // les frames pour l'animation de la frise d'équipage
  };
}

/**
 * Retourne une carte du pool par id, enrichie des chemins d'images
 * (copie superficielle pour éviter les mutations pendant une partie).
 */
function getCard(id){
  const base = CARD_POOL[id];
  if(!base) throw new Error(`Carte inconnue: ${id}`);
  return { ...base, ...cardImagePaths(id) };
}
