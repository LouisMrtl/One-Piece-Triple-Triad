/* =========================================================
   PROFIL — logique de index.html
   ========================================================= */

let selectedFlagId = null;

function renderFlagGrid(){
  const grid = document.getElementById('flagGrid');
  grid.innerHTML = '';
  FLAGS.forEach(flag => {
    const el = document.createElement('div');
    el.className = 'flag-option';
    el.dataset.flagId = flag.id;
    el.title = flag.label;

    const img = document.createElement('img');
    img.src = flag.img;
    img.alt = flag.label;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:8px;';
    attachImgFallback(img, flag.fallback);
    el.appendChild(img);

    el.addEventListener('click', () => selectFlag(flag.id));
    grid.appendChild(el);
  });
}

function selectFlag(flagId){
  selectedFlagId = flagId;
  document.querySelectorAll('.flag-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.flagId === flagId);
  });
  validateForm();
}

function validateForm(){
  const name = document.getElementById('pname').value.trim();
  document.getElementById('startBtn').disabled = !(name.length >= 2 && selectedFlagId);
}

function init(){
  renderFlagGrid();
  document.getElementById('pname').addEventListener('input', validateForm);
  document.getElementById('startBtn').addEventListener('click', () => {
    const name = document.getElementById('pname').value.trim();
    if(name.length < 2 || !selectedFlagId) return;
    saveProfile(name, selectedFlagId);
    window.location.href = 'menu.html';
  });
}

document.addEventListener('DOMContentLoaded', init);
