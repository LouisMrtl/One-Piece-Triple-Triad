/* =========================================================
   STORAGE — persistance locale (pas de backend)
   ========================================================= */

const STORAGE_KEY = 'opt3_save_v1';

function defaultSave(){
  return {
    profile: { name: '', flagId: '' },
    progress: { completedArcs: [] },
    collection: [],
    deck: [...STARTER_DECK],
    crewOrder: [...STARTER_DECK],   // ordre complet de la frise (débloqués + bench)
  };
}

function loadSave(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    // fusion défensive au cas où de nouveaux champs apparaissent plus tard
    return { ...defaultSave(), ...parsed,
      profile: { ...defaultSave().profile, ...(parsed.profile||{}) },
      progress: { ...defaultSave().progress, ...(parsed.progress||{}) },
      collection: Array.isArray(parsed.collection) ? parsed.collection : [],
    };
  }catch(e){
    console.warn('Sauvegarde corrompue, réinitialisation.', e);
    return defaultSave();
  }
}

function writeSave(save){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function hasProfile(){
  const s = loadSave();
  return !!(s.profile.name && s.profile.flagId);
}

function saveProfile(name, flagId){
  const s = loadSave();
  s.profile.name = name;
  s.profile.flagId = flagId;
  writeSave(s);
}

function markArcCompleted(arcId){
  const s = loadSave();
  if(!s.progress.completedArcs.includes(arcId)){
    s.progress.completedArcs.push(arcId);
    writeSave(s);
  }
}

function isArcCompleted(arcId){
  return loadSave().progress.completedArcs.includes(arcId);
}

function saveDeck(cardIds){
  const s = loadSave();
  s.deck = cardIds.slice(0, 5);
  writeSave(s);
}

/**
 * Renvoie l'ordre d'affichage de la frise : les ids sauvegardés en
 * premier (filtrés aux cartes réellement possédées), puis toute carte
 * fraîchement débloquée qui n'était pas encore dans l'ordre sauvegardé
 * (ajoutée en fin de liste).
 */
function getCrewOrder(save){
  const ownedIds = getOwnedCardIds(save.progress.completedArcs);
  const saved = (save.crewOrder && save.crewOrder.length) ? save.crewOrder : [];
  const ordered = saved.filter(id => ownedIds.includes(id));
  ownedIds.forEach(id => { if(!ordered.includes(id)) ordered.push(id); });
  return ordered;
}

/**
 * Sauvegarde le nouvel ordre après un drag & drop. Les 5 premiers ids
 * deviennent automatiquement le deck actif de combat.
 */
function saveCrewOrder(orderedIds){
  const s = loadSave();
  s.crewOrder = orderedIds;
  s.deck = orderedIds.slice(0, 5);
  writeSave(s);
}

function addCardToCollection(cardId){
  const s = loadSave();
  if(!s.collection.includes(cardId)) s.collection.push(cardId);
  writeSave(s);
}