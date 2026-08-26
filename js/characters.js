/* COLLECTION — classement chronologique fermé, sans catégorie orpheline */
const CHARACTER_SAGAS = [
  ['East Blue', '⚓', ['alvida','arlong','buggy','cabaji','coby','django','krieg','kuro','mohji','moji','sham','smoker','tashigi','ussop','zoro','sanji','nami','luffy','soldier','pir','cat','creig','jerry','gin','pearl','hamm','helmep','fuku','guy','gan','dandan','denden','eric','gaimon']],
  ['Alabasta', '☀', ['crocodile','dalton','mr1','mr2','mr4','pell','vivi','robin','chess','chooper','chopper','mushuru','bonney']],
  ['Skypiea', '☁', ['enel','ener','gedatsu','neptune','ohm','satori','shura','wiper','braham']],
  ['Water Seven / Enies Lobby', '⚙', ['franky','lucci','kaku','kalifa','fukurou','kumadori','spandam','blueno','paulie','iceburg']],
  ['Thriller Bark', '☠', ['brook','cindry','hogback','moria','moriha','perona','ryuma','jovenbrook','absalom']],
  ['Marineford', '⚔', ['ace','akainu','aokiji','barbablanca','barbanegra','garp','hancock','ivankov','kizaru','marco','mihawk','sengoku','shanks','whitey','vista','jozu','kuma','momonga','sentomaru','tsuru','sabaody','impel','marine','hannyabal','doma','beckman','atomos','blenheim','docq']],
  ['Île des Hommes-Poissons', '🐚', ['hody','jinbe','jimbei','ikaros','dosun','daruma','hyouzou','wadatsumi','zeo','shirahoshi','papug','fishert','caribou','coribu','giojin3']],
  ['Dressrosa', '🌹', ['bellamy','doflamingo','law','sabo','sarkies','vergo','violet','kinemon','capone','caponne2','fujitora','baby5','caesar','frankidessrosa','burgesdessrosa','coliseocorrid','drago']],
  ['Whole Cake Island', '🍰', ['big','katakuri','sanji2','reiju','tamago','pekons','carrot','hancock','foxy','hammon','amr1']],
  ['Wano / Kaido', '🌸', ['kaido','kinemon','momonosuke','orochi','shogun','tashigi2','zoro2','luffy2','apoo','apu2','drake2','hawki2','killer2','kid','basil','oden']],
  ['Egghead', '🔬', ['vegapunk','sentomaru2','pacifista','lucci2','kizaru2','bonney2','atlas','lilith']],
  ['Elbaf et saga finale', '🌊', ['roger','roger2','shiki','rayleigh','yasop','vanauger','urouge','dragon','barbanegra2']]
];

const CHARACTER_SAGA_ORDER = CHARACTER_SAGAS.map(([name]) => name);
const CHARACTER_SAGA_BY_ID = new Map(CHARACTER_SAGAS.flatMap(([name,, ids]) => ids.map(id => [id, name])));

function getCharacterSaga(id){
  return CHARACTER_SAGA_BY_ID.get(id) || 'East Blue';
}

