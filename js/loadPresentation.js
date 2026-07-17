/* ==========================================================================
   loadPresentation.js
   Responsável por:
   1. Carregar presentation.json (única fonte de texto/configuração).
   2. Buscar automaticamente as imagens de cada pasta da galeria via
      /api/list-images — nenhum arquivo precisa ser listado manualmente.

   Não manipula o DOM. Apenas retorna dados prontos para o main.js usar.
   ========================================================================== */

/**
 * Carrega o arquivo presentation.json na raiz do projeto.
 * @returns {Promise<Object>}
 */
async function loadPresentation() {
  const res = await fetch('presentation.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Não foi possível carregar presentation.json');
  }
  return res.json();
}

/**
 * Busca a lista de imagens de uma pasta dentro de /gallery,
 * via serverless function (api/list-images.js).
 * Detecta automaticamente qualquer imagem presente na pasta.
 * @param {string} folder - ex: "gallery/feed"
 * @returns {Promise<string[]>} caminhos das imagens, já ordenados
 */
async function fetchFolderImages(folder) {
  try {
    const res = await fetch(`/api/list-images?folder=${encodeURIComponent(folder)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.images) ? data.images : [];
  } catch (err) {
    console.warn(`[loadPresentation] Falha ao listar imagens de "${folder}":`, err);
    return [];
  }
}

/**
 * Resolve todas as pastas de galeria definidas em presentation.json.secoes
 * em paralelo, retornando um mapa { chave: string[] de imagens }.
 * @param {Object} secoes - presentation.json.secoes
 * @returns {Promise<Object>}
 */
async function fetchAllGalleryImages(secoes) {
  const chaves = Object.keys(secoes);
  const listas = await Promise.all(chaves.map(chave => fetchFolderImages(secoes[chave].pasta)));

  const resultado = {};
  chaves.forEach((chave, i) => { resultado[chave] = listas[i]; });
  return resultado;
}
