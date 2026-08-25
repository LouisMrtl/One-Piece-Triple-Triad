/* =========================================================
   MENU — logique de menu.html
   ========================================================= */
function getShipLevelImg(completedCount){
  return `images/characters/ship${getShipLevel(completedCount)}.png`;
}

function getShipLevel(completedCount){
  return Math.min(5, Math.floor(completedCount / 2) + 1);
}

function getBounty(completedCount){
  return completedCount === 0 ? 0 : completedCount * 1000;
}

function renderCaptainHeader(){
  const save = loadSave();
  document.getElementById('captainName').textContent = save.profile.name || 'Pirate inconnu';
  const flag = FLAGS.find(f => f.id === save.profile.flagId);
  const img = document.getElementById('captainFlag');
  if(flag){
    img.src = flag.img;
    attachImgFallback(img, flag.fallback);
  }
  const shipLevel = getShipLevel(save.progress.completedArcs.length);
  document.getElementById('progressShip').src = getShipLevelImg(save.progress.completedArcs.length);
  document.getElementById('progressLevel').textContent = `Niv. ${shipLevel}`;
  const wantedFlag = document.getElementById('wantedFlag');
  wantedFlag.src = `images/characters/band${(FLAGS.findIndex(f => f.id === save.profile.flagId) % 10) + 1}.png`;
  document.getElementById('wantedPosterBounty').textContent = save.progress.bounty || 0;
}

let dragSrcIndex = null;
let confirmAction = null;

function showConfirmModal(message, action){
  document.getElementById('confirmMessage').textContent = message;
  confirmAction = action;
  document.getElementById('confirmOverlay').classList.remove('hidden');
}

function renderCrewFooter(){
  const save = loadSave();
  const order = getCrewOrder(save);
  const track = document.getElementById('crewFooterTrack');
  track.innerHTML = '';

  order.forEach((id, idx) => {
    const card = getCard(id);
    const item = document.createElement('div');
    item.className = 'crew-footer-item' + (idx < 5 ? ' active' : '');
    item.draggable = true;
    item.dataset.index = idx;

    const sprite = document.createElement('div');
    sprite.className = 'crew-footer-sprite';
    mountSpriteCycle(
      sprite,
      [`images/characters/${getCardImageId(id)}/${getCardImageId(id)}a.png`, `images/characters/${getCardImageId(id)}/${getCardImageId(id)}b.png`],
      initialsOf(card.name),
      450
    );
    item.appendChild(sprite);

    const removeButton = document.createElement('button');
    removeButton.className = 'crew-remove';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.title = `Retirer ${card.name} du deck actif`;
    removeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const save = loadSave();
          const ownedCount = getCrewOrder(save).length;
      if(ownedCount <= 5){
        showConfirmModal('Il faut conserver au moins 5 cartes pour jouer.');
        return;
      }
      showConfirmModal('Voulez-vous vraiment retirer ce personnage ?', () => {
        removeCrewMember(id);
        renderCrewFooter();
      });
    });
    item.appendChild(removeButton);

    item.addEventListener('dragstart', (e) => {
      dragSrcIndex = idx;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      document.querySelectorAll('.crew-footer-item').forEach(el => el.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const targetIdx = idx;
      if(dragSrcIndex === null || dragSrcIndex === targetIdx) return;

      const newOrder = [...order];
      const [moved] = newOrder.splice(dragSrcIndex, 1);
      newOrder.splice(targetIdx, 0, moved);

      saveCrewOrder(newOrder);
      dragSrcIndex = null;
      renderCrewFooter();
    });

    track.appendChild(item);
  });
}

function showStoryView(){
  document.getElementById('modeSelectView').classList.add('hidden');
  document.getElementById('storySelectView').classList.remove('hidden');
  document.body.classList.add('bg-menu-alt');
  renderSagaList();
}
function showModeView(){
  document.getElementById('storySelectView').classList.add('hidden');
  document.getElementById('modeSelectView').classList.remove('hidden');
  document.body.classList.remove('bg-menu-alt');
}

function renderSagaList(){
  const save = loadSave();
  const flatArcs = getAllArcsFlat();
  const container = document.getElementById('sagaList');
  container.innerHTML = '';

  SAGAS.forEach(saga => {
    const block = document.createElement('div');
    block.className = 'saga-block';

    const title = document.createElement('h3');
    title.textContent = saga.name;
    block.appendChild(title);

    const list = document.createElement('div');
    list.className = 'arc-list';

    saga.arcs.forEach(arc => {
      const idx = flatArcs.findIndex(a => a.id === arc.id);
      const completed = save.progress.completedArcs.includes(arc.id);
      const unlocked = save.debugAll || idx === 0 || save.progress.completedArcs.includes(flatArcs[idx-1].id);
      const playable = unlocked && (arc.status === 'ready' || save.debugAll);

      const tile = document.createElement('div');
      tile.className = 'arc-tile' + (playable ? '' : ' locked');

      const name = document.createElement('div');
      name.className = 'arc-name';
      name.textContent = (completed ? '✅ ' : (unlocked ? '' : '🔒 ')) + arc.name;
      tile.appendChild(name);

      const enemy = document.createElement('div');
      enemy.className = 'arc-enemy';
      enemy.textContent = unlocked
        ? `vs ${arc.enemyName}${arc.status==='todo' && !save.debugAll ? ' — bientôt disponible' : ''}`
        : 'Termine l\'arc précédent';
      tile.appendChild(enemy);

      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.textContent = '★'.repeat(arc.stars) + '☆'.repeat(5-arc.stars);
      tile.appendChild(stars);

      const chapter = document.createElement('img');
      chapter.className = 'chapter-icon';
      chapter.src = `images/characters/chap${Math.min(56, idx + 1)}${completed ? '' : 'off'}.png`;
      chapter.alt = completed ? 'Chapitre terminé' : 'Chapitre verrouillé';
      tile.prepend(chapter);

      if(playable){
        tile.addEventListener('click', () => {
          window.location.href = `game.html?arc=${arc.id}`;
        });
      }
      list.appendChild(tile);
    });

    block.appendChild(list);
    container.appendChild(block);
  });
}

function init(){
  renderCaptainHeader();
  renderCrewFooter();

  document.getElementById('storyModeBtn').addEventListener('click', showStoryView);
  document.getElementById('charactersModeBtn').addEventListener('click', () => {
    window.location.href = 'characters.html';
  });
  document.getElementById('randomModeBtn').addEventListener('click', () => {
    window.location.href = 'game.html?mode=random';
  });
  ['onlineModeBtn', 'charactersModeBtn', 'coliseumModeBtn', 'randomModeBtn'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {});
  });
  document.getElementById('backToModesBtn').addEventListener('click', showModeView);
  document.getElementById('unlockAllBtn').addEventListener('click', () => {
    unlockAllArcs();
    const save = loadSave();
    document.getElementById('unlockAllBtn').textContent = save.debugAll ? 'Bloquer tout' : 'Débloquer tout';
    renderSagaList();
  });
  document.getElementById('unlockAllBtn').textContent = loadSave().debugAll ? 'Bloquer tout' : 'Débloquer tout';
  document.getElementById('confirmCancel').addEventListener('click', () => {
    document.getElementById('confirmOverlay').classList.add('hidden');
    confirmAction = null;
  });
  document.getElementById('confirmAccept').addEventListener('click', () => {
    const action = confirmAction;
    document.getElementById('confirmOverlay').classList.add('hidden');
    confirmAction = null;
    if(action) action();
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'index.html';
  });
}

document.addEventListener('DOMContentLoaded', init);
