/* =========================================================
   GAME — logique de game.html
   ========================================================= */

let state = null; // état de la partie en cours
let matchWon = false;
function getArcIdFromUrl(){
  return new URLSearchParams(window.location.search).get('arc');
}

function buildHand(ids, owner){
  return ids.map(id => ({ card: getCard(id), used: false, owner }));
}

function showEventPopup(imgPath, durationMs = 1100){
  const popup = document.getElementById('eventPopup');
  const img = document.getElementById('eventPopupImg');
  img.src = imgPath;
  popup.classList.remove('hidden');
  requestAnimationFrame(() => popup.classList.add('show'));
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.classList.add('hidden'), 300);
  }, durationMs);
}

function initMatch()
{
  const arcId = getArcIdFromUrl();
  const arc = findArc(arcId);
  if(!arc || arc.status !== 'ready')
  {
    alert("Cet arc n'est pas encore disponible.");
    window.location.href = 'menu.html';
    return;
  }

  const save = loadSave();
  const ownedIds = getOwnedCardIds(save.progress.completedArcs);
  const deckIds = (save.deck && save.deck.length ? save.deck : STARTER_DECK)
    .filter(id => ownedIds.includes(id));
  const playerDeckIds = (deckIds.length === 5 ? deckIds : STARTER_DECK);

  state = {
    arc,
    board: createEmptyBoard(),
    playerHand: buildHand(playerDeckIds, 'player'),
    cpuHand: buildHand(arc.deck, 'cpu'),
    turnCount: 0,      // 0-8, avance à chaque pose
    selectedHandIdx: null,
    isOver: false,
  };

  document.getElementById('arcTitle').textContent = `${arc.name} — vs ${arc.enemyName}`;
  document.getElementById('playerPanelName').textContent = save.profile.name || 'Toi';
  document.getElementById('cpuPanelName').textContent = arc.enemyName;
  document.getElementById('cpuAvatarInitials').textContent = initialsOf(arc.enemyName);

  const flag = (typeof FLAGS !== 'undefined') ? FLAGS.find(f => f.id === save.profile.flagId) : null;
  const avatarImg = document.getElementById('playerAvatarImg');
  if(flag){
    avatarImg.src = flag.img;
    attachImgFallback(avatarImg, flag.fallback);
  }

  renderAll();
  showEventPopup('images/characters/youronline.png');
}

/* ---------- Rendu ---------- */

function makeCardEl(card, { owner, faceDown=false } = {}){
  const el = document.createElement('div');
  el.className = 'card' + (owner === 'cpu' ? ' owner-cpu' : '');
  if(!faceDown){
    const bg = document.createElement('div');
    bg.className = 'card-art';
    const img = document.createElement('img');
    img.src = card.portrait;
    img.className = 'card-main-art';
    attachImgFallback(img, initialsOf(card.name));
    bg.appendChild(img);
    el.appendChild(bg);

    ['top','right','bottom','left'].forEach(dir => {
      const s = document.createElement('div');
      s.className = `stat ${dir}`;
      s.textContent = card[dir];
      el.appendChild(s);
    });

    const tag = document.createElement('div');
    tag.className = 'name-tag';
    tag.textContent = card.name;
    el.appendChild(tag);
  }
  return el;
}

function renderHands(){
  const playerEl = document.getElementById('playerHand');
  playerEl.innerHTML = '';
  state.playerHand.forEach((entry, idx) => {
    const el = makeCardEl(entry.card, { owner:'player' });
    if(entry.used) el.classList.add('used');
    if(state.selectedHandIdx === idx) el.classList.add('selected');
    el.addEventListener('click', () => onSelectHandCard(idx));
    playerEl.appendChild(el);
  });

  const cpuEl = document.getElementById('cpuHand');
  cpuEl.innerHTML = '';
  state.cpuHand.forEach(entry => {
    // Le CPU garde ses cartes cachées (dos de carte) pour le suspense.
    const el = document.createElement('div');
    el.className = 'card owner-cpu';
    el.classList.add('card-back');
    el.style.backgroundImage = 'url("images/characters/demo.png")';
    el.style.backgroundPosition = 'center';
    el.style.backgroundSize = 'cover';
    el.textContent = '?';
    if(entry.used) el.classList.add('used');
    cpuEl.appendChild(el);
  });
}

function renderBoard(){
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  state.board.forEach((cell, idx) => {
    const cellEl = document.createElement('div');
    cellEl.className = 'cell';
    if(!cell && isPlayerTurn() && state.selectedHandIdx !== null){
      cellEl.classList.add('droppable');
      cellEl.addEventListener('click', () => onPlaceOnCell(idx));
    }
    if(cell){
      const cardEl = makeCardEl(cell.card, { owner: cell.owner });
      if(cell.justFlipped) cardEl.classList.add('flipping');
      cellEl.appendChild(cardEl);
    }
    boardEl.appendChild(cellEl);
  });
}

function renderScore(){
  const { player, cpu } = countOwners(state.board);
  document.getElementById('scoreYou').textContent = `Toi : ${player}`;
  document.getElementById('scoreCpu').textContent = `${cpu} : Adversaire`;
}

function renderTurnBanner(){
  const banner = document.getElementById('turnBanner');
  banner.src = isPlayerTurn()
    ? 'images/characters/youronline.png'
    : 'images/characters/oponentonline.png';
  banner.alt = isPlayerTurn() ? 'À toi de jouer' : `${state.arc.enemyName} réfléchit...`;
}

function renderAll(){
  renderHands();
  renderBoard();
  renderScore();
  renderTurnBanner();
}

/* ---------- Logique de tour ---------- */

