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
  document.getElementById('captainShip').src = getShipLevelImg(save.progress.completedArcs.length);
  document.getElementById('shipLevel').textContent = `Niveau ${shipLevel}`;
  document.getElementById('wantedBounty').textContent = `${getBounty(save.progress.completedArcs.length)} B`;
  const wantedFlag = document.getElementById('wantedFlag');
  wantedFlag.src = `images/characters/band${(FLAGS.findIndex(f => f.id === save.profile.flagId) % 10) + 1}.png`;
  document.getElementById('wantedPosterBounty').textContent = getBounty(save.progress.completedArcs.length);
}

let dragSrcIndex = null;

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
      [`images/characters/${id}/${id}a.png`, `images/characters/${id}/${id}b.png`],
      initialsOf(card.name),
      450
    );
    item.appendChild(sprite);

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
      const unlocked = idx === 0 || save.progress.completedArcs.includes(flatArcs[idx-1].id);
      const playable = unlocked && arc.status === 'ready';

      const tile = document.createElement('div');
      tile.className = 'arc-tile' + (playable ? '' : ' locked');

      const name = document.createElement('div');
      name.className = 'arc-name';
      name.textContent = (completed ? '✅ ' : (unlocked ? '' : '🔒 ')) + arc.name;
      tile.appendChild(name);

      const enemy = document.createElement('div');
      enemy.className = 'arc-enemy';
      enemy.textContent = unlocked
        ? `vs ${arc.enemyName}${arc.status==='todo' ? ' — bientôt disponible' : ''}`
        : 'Termine l\'arc précédent';
      tile.appendChild(enemy);

      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.textContent = '★'.repeat(arc.stars) + '☆'.repeat(5-arc.stars);
      tile.appendChild(stars);

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
  ['onlineModeBtn', 'charactersModeBtn', 'coliseumModeBtn', 'randomModeBtn'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {});
  });
  document.getElementById('backToModesBtn').addEventListener('click', showModeView);
  document.getElementById('resetBtn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'index.html';
  });
}

document.addEventListener('DOMContentLoaded', init);
