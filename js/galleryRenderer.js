/* ==========================================================================
   galleryRenderer.js
   Constrói os componentes visuais de cada tipo de seção (feed, stories,
   destaques, perfil, paleta, tipografia) a partir de listas de imagens
   declaradas diretamente no array "imagens" de cada seção do presentation.json.

   Cada função retorna um elemento DOM pronto para ser inserido —
   nenhuma delas conhece texto de cliente, apenas caminhos de imagem.
   Reaproveitadas tanto nos slides (1–8) quanto na etapa 9 (revisão).

   Cada elemento raiz recebe, além da classe base (ex: .gallery-grid),
   uma segunda classe com o tipo da seção (feed, stories, colors, fonts,
   profile, highlights), para permitir estilos CSS independentes por
   seção sem alterar o layout ou a lógica de renderização existente.
   ========================================================================== */

/**
 * Mensagem de estado vazio — usada quando o array "imagens" da seção está vazio.
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
 * @param {string} sectionLabel - usado apenas na mensagem de estado vazio
 * @param {string} [sectionType] - classe extra adicionada ao elemento raiz (ex: "feed", "colors", "fonts")
 */
function renderGridGallery(images, sectionLabel, sectionType) {
  if (!images || images.length === 0) return emptyState(sectionLabel);

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  if (sectionType) grid.classList.add(sectionType);

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
 * @param {string} sectionLabel
 * @param {string} [sectionType] - classe extra adicionada ao elemento raiz (ex: "stories")
 */
function renderStoriesTrack(images, sectionLabel, sectionType) {
  if (!images || images.length === 0) return emptyState(sectionLabel);

  const track = document.createElement('div');
  track.className = 'stories-track';
  if (sectionType) track.classList.add(sectionType);

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
 * @param {string} sectionLabel
 * @param {string} [sectionType] - classe extra adicionada ao elemento raiz (ex: "highlights")
 */
function renderHighlightsTrack(images, sectionLabel, sectionType) {
  if (!images || images.length === 0) return emptyState(sectionLabel);

  const track = document.createElement('div');
  track.className = 'highlights-track';
  if (sectionType) track.classList.add(sectionType);

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
 * Galeria de Perfil — múltiplos mockups lado a lado (componente próprio, modular).
 * Renderiza todas as imagens do array em linha, com responsividade.
 * @param {string[]} images
 * @param {string} sectionLabel
 * @param {string} [sectionType] - classe extra adicionada ao elemento raiz (ex: "profile")
 */
function renderProfileGallery(images, sectionLabel, sectionType) {
  if (!images || images.length === 0) return emptyState(sectionLabel);

  const gallery = document.createElement('div');
  gallery.className = 'profile-gallery';
  if (sectionType) gallery.classList.add(sectionType);

  images.forEach(src => {
    const item = document.createElement('div');
    item.className = 'profile-item';
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = '';
    item.appendChild(img);
    gallery.appendChild(item);
  });

  return gallery;
}

/**
 * Quadro único centralizado — usado em Perfil do Instagram (DEPRECATED).
 * (usa a primeira imagem do array "imagens").
 * @deprecated Use renderProfileGallery() em vez disso.
 * @param {string[]} images
 * @param {string} sectionLabel
 * @param {string} [sectionType] - classe extra adicionada ao elemento raiz (ex: "profile")
 */
function renderSingleFrame(images, sectionLabel, sectionType) {
  if (!images || images.length === 0) return emptyState(sectionLabel);

  const frame = document.createElement('div');
  frame.className = 'single-frame';
  if (sectionType) frame.classList.add(sectionType);
  const img = document.createElement('img');
  img.src = images[0];
  img.alt = '';
  frame.appendChild(img);
  return frame;
}
