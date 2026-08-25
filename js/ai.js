/* =========================================================
   IA ADVERSE (CPU)
   -----------------------------------------------------------
   cpuLevel (défini par arc dans data-arcs.js) 1 à 5 :
     1 -> quasi aléatoire (capture immédiate si évidente, sinon coup faible exprès)
     2 -> gourmand pur (maximise les captures immédiates)
     3-5 -> anticipe 1 à 2 coups du joueur (minimax) pour éviter de tendre
            une carte facile à reprendre
   ========================================================= */

function minimax(board, cpuHand, playerHand, depth, maximizingCpu){
  const emptyCells = getEmptyCells(board);
  const activeHand = maximizingCpu ? cpuHand : playerHand;

  if(depth <= 0 || emptyCells.length === 0 || activeHand.length === 0){
    return scoreBoard(board);
  }

  if(maximizingCpu){
    let best = -Infinity;
    emptyCells.forEach(cell => {
      cpuHand.forEach((card, ci) => {
        const { board: nb } = applyMove(board, cell, card, 'cpu');
        const remaining = cpuHand.filter((_, i) => i !== ci);
        const val = minimax(nb, remaining, playerHand, depth - 1, false);
        if(val > best) best = val;
      });
    });
    return best;
  }else{
    let worst = Infinity;
    emptyCells.forEach(cell => {
      playerHand.forEach((card, pi) => {
        const { board: nb } = applyMove(board, cell, card, 'player');
        const remaining = playerHand.filter((_, i) => i !== pi);
        const val = minimax(nb, cpuHand, remaining, depth - 1, true);
        if(val < worst) worst = val;
      });
    });
    return worst;
  }
}

/**
 * Choisit le coup du CPU. Renvoie { cellIndex, cardIndex } (cardIndex
 * fait référence à la position dans `cpuHand`).
 */
function aiChooseMove(board, cpuHand, playerHand, cpuLevel){
  const emptyCells = getEmptyCells(board);
  const candidates = [];

  emptyCells.forEach(cell => {
    cpuHand.forEach((card, cardIndex) => {
      const { board: nb, captured } = applyMove(board, cell, card, 'cpu');
      let lookahead = scoreBoard(nb);

      if(cpuLevel >= 3){
        const depth = cpuLevel >= 5 ? 3 : (cpuLevel >= 4 ? 2 : 1);
        const remainingCpuHand = cpuHand.filter((_, i) => i !== cardIndex);
        lookahead = minimax(nb, remainingCpuHand, playerHand, depth, false);
      }

      candidates.push({ cell, cardIndex, captured: captured.length, lookahead });
    });
  });

  candidates.sort((a, b) => b.lookahead - a.lookahead || b.captured - a.captured);

  if(cpuLevel <= 1){
    // Niveau facile : coup correct la moitié du temps, sinon un coup pris au hasard
    // parmi les moins bons choix, pour laisser des ouvertures au joueur.
    if(Math.random() < 0.5){
      const pool = candidates.slice(Math.floor(candidates.length/2));
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return candidates[0];
  }

  // Petite variance parmi les meilleurs coups à égalité, pour ne pas être 100% prévisible.
  const topScore = candidates[0].lookahead;
  const bestPool = candidates.filter(c => c.lookahead === topScore);
  return bestPool[Math.floor(Math.random() * bestPool.length)];
}