function imageLoads(url){
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

async function hasRequiredCharacterImages(id){
  const imageId = getCardImageId(id);
  const basePath = `images/characters/${imageId}/${imageId}`;
  const [portrait, frameA, frameB] = await Promise.all([
    imageLoads(`${basePath}.png`),
    imageLoads(`${basePath}a.png`),
    imageLoads(`${basePath}b.png`)
  ]);
  return portrait && frameA && frameB;
}

function mountNaturalSprite(container, card){
  const imageId = getCardImageId(card.id);
  const frameUrls = [
    `images/characters/${imageId}/${imageId}a.png`,
    `images/characters/${imageId}/${imageId}b.png`
  ];
  const sprite = document.createElement('img');
  sprite.className = 'character-sprite-image';
  sprite.src = frameUrls[0];
  sprite.alt = `${card.name}, sprite`;
  container.appendChild(sprite);
  let frameIndex = 0;
  window.setInterval(() => {
    frameIndex = (frameIndex + 1) % frameUrls.length;
    sprite.src = frameUrls[frameIndex];
  }, 450);
}

function getOwnedCharacterIds(){
  const save = loadSave();
  const removed = new Set(save.removedCrew || []);
  return new Set([...save.collection, ...save.crewOrder]
    .filter(id => !removed.has(id))
    .map(id => getCardImageId(id)));
}

function updateOwnershipStatuses(){
  const ownedIds = getOwnedCharacterIds();
  document.querySelectorAll('[data-character-id]').forEach(item => {
    const isOwned = ownedIds.has(item.dataset.characterId);
    item.classList.toggle('is-owned', isOwned);
    item.classList.toggle('is-unowned', !isOwned);
    item.setAttribute('aria-label', `${item.dataset.characterName}${isOwned ? ', obtenu' : ', non obtenu'}`);
    const badge = item.querySelector('.ownership-badge');
    if(badge) badge.textContent = isOwned ? 'Obtenu' : 'À obtenir';
  });
}

async function renderCharacters(){
  const grid = document.getElementById('charactersGrid');
  grid.classList.add('arc-columns');
  const validIds = (await Promise.all(
    CHARACTER_ASSETS.map(async id => ({ id, valid: await hasRequiredCharacterImages(id) }))
  )).filter(entry => entry.valid).map(entry => entry.id);
  const cards = validIds.map(id => {
    const base = CARD_POOL[id];
    const legendary = ['roger', 'shanks', 'whitebeard', 'barbablanca', 'garp', 'sengoku', 'rayleigh'].includes(id);
    const veryWeak = ['soldier', 'soldierph', 'pir1', 'pir2', 'pir3', 'btnonline', 'cardneed', 'carbon', 'stay', 'tabl'];
    const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const values = base ? [base.top, base.right, base.bottom, base.left]
      : legendary ? [12, 12, 12, 12]
      : veryWeak.includes(id) ? [1, 1, 0, 0]
      : hash % 3 === 0
        ? [8 + hash % 4, 5 + (hash * 3) % 5, 5 + (hash * 5) % 5, 5 + (hash * 7) % 5]
        : [3 + hash % 5, 2 + (hash * 3) % 6, 2 + (hash * 5) % 5, 2 + (hash * 7) % 6];
    return {
      id,
      name: base ? base.name : id.replace(/[0-9]+/g, ' $&').replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
      top: values[0], right: values[1], bottom: values[2], left: values[3],
      portrait: `images/characters/${getCardImageId(id)}/${getCardImageId(id)}.png`,
      power: values.reduce((sum, value) => sum + value, 0),
    };
  }).sort((a, b) => a.power - b.power || a.name.localeCompare(b.name));

  const grouped = cards.reduce((groups, card) => {
    const saga = getCharacterSaga(card.id);
    (groups[saga] ||= []).push(card);
    return groups;
  }, {});

  CHARACTER_SAGA_ORDER.forEach(saga => {
    const sagaCards = grouped[saga] || [];
    const section = document.createElement('section');
    section.className = 'character-saga';
    section.dataset.saga = saga;
    const sagaMeta = CHARACTER_SAGAS.find(([name]) => name === saga);
    section.innerHTML = `<header class="character-saga-heading"><span class="saga-mark">${sagaMeta[1]}</span><div><h2>${saga}</h2><p class="small">${sagaCards.length} personnage${sagaCards.length > 1 ? 's' : ''}</p></div></header>`;
    const sagaGrid = document.createElement('div');
    sagaGrid.className = 'characters-grid';
    sagaCards.forEach(card => {
    const item = document.createElement('article');
    item.className = 'character-entry';
    item.dataset.characterId = card.id;
    item.dataset.characterName = card.name;
    const header = document.createElement('header');
    header.className = 'character-card-header';
    header.innerHTML = `<h2>${card.name}</h2><span class="ownership-badge" aria-hidden="true"></span>`;

    const visual = document.createElement('div');
    visual.className = 'character-visual';
    const cardEl = document.createElement('div');
    cardEl.className = 'card character-card';
    const art = document.createElement('div');
    art.className = 'card-art';
    const image = document.createElement('img');
    image.className = 'card-main-art';
    image.src = card.portrait;
    image.alt = card.name;
    attachImgFallback(image, initialsOf(card.name));
    art.appendChild(image);
    cardEl.appendChild(art);
    ['top', 'right', 'bottom', 'left'].forEach(side => {
      const stat = document.createElement('span');
      stat.className = `stat ${side}`;
      stat.textContent = displayCardValue(card[side]);
      cardEl.appendChild(stat);
    });

    visual.appendChild(cardEl);
    const sprite = document.createElement('div');
    sprite.className = 'character-sprite';
    mountNaturalSprite(sprite, card);

    const body = document.createElement('div');
    body.className = 'character-card-body';
    body.append(visual, sprite);

    const footer = document.createElement('footer');
    footer.className = 'character-card-footer';
    footer.innerHTML = `<span>Force totale</span><strong>${card.power}</strong>`;
    item.append(header, body, footer);
      sagaGrid.appendChild(item);
    });
    section.appendChild(sagaGrid);
    grid.appendChild(section);
  });
  updateOwnershipStatuses();
}

document.getElementById('charactersBackBtn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});
document.addEventListener('DOMContentLoaded', renderCharacters);
window.addEventListener('storage', event => {
  if(event.key === STORAGE_KEY) updateOwnershipStatuses();
});
window.addEventListener('pageshow', updateOwnershipStatuses);
document.addEventListener('visibilitychange', () => {
  if(!document.hidden) updateOwnershipStatuses();
});
