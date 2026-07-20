/* ==========================================================================
   main.js
   Ponto de entrada da aplicação.

   Monta TODO o conteúdo textual e visual a partir de presentation.json
   — projeto 100% estático, sem API, sem serverless function, sem Node.
   Cada seção de galeria já traz seu próprio array "imagens" dentro do
   presentation.json; o index.html não contém texto nem caminhos de
   imagem além dos ativos fixos de estrutura (logo/hero/favicon).

   Ordem de execução:
   1. Carrega presentation.json
   2. Constrói os slides 1–8, usando diretamente data.secoes[x].imagens
   3. Inicia o SlideController
   4. Ao chegar na última etapa, constrói a página de revisão (etapa 9)
      reaproveitando os mesmos dados já carregados
   ========================================================================== */

// pequenos textos de interface (chrome do produto, não conteúdo do cliente)
const UI_TEXT = {
  navHint: 'Clique, use as setas ou deslize para navegar',
  reviewEyebrowFallback: 'Apresentação Completa',
};

// mapeia cada chave de "secoes" no JSON para o tipo de componente visual
const SECTION_RENDERERS = {
  feed: renderGridGallery,
  stories: renderStoriesTrack,
  destaques: renderHighlightsTrack,
  perfil: renderProfileGallery,
  paleta: renderGridGallery,
  tipografia: renderGridGallery,
};

// mapeia cada chave de "secoes" no JSON para a classe CSS de tipo de galeria
// (usada para estilizar cada seção de forma independente, sem afetar o layout base)
const SECTION_CLASS = {
  feed: 'feed',
  stories: 'stories',
  destaques: 'highlights',
  perfil: 'profile',
  paleta: 'colors',
  tipografia: 'fonts',
};

// ordem fixa de exibição das seções de galeria (etapas 3 a 8)
const SECTION_ORDER = ['feed', 'stories', 'destaques', 'perfil', 'paleta', 'tipografia'];