function isPlayerTurn(){
  // Le joueur commence : tours pairs (0,2,4,6,8) = joueur, impairs = CPU.
  return state.turnCount % 2 === 0;
}

function onSelectHandCard(idx){
  if(state.isOver || !isPlayerTurn()) return;
  if(state.playerHand[idx].used) return;
  state.selectedHandIdx = (state.selectedHandIdx === idx) ? null : idx;
  renderAll();
}

function onPlaceOnCell(cellIndex){
  if(state.isOver || !isPlayerTurn() || state.selectedHandIdx === null) return;
  if(state.board[cellIndex]) return;

  const entry = state.playerHand[state.selectedHandIdx];
  const { board: newBoard, captured } = applyMove(state.board, cellIndex, entry.card, 'player');
  state.board = newBoard;
  entry.used = true;
  state.selectedHandIdx = null;
  state.turnCount++;

  flagJustFlipped(captured);
  renderAll();
  checkEndOrContinue();
}

function flagJustFlipped(indices){
  indices.forEach(i => { if(state.board[i]) state.board[i].justFlipped = true; });
  setTimeout(() => {
    indices.forEach(i => { if(state.board[i]) state.board[i].justFlipped = false; });
  }, 550);
}

function checkEndOrContinue(){
  const empty = getEmptyCells(state.board);
  if(empty.length === 0){
    endMatch();
    return;
  }
  if(!isPlayerTurn()){
    document.getElementById('turnBanner').src = 'images/characters/waitingonline.png';
    document.getElementById('turnBanner').alt = 'En attente...';
    setTimeout(playCpuTurn, 700);
  }
}

function playCpuTurn(){
  if(state.isOver) return;
  const unusedEntries = state.cpuHand.filter(e => !e.used);
  const cpuHandCards = unusedEntries.map(e => e.card);
  const playerHandCards = state.playerHand.filter(e => !e.used).map(e => e.card);
  if(cpuHandCards.length === 0){ checkEndOrContinue(); return; }

  const move = aiChooseMove(state.board, cpuHandCards, playerHandCards, state.arc.cpuLevel);
  const chosenEntry = unusedEntries[move.cardIndex];
  chosenEntry.used = true;

  const { board: newBoard, captured } = applyMove(state.board, move.cell, chosenEntry.card, 'cpu');
  state.board = newBoard;

  state.turnCount++;
  flagJustFlipped(captured);
  renderAll();
  checkEndOrContinue();
}

function endMatch(){
  state.isOver = true;
  const { player, cpu } = countOwners(state.board);
  const overlay = document.getElementById('resultOverlay');
  const banner = document.getElementById('resultBanner');
  const title = document.getElementById('resultTitle');
  const detail = document.getElementById('resultDetail');

  if(player > cpu){
    matchWon = true;
    banner.src = 'images/ui/battlewin.png';
    banner.style.display = '';
    title.textContent = '🏆 Victoire !';
    detail.textContent = `Tu as capturé ${player} cases contre ${cpu}. ${state.arc.enemyName} est vaincu.`;
    markArcCompleted(state.arc.id);
    document.getElementById('continueBtn').textContent = 'Choisir une récompense';
  }else if(player < cpu){
    matchWon = false;
    banner.src = 'images/ui/battlelost.png';
    banner.style.display = '';
    title.textContent = '💀 Défaite';
    detail.textContent = `${state.arc.enemyName} l'emporte ${cpu} à ${player}. Retente ta chance !`;
    document.getElementById('continueBtn').textContent = 'Retour au menu';
  }else{
    matchWon = false;
    banner.style.display = 'none'; // pas d'asset "égalité" fourni
    title.textContent = '⚖️ Égalité';
    detail.textContent = `Match nul, ${player} à ${cpu}.`;
    document.getElementById('continueBtn').textContent = 'Retour au menu';
  }
  overlay.classList.remove('hidden');
}

function showRewardChoice(){
  const rewardOverlay = document.getElementById('rewardOverlay');
  const rewardCards = document.getElementById('rewardCards');
  const continueButton = document.getElementById('rewardContinueBtn');
  rewardCards.innerHTML = '';
  continueButton.classList.add('hidden');

  state.arc.deck.forEach(cardId => {
    const card = getCard(cardId);
    const rewardCard = document.createElement('button');
    rewardCard.type = 'button';
    rewardCard.className = 'reward-card card-back';
    rewardCard.style.backgroundImage = 'url("images/characters/demo.png")';
    rewardCard.textContent = '?';
    rewardCard.addEventListener('click', () => {
      if(rewardCard.classList.contains('revealed')) return;
      const revealed = makeCardEl(card, { owner:'player' });
      revealed.classList.add('reward-card', 'revealed');
      rewardCard.replaceWith(revealed);
      addCardToCollection(card.id);
      rewardCards.querySelectorAll('.reward-card').forEach(el => {
        el.classList.add('reward-disabled');
      });
      continueButton.classList.remove('hidden');
    });
    rewardCards.appendChild(rewardCard);
  });
  rewardOverlay.classList.remove('hidden');
}

/* ---------- Init ---------- */

document.getElementById('quitBtn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});
document.getElementById('replayBtn').addEventListener('click', () => {
  document.getElementById('resultOverlay').classList.add('hidden');
  initMatch();
});
document.getElementById('continueBtn').addEventListener('click', () => {
  if(matchWon){
    document.getElementById('resultOverlay').classList.add('hidden');
    showRewardChoice();
  }else{
    window.location.href = 'menu.html';
  }
});
document.getElementById('rewardContinueBtn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

document.addEventListener('DOMContentLoaded', initMatch);
