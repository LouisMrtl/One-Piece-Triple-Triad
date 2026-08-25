/* =========================================================
   MOTEUR DE JEU — règles du Triple Triad
   -----------------------------------------------------------
   Plateau : tableau de 9 cases (index 0-8, grille 3x3 en ligne
   par ligne). Une case vide vaut null, sinon { card, owner }
   avec owner = 'player' | 'cpu'.
   ========================================================= */

function createEmptyBoard(){
  return Array(9).fill(null);
}

function cloneBoard(board){
  return board.map(c => c ? { card: { ...c.card }, owner: c.owner } : null);
}

function getEmptyCells(board){
  return board.reduce((acc, c, i) => { if(!c) acc.push(i); return acc; }, []);
}

/**
 * Calcule les indices des cartes adverses capturées si `card` est posée
 * en `index` par `owner`. Ne modifie rien, lecture seule.
 */
function getCapturedIndices(board, index, card, owner){
  const captured = [];
  const row = Math.floor(index / 3);
  const col = index % 3;

  if(row > 0){
    const n = board[index - 3];
    if(n && n.owner !== owner && card.top > n.card.bottom) captured.push(index - 3);
  }
  if(row < 2){
    const n = board[index + 3];
    if(n && n.owner !== owner && card.bottom > n.card.top) captured.push(index + 3);
  }
  if(col > 0){
    const n = board[index - 1];
    if(n && n.owner !== owner && card.left > n.card.right) captured.push(index - 1);
  }
  if(col < 2){
    const n = board[index + 1];
    if(n && n.owner !== owner && card.right > n.card.left) captured.push(index + 1);
  }
  return captured;
}

/**
 * Pose `card` en `index` pour `owner`, applique les captures.
 * Renvoie { board: nouveauPlateau, captured: [indices retournés] }.
 * N'effectue aucune mutation du plateau reçu en argument.
 */
function applyMove(board, index, card, owner){
  const newBoard = cloneBoard(board);
  newBoard[index] = { card, owner };
  const captured = getCapturedIndices(newBoard, index, card, owner);
  captured.forEach(i => { newBoard[i].owner = owner; });
  return { board: newBoard, captured };
}

/** Différence de score (cases CPU - cases joueur), utilisée par l'IA. */
function scoreBoard(board){
  let score = 0;
  board.forEach(c => {
    if(!c) return;
    score += c.owner === 'cpu' ? 1 : -1;
  });
  return score;
}

/** Compte les cases par propriétaire, pour l'affichage du score en direct. */
function countOwners(board){
  let player = 0, cpu = 0;
  board.forEach(c => { if(c){ if(c.owner==='player') player++; else cpu++; } });
  return { player, cpu };
}
