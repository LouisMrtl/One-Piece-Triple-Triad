/* =========================================================
   ÉQUIPAGE DU JOUEUR
   ========================================================= */

// Les 5 cartes possédées dès le début de partie.
const STARTER_DECK = ['pirate1', 'pirate1', 'pirate2', 'pirate2', 'pirate3'];

// Nouveaux membres qui rejoignent la collection du joueur une fois
// l'arc correspondant terminé (clé = id de l'arc dans data-arcs.js).
// Le joueur peut alors les inclure dans son deck de 5 cartes via le menu.
const CREW_UNLOCKS = {
  'baratie':        'sanji',    // déjà dans le starter, exemple si tu changes le starter plus tard
  'drum-island':    'chopper',
  'alabasta':       'robin',
  'water7':         'franky',
  'thriller-bark':  'brook',
  'fishman-island': 'jinbe',
};

/**
 * Renvoie la liste des ids de cartes actuellement possédées par le joueur,
 * en fonction des arcs déjà complétés (stockés dans le profil localStorage).
 */
function getOwnedCardIds(completedArcIds){
  const save = (typeof loadSave === 'function') ? loadSave() : null;
  return [...new Set(save?.collection || STARTER_DECK)];
}
