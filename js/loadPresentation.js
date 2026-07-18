/* ==========================================================================
   loadPresentation.js
   Responsável exclusivamente por carregar o presentation.json.

   Projeto 100% estático: nenhuma chamada de API, nenhuma detecção
   automática de arquivos em runtime. Todas as imagens de cada seção
   já vêm resolvidas dentro do próprio presentation.json, no array
   "imagens" de cada seção.
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
