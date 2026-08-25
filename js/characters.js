/* COLLECTION — page de test des cartes et sprites */
const CHARACTER_SAGA_RULES = [
  ['East Blue', /^(alvida|arlong|buggy|cabaji|coby|django|krieg|kuro|mohji|moji|sham|smoker|tashigi|ussop|ussop2|zoro|sanji|nami|luffy|soldier|pir|cat|creig|jerry|gin|pearl|hamm|helmep|fuku)/i],
  ['Alabasta', /^(crocodile|dalton|dandan|mr[124]|pell|vivi|bonney|robin|chess|chooper|chopper|mushuru|wiper)/i],
  ['Skypiea', /^(enel|ener|gedatsu|jabra|neptune|ohm|satori|shura|wiper|braham)/i],
  ['Water 7 / Enies Lobby', /^(franky|lucci|kaku|kalifa|fukurou|jabra|kumadori|spandam|blueno|paulie|lucci)/i],
  ['Thriller Bark', /^(brook|cindry|hogback|moria|moriha|perona|ryuma|jovenbrook)/i],
  ['Marineford', /^(ace|akainu|aokiji|barbablanca|barbanegra|garp|hancock|ivankov|kizaru|marco|mihawk|sengoku|shanks|whitey|vista|jozu|kuma|momonga|sentomaru|tsuru)/i],
  ['Île des Hommes-Poissons', /^(hody|jinbe|jimbei|ikaros|dosun|daruma|hyouzou|wadatsumi|zeo|neptune|shirahoshi|papug)/i],
  ['Dressrosa', /^(bellamy|doflamingo|law|sabo|sarkies|vergo|violet|kinemon|capone|fujitora)/i],
  ['Whole Cake Island', /^(big|katakuri|sanji2|reiju|tamago|pekons|carrot)/i],
  ['Wano', /^(kaido|kinemon|momonosuke|orochi|shogun|tashigi2|zoro2|luffy2)/i],
  ['Elbaf', /^(roger|roger2|shiki|rayleigh|yasop|vanauger|urouge|kid|killer)/i],
];

function getCharacterSaga(id){
  const rule = CHARACTER_SAGA_RULES.find(([, pattern]) => pattern.test(id));
  return rule ? rule[0] : 'Autres personnages';
}

function renderCharacters(){
  const grid = document.getElementById('charactersGrid');
  const cards = CHARACTER_ASSETS.map(id => {
    const base = CARD_POOL[id];
    const legendary = ['roger', 'shanks', 'whitebeard', 'barbablanca', 'garp', 'sengoku', 'rayleigh'].includes(id);
    const values = base ? [base.top, base.right, base.bottom, base.left] : legendary ? [10, 11, 12, 10] : [1, 1, 0, 0];
    return {
      id,
      name: base ? base.name : id.replace(/[0-9]+/g, ' $&').replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
      top: values[0], right: values[1], bottom: values[2], left: values[3],
      portrait: `images/characters/${id}/${id}.png`,
      power: values.reduce((sum, value) => sum + value, 0),
    };
  }).sort((a, b) => a.power - b.power || a.name.localeCompare(b.name));

  const grouped = cards.reduce((groups, card) => {
    const saga = getCharacterSaga(card.id);
    (groups[saga] ||= []).push(card);
    return groups;
  }, {});

  Object.entries(grouped).forEach(([saga, sagaCards]) => {
    const section = document.createElement('section');
    section.className = 'character-saga';
    section.innerHTML = `<h2>${saga}</h2>`;
    const sagaGrid = document.createElement('div');
    sagaGrid.className = 'characters-grid';
    sagaCards.forEach(card => {
    const item = document.createElement('article');
    item.className = 'character-entry';

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

    const details = document.createElement('div');
    details.className = 'character-details';
    details.innerHTML = `<h2>${card.name}</h2><strong>Force totale : ${card.power}</strong>`;
    const sprite = document.createElement('div');
    sprite.className = 'character-sprite';
    mountSpriteCycle(sprite, [
      `images/characters/${card.id}/${card.id}a.png`,
      `images/characters/${card.id}/${card.id}b.png`
    ], initialsOf(card.name), 450);
    details.appendChild(sprite);
    item.append(cardEl, details);
      sagaGrid.appendChild(item);
    });
    section.appendChild(sagaGrid);
    grid.appendChild(section);
  });
}

document.getElementById('charactersBackBtn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});
document.addEventListener('DOMContentLoaded', renderCharacters);
