/* =========================================================
   GAME — logique de game.html
   ========================================================= */

let state = null; // état de la partie en cours
let matchWon = false;
function getArcIdFromUrl(){
  return new URLSearchParams(window.location.search).get('arc');
}

function isRandomBattle(){
  return new URLSearchParams(window.location.search).get('mode') === 'random';
}

function randomEnemyDeck(){
  const excluded = new Set(['roger', 'roger2', 'barbablanca', 'barbanegra']);
  return Object.keys(CARD_POOL)
    .filter(id => !excluded.has(id))
    .sort(() => Math.random() - .5)
    .slice(0, 5);
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
  state = null;
  matchWon = false;
  const startingPlayer = Math.random() < 0.5 ? 'player' : 'ai';
  console.log("Premier joueur :", startingPlayer);
  const save = loadSave();
  const randomBattle = isRandomBattle();
  const arc = randomBattle ? {
    id:'random-battle', name:'Random Battle', enemyName:'Adversaire surprise',
    status:'ready', cpuLevel:2, deck:randomEnemyDeck(), bounty:0,
  } : findArc(getArcIdFromUrl());
  if(!arc || (arc.status !== 'ready' && !save.debugAll))
  {
    alert("Cet arc n'est pas encore disponible.");
    window.location.href = 'menu.html';
    return;
  }

  const ownedIds = getOwnedCardIds(save.progress.completedArcs);
  const deckIds = (save.deck && save.deck.length ? save.deck : STARTER_DECK)
    .filter(id => ownedIds.includes(id));
  const playerDeckIds = (deckIds.length === 5 ? deckIds : STARTER_DECK);

  state = {
    arc,
    board: createEmptyBoard(),
    playerHand: buildHand(playerDeckIds, 'player'),
    cpuHand: buildHand(arc.deck, 'cpu'),
    turnCount: 0,
    placedCardsCount: 0,
    selectedHandIdx: null,
    startingPlayer,
    playerCaptures: 0,
    cpuCaptures: 0,
    isOver: false,
  };

  document.getElementById('arcTitle').textContent = `${arc.name} — vs ${arc.enemyName}`;
  document.getElementById('playerPanelName').textContent = save.profile.name || 'Toi';
  document.getElementById('cpuPanelName').textContent = arc.enemyName;
  const cpuAvatarImg = document.getElementById('cpuAvatarImg');
  const captainId = arc.deck[0];
  if(captainId){
    const captainImageId = getCardImageId(captainId);
    cpuAvatarImg.src = `images/characters/${captainImageId}/${captainImageId}.png`;
    cpuAvatarImg.addEventListener('error', () => { cpuAvatarImg.style.display = 'none'; }, { once:true });
  }

  const flag = (typeof FLAGS !== 'undefined') ? FLAGS.find(f => f.id === save.profile.flagId) : null;
  const avatarImg = document.getElementById('playerAvatarImg');
  if(flag){
    avatarImg.src = flag.img;
    attachImgFallback(avatarImg, flag.fallback);
  }

  renderAll();
  showEventPopup('images/characters/youronline.png');
  if(!isPlayerTurn()) setTimeout(playCpuTurn, 1000);
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
      s.textContent = displayCardValue(card[dir]);
      el.appendChild(s);
    });

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
  const playerStarts = state.startingPlayer === 'player';
  return playerStarts ? state.turnCount % 2 === 0 : state.turnCount % 2 === 1;
}

function onSelectHandCard(idx){
  if(state.isOver) return;
  if(state.playerHand[idx].used) return;
  state.selectedHandIdx = (state.selectedHandIdx === idx) ? null : idx;
  renderAll();
}