(async function bootstrap() {
  const app = document.getElementById('app');

  let data;
  try {
    data = await loadPresentation();
  } catch (err) {
    app.innerHTML = '<div class="loading-state">Não foi possível carregar presentation.json. Sirva este projeto por um servidor local ou verifique o deploy.</div>';
    console.error(err);
    return;
  }

  document.title = `${data.projeto} — ${data.cliente}`;

  // remove o estado de "Carregando…" antes de montar o conteúdo real
  app.innerHTML = '';

  // ------------------------------------------------------------------
  // construção dos elementos de navegação fixos
  // ------------------------------------------------------------------
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';

  const navHint = document.createElement('div');
  navHint.className = 'nav-hint';
  navHint.textContent = UI_TEXT.navHint;

  const prevZone = document.createElement('div');
  prevZone.className = 'nav-zone prev';
  const nextZone = document.createElement('div');
  nextZone.className = 'nav-zone next';

  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'slides';

  app.appendChild(progressBar);
  app.appendChild(slidesContainer);
  app.appendChild(navHint);
  app.appendChild(prevZone);
  app.appendChild(nextZone);

  // ------------------------------------------------------------------
  // etapa 1 — capa
  // ------------------------------------------------------------------
  const slideCover = document.createElement('section');
  slideCover.className = 'slide slide-cover';
  slideCover.innerHTML = `
    <div class="wrap">
      ${data.capa && data.capa.logo ? `<img class="cover-logo" src="${data.capa.logo}" alt="${data.cliente}">` : ''}
      <h1 class="slide-title-row cover-title"><span>${data.projeto}</span></h1>
      <p class="cover-sub">${data.subtitulo || ''}</p>
    </div>
  `;
  slidesContainer.appendChild(slideCover);

  // ------------------------------------------------------------------
  // etapa 2 — introdução
  // ------------------------------------------------------------------
  const intro = data.introducao || {};
  const slideIntro = document.createElement('section');
  slideIntro.className = 'slide slide-intro';
  slideIntro.innerHTML = `
    <div class="wrap">
      <div>
        <div class="eyebrow slide-eyebrow"><span class="line"></span>${intro.eyebrow || ''}</div>
        <h2 class="slide-title-row section-title"><span>${intro.titulo || ''}</span></h2>
        <p class="intro-text slide-sub" style="margin-top:24px;">${intro.texto || ''}</p>
      </div>
      ${intro.imagem ? `<div class="intro-media"><img src="${intro.imagem}" alt=""></div>` : ''}
    </div>
  `;
  slidesContainer.appendChild(slideIntro);

  // ------------------------------------------------------------------
  // etapas 3–8 — seções de galeria (feed, stories, destaques, perfil, paleta, tipografia)
  // ------------------------------------------------------------------
  const gallerySlides = {};

  SECTION_ORDER.forEach(chave => {
    const secao = data.secoes[chave];
    if (!secao) return;

    const slide = document.createElement('section');
    slide.className = `slide slide-gallery slide-${chave}`;

    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    const head = document.createElement('div');
    head.className = 'slide-head';
    head.innerHTML = `
      <div class="eyebrow slide-eyebrow"><span class="line"></span>${secao.eyebrow || ''}</div>
      <h2 class="slide-title-row section-title"><span>${secao.titulo || ''}</span></h2>
    `;
    wrap.appendChild(head);

    const renderer = SECTION_RENDERERS[chave] || renderGridGallery;
    wrap.appendChild(renderer(secao.imagens, secao.eyebrow || chave, SECTION_CLASS[chave]));

    slide.appendChild(wrap);
    slidesContainer.appendChild(slide);
    gallerySlides[chave] = slide;
  });

  // ------------------------------------------------------------------
  // container da etapa 9 — apresentação completa (populado só ao chegar)
  // ------------------------------------------------------------------
  const fullReview = document.createElement('div');
  fullReview.className = 'full-review';
  fullReview.id = 'fullReview';
  app.appendChild(fullReview);

  function buildFullReview() {
    const revisao = data.revisao || {};

    let html = `
      <section class="review-section review-hero reveal">
        <div class="wrap">
          ${data.capa && data.capa.logo ? `<img class="cover-logo" src="${data.capa.logo}" alt="${data.cliente}">` : ''}
          <h1 class="cover-title">${data.projeto}</h1>
          <p class="cover-sub">${data.subtitulo || ''}</p>
        </div>
      </section>
    `;

    if (intro.texto || intro.imagem) {
      html += `
        <section class="review-section reveal">
          <div class="wrap slide-intro">
            <div class="wrap" style="padding:0;">
              <div>
                <div class="eyebrow"><span class="line"></span>${intro.eyebrow || ''}</div>
                <h2 class="section-title">${intro.titulo || ''}</h2>
                <p class="intro-text" style="margin-top:24px;">${intro.texto || ''}</p>
              </div>
              ${intro.imagem ? `<div class="intro-media"><img src="${intro.imagem}" alt=""></div>` : ''}
            </div>
          </div>
        </section>
      `;
    }

    fullReview.innerHTML = html;

    // reconstrói cada seção de galeria reaproveitando os mesmos dados e renderers
    SECTION_ORDER.forEach(chave => {
      const secao = data.secoes[chave];
      if (!secao) return;

      const section = document.createElement('section');
      section.className = 'review-section reveal';

      const wrap = document.createElement('div');
      wrap.className = 'wrap';
      wrap.innerHTML = `
        <div class="eyebrow"><span class="line"></span>${secao.eyebrow || ''}</div>
        <h2 class="section-title" style="margin-bottom:36px;">${secao.titulo || ''}</h2>
      `;

      const renderer = SECTION_RENDERERS[chave] || renderGridGallery;
      wrap.appendChild(renderer(secao.imagens, secao.eyebrow || chave, SECTION_CLASS[chave]));

      section.appendChild(wrap);
      fullReview.appendChild(section);
    });

    const footer = document.createElement('div');
    footer.className = 'review-footer';
    footer.innerHTML = `
      <span>${data.cliente}</span>
      <span>${revisao.eyebrow || UI_TEXT.reviewEyebrowFallback}</span>
    `;
    fullReview.appendChild(footer);

    // ativa o fade-in geral e o reveal por seção conforme o scroll
    requestAnimationFrame(() => fullReview.classList.add('visible'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fullReview.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    fullReview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ------------------------------------------------------------------
  // inicializa a navegação
  // ------------------------------------------------------------------
  const allSlides = [slideCover, slideIntro, ...SECTION_ORDER.map(k => gallerySlides[k]).filter(Boolean)];

  new SlideController({
    slides: allSlides,
    progressBar,
    navHint,
    prevZone,
    nextZone,
    onEnterReview: buildFullReview,
  });
})();
