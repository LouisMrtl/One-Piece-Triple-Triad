/* =========================================================
   UI HELPERS
   ========================================================= */

/**
 * Essaie de charger une image ; si elle n'existe pas (404), remplace
 * l'élément par un placeholder textuel (initiale ou emoji) au lieu
 * de laisser une icône d'image cassée. Utile tant que les vraies
 * images ne sont pas encore fournies.
 */
function attachImgFallback(imgEl, fallbackText){
  imgEl.addEventListener('error', () => {
    imgEl.style.display = 'none';
    const span = document.createElement('span');
    span.textContent = fallbackText;
    span.style.fontSize = '1.8rem';
    span.style.fontWeight = '800';
    imgEl.parentElement.appendChild(span);
  }, { once:true });
}

function initialsOf(name){
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

/**
 * Monte une animation "idle" 2 frames (a/b) dans `container`.
 * Alterne entre frameAUrl et frameBUrl en boucle. Si frameAUrl est
 * absent, affiche le fallback texte (comportement inchangé : le jeu
 * reste jouable sans aucune image).
 *
 * @param {HTMLElement} container élément qui recevra le background animé
 * @param {string} frameAUrl chemin de la frame A (ex: images/characters/luffy/a.png)
 * @param {string} frameBUrl chemin de la frame B (ex: images/characters/luffy/b.png)
 * @param {string} fallbackText texte affiché si les images sont absentes
 * @param {number} intervalMs durée d'affichage de chaque frame (0.5–0.8s conseillé)
 */
/**
 * Monte une animation "idle" à partir d'une liste de frames (1 à N images).
 * Ne garde que les frames qui existent réellement, puis boucle dessus.
 * Si aucune frame n'existe, affiche le fallback texte (comportement inchangé).
 */
function mountSpriteCycle(container, frameUrls, fallbackText, intervalMs = 650, onIntervalCreated = null){
  const probes = frameUrls.map(url => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  }));

  Promise.all(probes).then(results => {
    const validFrames = results.filter(Boolean);
    if(validFrames.length === 0){
      const span = document.createElement('span');
      span.textContent = fallbackText;
      span.style.fontSize = '1.6rem';
      span.style.fontWeight = '800';
      container.appendChild(span);
      return;
    }

    container.style.backgroundRepeat = 'no-repeat';
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';

    let i = 0;
    container.style.backgroundImage = `url("${validFrames[0]}")`;
    if(validFrames.length > 1){
      const id = setInterval(() => {
        i = (i + 1) % validFrames.length;
        container.style.backgroundImage = `url("${validFrames[i]}")`;
      }, intervalMs);
      if(onIntervalCreated) onIntervalCreated(id);
    }
  });
}