function onPlaceOnCell(cellIndex){
  if(state.isOver || state.placedCardsCount >= 9 || !isPlayerTurn() || state.selectedHandIdx === null) return;
  if(state.board[cellIndex]) return;

  const entry = state.playerHand[state.selectedHandIdx];
  const { board: newBoard, captured } = applyMove(state.board, cellIndex, entry.card, 'player');
  state.board = newBoard;
  entry.used = true;
  state.selectedHandIdx = null;
  state.turnCount++;
  state.placedCardsCount++;
  state.playerCaptures += captured.length;

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
  if(state.isOver) return;
  const empty = getEmptyCells(state.board);
  if(state.placedCardsCount >= 9 || empty.length === 0){
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
  if(state.isOver || state.placedCardsCount >= 9 || getEmptyCells(state.board).length === 0) {
    if(!state.isOver) endMatch();
    return;
  }
  const unusedEntries = state.cpuHand.filter(e => !e.used);
  const cpuHandCards = unusedEntries.map(e => e.card);
  const playerHandCards = state.playerHand.filter(e => !e.used).map(e => e.card);
  if(cpuHandCards.length === 0){
    checkEndOrContinue();
    return;
  }

  const move = aiChooseMove(state.board, cpuHandCards, playerHandCards, state.arc.cpuLevel);
  const chosenEntry = unusedEntries[move.cardIndex];
  chosenEntry.used = true;

  const { board: newBoard, captured } = applyMove(state.board, move.cell, chosenEntry.card, 'cpu');
  state.board = newBoard;

  state.turnCount++;
  state.placedCardsCount++;
  state.cpuCaptures += captured.length;
  flagJustFlipped(captured);
  renderAll();
  checkEndOrContinue();
}

function endMatch(){
  if(state.isOver) return;
  state.isOver = true;
  const { player, cpu } = countOwners(state.board);
  const overlay = document.getElementById('resultOverlay');
  const banner = document.getElementById('resultBanner');

  const startedByPlayer = state.startingPlayer === 'player';
  const isAdvantageDraw = startedByPlayer && player === 5 && cpu === 4;
  if(player > cpu && !isAdvantageDraw){
    matchWon = true;
    banner.src = 'images/characters/win.png';
    banner.style.display = '';
    markArcCompleted(state.arc.id);
    const arcIndex = getAllArcsFlat().findIndex(arc => arc.id === state.arc.id);
    awardArcBounty(state.arc.id, state.arc.bounty || (arcIndex + 1) * 1000);
    document.getElementById('continueActionImage').src = 'images/characters/btncontinue.png';
    document.getElementById('continueActionImage').alt = 'Choisir une récompense';
  }else if(player < cpu){
    matchWon = false;
    banner.src = 'images/characters/lose.png';
    banner.style.display = '';
    document.getElementById('continueActionImage').src = 'images/characters/btnexit.png';
    document.getElementById('continueActionImage').alt = 'Retour au menu principal';
  }else{
    matchWon = false;
    banner.src = 'images/characters/draw.png';
    banner.style.display = '';
    document.getElementById('continueActionImage').src = 'images/characters/btnexit.png';
    document.getElementById('continueActionImage').alt = 'Retour au menu principal';
  }
  overlay.classList.remove('hidden');
}

function showRewardChoice(){
  const rewardOverlay = document.getElementById('rewardOverlay');
  const rewardCards = document.getElementById('rewardCards');
  rewardCards.innerHTML = '';

  const save = loadSave();
  const ownedIds = new Set([...save.collection, ...save.crewOrder]);
  const arcPool = [...new Set(state.arc.deck)].filter(cardId => !ownedIds.has(cardId) && CARD_POOL[cardId]);
  const baseRewardCards = ['pirate1', 'pirate2', 'pirate3'];
  const rewardPool = arcPool.slice(0, 5);
  while(rewardPool.length < 5){
    rewardPool.push(baseRewardCards[Math.floor(Math.random() * baseRewardCards.length)]);
  }

  const revealedCount = Math.min(Math.max(state.playerCaptures - 1, 0), rewardPool.length);
  const revealedIndexes = new Set();
  while(revealedIndexes.size < revealedCount && rewardPool.length > 0){
    revealedIndexes.add(Math.floor(Math.random() * rewardPool.length));
  }
  rewardPool.forEach((cardId, index) => {
    const card = getCard(cardId);
    const rewardCard = document.createElement('button');
    rewardCard.type = 'button';
    rewardCard.className = `reward-card ${revealedIndexes.has(index) ? 'reward-face-up' : 'card-back'}`;
    if(revealedIndexes.has(index)){
      const face = makeCardEl(card, { owner:'player' });
      face.classList.add('reward-face');
      rewardCard.appendChild(face);
    }else{
      rewardCard.style.backgroundImage = 'url("images/characters/demo.png")';
    }
    rewardCard.addEventListener('click', () => {
      if(rewardCard.classList.contains('reward-disabled')) return;
      const revealed = makeCardEl(card, { owner:'player' });
      revealed.classList.add('reward-card', 'revealed');
      const allowBaseDuplicate = baseRewardCards.includes(card.id);
      if(!addCardToCollection(card.id, { allowBaseDuplicate })) return;
      document.getElementById('rewardRevealCard').innerHTML = '';
      document.getElementById('rewardRevealCard').appendChild(revealed);
      document.getElementById('rewardOverlay').classList.add('hidden');
      document.getElementById('rewardRevealOverlay').classList.remove('hidden');
      rewardCards.querySelectorAll('.reward-card').forEach(cardEl => cardEl.classList.add('reward-disabled'));
    });
    rewardCards.appendChild(rewardCard);
  });
  rewardOverlay.classList.remove('hidden');
}

/* ---------- Init ---------- */

document.getElementById('quitBtn').addEventListener('click', () => {
  window.location.href = 'menu.html';
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
