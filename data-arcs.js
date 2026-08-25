/* =========================================================
   STORY MODE — sagas & arcs
   -----------------------------------------------------------
   Structure : SAGAS = [ { id, name, arcs: [ARC, ARC, ...] }, ... ]

   ARC = {
     id            : identifiant unique (utilisé pour la sauvegarde)
     name          : nom affiché
     enemyName     : nom du capitaine/boss adverse affiché sur la tuile
     status        : 'ready'  -> jouable, deck ci-dessous rempli
                      'todo'   -> arc prévu dans l'architecture mais
                                  pas encore rempli (deck vide) : affiché
                                  comme "Bientôt disponible" une fois débloqué
     cpuLevel      : 1 (facile) à 5 (difficile) -> profondeur de l'IA
     deck          : tableau de 5 ids de CARD_POOL pour l'adversaire
     stars         : difficulté affichée (1-5) sur la tuile
   }

   Pour ajouter le contenu d'un arc plus tard :
     1. Ajoute les personnages manquants dans data-cards.js
     2. Remplis "deck" avec 5 ids, passe "status" à 'ready'
   Rien d'autre à changer : le menu et le moteur de jeu lisent
   dynamiquement cette liste.
   ========================================================= */

const SAGAS = [
  {
    id: 'east-blue',
    name: 'East Blue',
    arcs: [
      { id:'romance-dawn', name:'Romance Dawn',   enemyName:'Alvida',        status:'ready', cpuLevel:1, stars:1,
        deck:['alvida','alvida','alvida','alvida','alvida'] }, // à varier plus tard avec des sbires
      { id:'orange-town',  name:'Orange Town',    enemyName:'Buggy le Clown',status:'ready', cpuLevel:1, stars:1,
        deck:['buggy','mohji','cabaji','mohji','cabaji'] },
      { id:'syrup-village',name:'Syrup Village',  enemyName:'Kuro',          status:'ready', cpuLevel:2, stars:2,
        deck:['kuro','django','sham','django','sham'] },
      { id:'baratie',      name:'Baratie',        enemyName:'Don Krieg',     status:'ready', cpuLevel:2, stars:2,
        deck:['krieg','krieg','django','sham','mohji'] },
      { id:'arlong-park',  name:'Arlong Park',    enemyName:'Arlong',        status:'ready', cpuLevel:3, stars:3,
        deck:['arlong','arlong','kuro','krieg','django'] },
      { id:'loguetown',    name:'Loguetown',      enemyName:"Capitaine Smoker", status:'todo', cpuLevel:3, stars:3, deck:[] },
    ]
  },
  {
    id: 'alabasta-saga',
    name: 'Alabasta',
    arcs: [
      { id:'reverse-mountain', name:'Reverse Mountain', enemyName:'???', status:'todo', cpuLevel:2, stars:2, deck:[] },
      { id:'whisky-peak',      name:'Whisky Peak',      enemyName:'Mr. 5',  status:'todo', cpuLevel:3, stars:3, deck:[] },
      { id:'little-garden',    name:'Little Garden',    enemyName:'Mr. 3',  status:'todo', cpuLevel:3, stars:3, deck:[] },
      { id:'drum-island',      name:'Drum Island',      enemyName:'Wapol',  status:'todo', cpuLevel:3, stars:3, deck:[] },
      { id:'alabasta',         name:'Alabasta',         enemyName:'Crocodile', status:'todo', cpuLevel:4, stars:4, deck:[] },
    ]
  },
  {
    id: 'sky-island-saga',
    name: 'Île du Ciel',
    arcs: [
      { id:'jaya',     name:'Jaya',     enemyName:'Bellamy', status:'todo', cpuLevel:3, stars:3, deck:[] },
      { id:'skypiea',  name:'Skypiea',  enemyName:'Ener',    status:'todo', cpuLevel:4, stars:4, deck:[] },
    ]
  },
  {
    id: 'water7-saga',
    name: 'Water 7',
    arcs: [
      { id:'long-ring-long-land', name:'Long Ring Long Land', enemyName:'Foxy',   status:'todo', cpuLevel:3, stars:3, deck:[] },
      { id:'water7',               name:'Water 7',             enemyName:'Rob Lucci', status:'todo', cpuLevel:4, stars:4, deck:[] },
      { id:'enies-lobby',          name:'Enies Lobby',         enemyName:'Rob Lucci', status:'todo', cpuLevel:4, stars:4, deck:[] },
    ]
  },
  {
    id: 'thriller-bark-saga',
    name: 'Thriller Bark',
    arcs: [
      { id:'thriller-bark', name:'Thriller Bark', enemyName:'Gecko Moria', status:'todo', cpuLevel:4, stars:4, deck:[] },
    ]
  },
  {
    id: 'summit-war-saga',
    name: 'Guerre au Sommet',
    arcs: [
      { id:'sabaody',      name:'Sabaody Archipelago', enemyName:'Amiral Kizaru', status:'todo', cpuLevel:4, stars:4, deck:[] },
      { id:'amazon-lily',  name:'Amazon Lily',         enemyName:'Hancock',       status:'todo', cpuLevel:3, stars:3, deck:[] },
      { id:'impel-down',   name:'Impel Down',          enemyName:'Magellan',      status:'todo', cpuLevel:4, stars:4, deck:[] },
      { id:'marineford',   name:'Marineford',          enemyName:'Barbe Blanche / Akainu', status:'todo', cpuLevel:5, stars:5, deck:[] },
    ]
  },
  {
    id: 'fishman-island-saga',
    name: "Île des Hommes-Poissons",
    arcs: [
      { id:'fishman-island', name:"Île des Hommes-Poissons", enemyName:'Hody Jones', status:'todo', cpuLevel:4, stars:4, deck:[] },
    ]
  },
  {
    id: 'dressrosa-saga',
    name: 'Dressrosa',
    arcs: [
      { id:'punk-hazard', name:'Punk Hazard', enemyName:'Caesar Clown', status:'todo', cpuLevel:4, stars:4, deck:[] },
      { id:'dressrosa',   name:'Dressrosa',   enemyName:'Doflamingo',   status:'todo', cpuLevel:5, stars:5, deck:[] },
    ]
  },
  {
    id: 'four-emperors-saga',
    name: 'Quatre Empereurs',
    arcs: [
      { id:'zou',              name:'Zou',                  enemyName:'Jack',        status:'todo', cpuLevel:4, stars:4, deck:[] },
      { id:'whole-cake-island',name:'Whole Cake Island',    enemyName:'Big Mom',     status:'todo', cpuLevel:5, stars:5, deck:[] },
      { id:'wano',             name:'Wano Country',         enemyName:'Kaido',       status:'todo', cpuLevel:5, stars:5, deck:[] },
    ]
  },
  {
    id: 'final-saga',
    name: 'Saga Finale',
    arcs: [
      { id:'egghead', name:'Egghead', enemyName:'Amiraux', status:'todo', cpuLevel:5, stars:5, deck:[] },
    ]
  },
];

/** Renvoie un arc par son id, ou null. */
function findArc(arcId){
  for(const saga of SAGAS){
    const arc = saga.arcs.find(a => a.id === arcId);
    if(arc) return arc;
  }
  return null;
}

/** Renvoie la liste ordonnée de tous les arcs (toutes sagas confondues). */
function getAllArcsFlat(){
  return SAGAS.flatMap(s => s.arcs);
}

/** Id de l'arc suivant celui donné, ou null si c'est le dernier. */
function getNextArcId(arcId){
  const flat = getAllArcsFlat();
  const idx = flat.findIndex(a => a.id === arcId);
  if(idx === -1 || idx === flat.length - 1) return null;
  return flat[idx + 1].id;
}
