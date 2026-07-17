/* ==========================================================================
   galleryRenderer.js
   Constrói os componentes visuais de cada tipo de seção (feed, stories,
   destaques, perfil, paleta, tipografia) a partir de listas de imagens
   já resolvidas pelo loadPresentation.js.

   Cada função retorna um elemento DOM pronto para ser inserido —
   nenhuma delas conhece texto de cliente, apenas caminhos de imagem.
   Reaproveitadas tanto nos slides (1–8) quanto na etapa 9 (revisão).
   ========================================================================== */

/**
 * Mensagem de estado vazio — usada quando uma pasta não tem imagens.
 */
function emptyState(label) {
  const div = document.createElement('div');
  div.className = 'section-empty';
  div.textContent = `Nenhuma imagem encontrada em "${label}".`;
  return div;
}

/**
 * Grid quadriculado responsivo — usado em Feed, Paleta de Cores e Tipografia.
 * @param {string[]} images
 * @param {string} folderLabel - usado apenas na mensagem de estado vazio
 */
function renderGridGallery(images, folderLabel) {
  if (!images || images.length === 0) return emptyState(folderLabel);

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';

  images.forEach(src => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = '';
    item.appendChild(img);
    grid.appendChild(item);
  });

  return grid;
}

/**
 * Faixa horizontal vertical (proporção 9:16) — usada em Stories.
 * @param {string[]} images
 * @param {string} folderLabel
 */
function renderStoriesTrack(images, folderLabel) {
  if (!images || images.length === 0) return emptyState(folderLabel);

  const track = document.createElement('div');
  track.className = 'stories-track';

  images.forEach(src => {
    const item = document.createElement('div');
    item.className = 'story-item';
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = '';
    item.appendChild(img);
    track.appendChild(item);
  });

  return track;
}

/**
 * Extrai um rótulo legível a partir do nome do arquivo,
 * ex: "gallery/highlights/viagens.png" -> "Viagens".
 */
function labelFromFilename(path) {
  const nome = path.split('/').pop().replace(/\.[^.]+$/, '');
  const limpo = nome.replace(/[-_]+/g, ' ').trim();
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

/**
 * Faixa de círculos — usada em Destaques (highlights do Instagram).
 * @param {string[]} images
 * @param {string} folderLabel
 */
function renderHighlightsTrack(images, folderLabel) {
  if (!images || images.length === 0) return emptyState(folderLabel);

  const track = document.createElement('div');
  track.className = 'highlights-track';

  images.forEach(src => {
    const item = document.createElement('div');
    item.className = 'highlight-item';

    const circle = document.createElement('div');
    circle.className = 'highlight-circle';
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = '';
    circle.appendChild(img);

    const label = document.createElement('span');
    label.className = 'highlight-label';
    label.textContent = labelFromFilename(src);

    item.appendChild(circle);
    item.appendChild(label);
    track.appendChild(item);
  });

  return track;
}

/**
 * Quadro único centralizado — usado em Perfil do Instagram
 * (usa a primeira imagem encontrada na pasta).
 * @param {string[]} images
 * @param {string} folderLabel
 */
function renderSingleFrame(images, folderLabel) {
  if (!images || images.length === 0) return emptyState(folderLabel);

  const frame = document.createElement('div');
  frame.className = 'single-frame';
  const img = document.createElement('img');
  img.src = images[0];
  img.alt = '';
  frame.appendChild(img);
  return frame;
}
